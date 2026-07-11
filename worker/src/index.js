/* =========================================================
   Learn with Palla — portal API (Cloudflare Worker)

   Sits between the static site and the Neon Postgres database
   so the database password never reaches the browser.

   Endpoints
     POST /api/session   body: { credential: <Google ID token>, deviceId }
       Verifies the token with Google, records the login
       (email + IP + browser), makes THIS device the account's single
       live session (any other device gets signed out), and answers:
         { status:"student", batchId }          registered, allowed
         { status:"trial" }                     not registered → free trial
         { status:"blocked", reason, limit }    too many machines / admin block
     GET /api/status?email=...&device=...
       Read-only recheck the portal runs on load and every few minutes.
       Answers { status:"signed_out" } when another device has since
       logged in (one live session per account, newest login wins).

   Tables (created in Neon):
     students(email pk, name, batch_id, status, machine_limit, created_at)
     logins(id, email, raw_email, name, ip, user_agent, device_id, is_student, created_at)
     sessions(email pk, device_id, updated_at)   -- the one live device per account

   Secrets: DATABASE_URL — set with `npx wrangler secret put DATABASE_URL`.

   Admin cheatsheet (run in the Neon SQL editor):
     add student    insert into students (email, batch_id) values ('x@gmail.com','jun26');
     unblock        delete from logins where email='x@gmail.com';        -- forget old machines
     or             update students set machine_limit=10 where email='x@gmail.com';
     manual block   update students set status='blocked' where email='x@gmail.com';
     who logged in  select email, ip, created_at from logins order by created_at desc limit 50;
     trial users    select distinct email from logins where is_student=false;
   ========================================================= */
import { neon } from "@neondatabase/serverless";

// Same Google OAuth client the portal signs in with.
const CLIENT_ID =
  "302634236502-gkdpddkai6ved64502qohp1c95ilttcj.apps.googleusercontent.com";

// Only the site (and localhost while developing) may call this API.
const ORIGIN_RE =
  /^(https:\/\/(www\.)?learnwithpalla\.com|https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ORIGIN_RE.test(origin)
      ? origin
      : "https://learnwithpalla.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    "Vary": "Origin",
  };
}

// Gmail-smart normalisation — must match normEmail() in portal.js.
function normEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  const at = e.indexOf("@");
  if (at < 0) return e;
  let local = e.slice(0, at);
  let domain = e.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+")[0].replace(/\./g, "");
    domain = "gmail.com";
  }
  return local + "@" + domain;
}

// Admin = students row with role='admin'. Admin API calls must carry an
// X-Admin-Token header; tokens are minted only on a verified Google
// sign-in by an admin, and expire after 30 days.
async function adminEmailFor(sql, request) {
  const token = (request.headers.get("X-Admin-Token") || "").slice(0, 64);
  if (!token) return null;
  const rows = await sql`
    select email from admin_tokens
    where token = ${token} and expires_at > now()`;
  return rows.length ? rows[0].email : null;
}

