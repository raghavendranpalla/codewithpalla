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
    "Access-Control-Allow-Headers": "Content-Type",
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

        return json({ email, ...(await accessFor(sql, email)) });
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

      return json({ error: "not found" }, 404);
    } catch (e) {
      // Fail closed on the API but open on the portal: the portal treats a
      // 500 as "no verdict" and falls back to its local allow-list.
      return json({ error: "server error" }, 500);
    }
  },
};
