/* =========================================================
   Learn with Palla — portal API (Cloudflare Worker)

   Sits between the static site and the Neon Postgres database
   so the database password never reaches the browser.

   Endpoints
     POST /api/session   body: { credential: <Google ID token> }
       Verifies the token with Google, records the login
       (email + IP + browser), and answers who this is:
         { status:"student", batchId }          registered, allowed
         { status:"trial" }                     not registered → free trial
         { status:"blocked", reason, limit }    too many machines / admin block
     GET /api/status?email=...
       Read-only recheck on page load (writes nothing).

   Tables (created in Neon):
     students(email pk, name, batch_id, status, ip_limit, created_at)
     logins(id, email, raw_email, name, ip, user_agent, is_student, created_at)

   Secrets: DATABASE_URL — set with `npx wrangler secret put DATABASE_URL`.

   Admin cheatsheet (run in the Neon SQL editor):
     add student    insert into students (email, batch_id) values ('x@gmail.com','jun26');
     unblock        delete from logins where email='x@gmail.com';        -- forget old machines
     or             update students set ip_limit=10 where email='x@gmail.com';
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

// Decide what a signed-in email may see.
async function accessFor(sql, email) {
  const rows =
    await sql`select batch_id, status, ip_limit from students where email = ${email}`;
  if (!rows.length) return { status: "trial" };

  const st = rows[0];
  if (st.status === "blocked") {
    return { status: "blocked", reason: "admin", limit: st.ip_limit };
  }
  const [{ ips }] = await sql`
    select count(distinct ip)::int as ips
    from logins where email = ${email} and ip <> ''`;
  if (ips > st.ip_limit) {
    return { status: "blocked", reason: "ip_limit", limit: st.ip_limit, ips };
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

        const student = await sql`select 1 from students where email = ${email}`;
        await sql`
          insert into logins (email, raw_email, name, ip, user_agent, is_student)
          values (${email}, ${info.email}, ${info.name || ""}, ${ip}, ${ua},
                  ${student.length > 0})`;

        return json({ email, ...(await accessFor(sql, email)) });
      }

      if (request.method === "GET" && url.pathname === "/api/status") {
        const email = normEmail(url.searchParams.get("email"));
        if (!email.includes("@")) return json({ error: "bad email" }, 400);
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