// Decide what a signed-in email may see. "Machines" are counted by the
// device id the portal stores in each browser's localStorage — NOT by IP,
// so a student whose network address changes is never wrongly blocked.
async function accessFor(sql, email) {
  const rows =
    await sql`select batch_id, status, machine_limit from students where email = ${email}`;
  if (!rows.length) return { status: "trial" };

  const st = rows[0];
  if (st.status === "blocked") {
    return { status: "blocked", reason: "admin", limit: st.machine_limit };
  }
  // Safety net only (single live session is the real control): count
  // just the last 30 days so replaced laptops / cleaned browsers stop
  // counting against honest students.
  const [{ machines }] = await sql`
    select count(distinct device_id)::int as machines
    from logins where email = ${email} and device_id <> ''
      and created_at > now() - interval '30 days'`;
  if (machines > st.machine_limit) {
    return { status: "blocked", reason: "machine_limit", limit: st.machine_limit, machines };
  }
  return { status: "student", batchId: st.batch_id };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get("Origin") || "");
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { ...cors, "Content-Type": "application/json" },
      });

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const sql = neon(env.DATABASE_URL);
    try {
      if (request.method === "POST" && url.pathname === "/api/session") {
        const body = await request.json().catch(() => ({}));
        if (!body.credential) return json({ error: "missing credential" }, 400);

        // Ask Google whether this ID token is genuine and meant for our app —
        // stops anyone from claiming to be a student with a hand-made request.
        const info = await (
          await fetch(
            "https://oauth2.googleapis.com/tokeninfo?id_token=" +
              encodeURIComponent(body.credential)
          )
        ).json();
        if (info.aud !== CLIENT_ID || info.email_verified !== "true" || !info.email) {
          return json({ error: "invalid token" }, 401);
        }

        const email = normEmail(info.email);
        const ip = request.headers.get("CF-Connecting-IP") || "";
        const ua = (request.headers.get("User-Agent") || "").slice(0, 300);
        const device = String(body.deviceId || "").slice(0, 64);

        const student = await sql`select 1 from students where email = ${email}`;
        await sql`
          insert into logins (email, raw_email, name, ip, user_agent, device_id, is_student)
          values (${email}, ${info.email}, ${info.name || ""}, ${ip}, ${ua},
                  ${device}, ${student.length > 0})`;

        // One live session per account: this device becomes the session,
        // and any previously signed-in device gets signed out on its
        // next recheck.
        if (device) {
          await sql`
            insert into sessions (email, device_id, updated_at)
            values (${email}, ${device}, now())
            on conflict (email) do update
              set device_id = ${device}, updated_at = now()`;
        }

        const res = { email, ...(await accessFor(sql, email)) };

        // Admin role: hand the browser a 30-day token for the admin API.
        const roleRows =
          await sql`select role from students where email = ${email}`;
        if (roleRows.length && roleRows[0].role === "admin") {
          const token = crypto.randomUUID();
          await sql`delete from admin_tokens where expires_at < now()`;
          await sql`
            insert into admin_tokens (token, email, expires_at)
            values (${token}, ${email}, now() + interval '30 days')`;
          res.admin = true;
          res.adminToken = token;
        }

        return json(res);
      }

      if (request.method === "GET" && url.pathname === "/api/status") {
        const email = normEmail(url.searchParams.get("email"));
        if (!email.includes("@")) return json({ error: "bad email" }, 400);

        // If another device has logged in since, this one is signed out.
        const device = String(url.searchParams.get("device") || "").slice(0, 64);
        if (device) {
          const live =
            await sql`select device_id from sessions where email = ${email}`;
          if (live.length && live[0].device_id !== device) {
            return json({ status: "signed_out" });
          }
        }
        return json(await accessFor(sql, email));
      }

      /* ---- LinkedIn sign-in for the resume builder ----
         OpenID Connect: LinkedIn shares ONLY name, email and photo.
         Secrets: LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET
         (npx wrangler secret put ...). Redirect URL to register in the
         LinkedIn app: <worker>/api/linkedin/callback                  */
      const LI_REDIRECT = url.origin + "/api/linkedin/callback";
      const LI_RETURN = "https://learnwithpalla.com/resume.html";

      if (url.pathname === "/api/linkedin/enabled") {
        return json({ enabled: !!(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) });
      }

      if (url.pathname === "/api/linkedin/start") {
        if (!env.LINKEDIN_CLIENT_ID) return json({ error: "LinkedIn sign-in not configured" }, 503);
        const stateTok = crypto.randomUUID();
        const auth = "https://www.linkedin.com/oauth/v2/authorization?response_type=code" +
          "&client_id=" + encodeURIComponent(env.LINKEDIN_CLIENT_ID) +
          "&redirect_uri=" + encodeURIComponent(LI_REDIRECT) +
          "&scope=" + encodeURIComponent("openid profile email") +
          "&state=" + stateTok;
        return new Response(null, {
          status: 302,
          headers: {
            "Location": auth,
            "Set-Cookie": "li_state=" + stateTok +
              "; Max-Age=600; Path=/api/linkedin; Secure; HttpOnly; SameSite=Lax",
          },
        });
      }

      if (url.pathname === "/api/linkedin/callback") {
        const code = url.searchParams.get("code");
        const st = url.searchParams.get("state") || "";
        const ck = (request.headers.get("Cookie") || "").match(/li_state=([\w-]+)/);
        if (!code || !ck || ck[1] !== st) {
          return Response.redirect(LI_RETURN + "#lierr=cancelled", 302);
        }
        const tok = await (await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: env.LINKEDIN_CLIENT_ID,
            client_secret: env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: LI_REDIRECT,
          }),
        })).json();
        if (!tok.access_token) return Response.redirect(LI_RETURN + "#lierr=token", 302);

        const info = await (await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { "Authorization": "Bearer " + tok.access_token },
        })).json();
        const payload = {
          name: info.name ||
            ((info.given_name || "") + " " + (info.family_name || "")).trim(),
          email: info.email || "",
          picture: info.picture || "",
        };
        // Hand the profile to the resume page via the URL fragment
        // (fragments never reach servers or logs).
        const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
          .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        return Response.redirect(LI_RETURN + "#li=" + b64, 302);
      }

      if (url.pathname === "/api/linkedin/photo") {
        // Proxy the LinkedIn CDN photo so the browser can read it
        // (licdn.com sends no CORS headers). LinkedIn hosts only.
        const p = url.searchParams.get("url") || "";
        if (!/^https:\/\/media[\w.-]*\.licdn\.com\//.test(p)) return json({ error: "bad url" }, 400);
        const r = await fetch(p);
        return new Response(r.body, {
          status: r.status,
          headers: {
            ...cors,
            "Content-Type": r.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "private, max-age=300",
          },
        });
      }

      /* ---- Admin API (X-Admin-Token required on every call) ---- */
      if (url.pathname.startsWith("/api/admin/")) {
        const adminEmail = await adminEmailFor(sql, request);
        if (!adminEmail) return json({ error: "unauthorized" }, 401);

        if (request.method === "GET" && url.pathname === "/api/admin/users") {
          const students = await sql`
            select s.email, s.batch_id, s.status, s.role, s.machine_limit,
              (select count(distinct l.device_id)::int from logins l
                where l.email = s.email and l.device_id <> ''
                  and l.created_at > now() - interval '30 days') as machines,
              (select max(l.created_at) from logins l
                where l.email = s.email) as last_login
            from students s order by s.email`;
          const trials = await sql`
            select email,
                   min(created_at) as first_seen,
                   max(created_at) as last_seen,
                   count(*)::int as visits
            from logins
            where email not in (select email from students)
            group by email order by last_seen desc`;
          const batches =
            await sql`select id, name from batches order by created_at`;
          return json({ students, trials, batches });
        }

        if (request.method === "POST") {
          const body = await request.json().catch(() => ({}));

          // Create a batch — no email involved.
          if (url.pathname === "/api/admin/batch") {
            const id = String(body.id || "").trim().toLowerCase();
            const name = String(body.name || "").trim().slice(0, 60);
            if (!/^[a-z0-9][a-z0-9-]{1,19}$/.test(id)) {
              return json({ error: "batch id: 2-20 chars, letters/numbers/dashes" }, 400);
            }
            if (!name) return json({ error: "batch name required" }, 400);
            const dupe = await sql`select 1 from batches where id = ${id}`;
            if (dupe.length) return json({ error: "batch '" + id + "' already exists" }, 400);
            await sql`insert into batches (id, name) values (${id}, ${name})`;
            return json({ ok: true });
          }

          const email = normEmail(body.email || "");
          if (!email.includes("@")) return json({ error: "bad email" }, 400);

          // Add an email to a specific batch (also moves an existing
          // student between batches, and upgrades a trial user).
          if (url.pathname === "/api/admin/upgrade") {
            const batch = String(body.batchId || "jun26").slice(0, 40);
            const known = await sql`select 1 from batches where id = ${batch}`;
            if (!known.length) return json({ error: "unknown batch: " + batch }, 400);
            await sql`
              insert into students (email, batch_id)
              values (${email}, ${batch})
              on conflict (email) do update
                set batch_id = ${batch}, status = 'active'`;
            return json({ ok: true });
          }
          if (url.pathname === "/api/admin/remove") {
            // Admins cannot remove themselves or another admin here.
            const target =
              await sql`select role from students where email = ${email}`;
            if (target.length && target[0].role === "admin") {
              return json({ error: "cannot remove an admin" }, 400);
            }
            await sql`delete from students where email = ${email}`;
            return json({ ok: true });
          }
          if (url.pathname === "/api/admin/unblock") {
            await sql`delete from logins where email = ${email}`;
            await sql`update students set status = 'active' where email = ${email}`;
            return json({ ok: true });
          }
        }
        return json({ error: "not found" }, 404);
      }

      return json({ error: "not found" }, 404);
    } catch (e) {
      // Fail closed on the API but open on the portal: the portal treats a
      // 500 as "no verdict" and falls back to its local allow-list.
      return json({ error: "server error" }, 500);
    }
  },
};
