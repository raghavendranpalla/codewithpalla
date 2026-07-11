-- =========================================================
-- Learn with Palla — Neon Postgres schema (reference copy)
--
-- Live database: Neon project (free tier, 500 MB), database `neondb`.
-- This file is for reference / disaster recovery — the tables were
-- created on 2026-07-11 and are queried by the Cloudflare Worker in
-- worker/src/index.js. The connection string is a secret; it lives
-- only in the Worker (wrangler secret DATABASE_URL), never in git.
-- =========================================================

-- Registered students. One row per student email.
-- email is stored GMAIL-NORMALISED: lowercase, dots and +tags removed
-- from the local part, googlemail.com folded to gmail.com — the same
-- rule as normEmail() in assets/js/portal.js and worker/src/index.js.
create table if not exists students (
  email         text primary key,               -- gmail-normalised
  name          text not null default '',
  batch_id      text not null default 'jun26',  -- matches CONFIG.batches[].id
  status        text not null default 'active', -- 'active' | 'blocked' (manual block)
  machine_limit int  not null default 5,        -- backstop: blocked when used on more than
                                                -- this many devices in the LAST 30 DAYS
  created_at    timestamptz not null default now()
);

-- Every verified Google sign-in on the portal (students AND trial users).
create table if not exists logins (
  id         bigint generated always as identity primary key,
  email      text not null,                  -- gmail-normalised
  raw_email  text not null default '',       -- exactly as Google reported it
  name       text not null default '',
  ip         text not null default '',       -- visitor IP (CF-Connecting-IP), informational
  user_agent text not null default '',
  device_id  text not null default '',       -- random id the portal keeps per browser
                                             -- (localStorage lwp_device) — the machine count
  is_student boolean not null default false, -- was the email registered at sign-in time?
  created_at timestamptz not null default now()
);

create index if not exists logins_email_idx on logins (email);

-- One live session per account (Netflix-style). Every sign-in makes that
-- device the session; any other device is signed out on its next recheck
-- (the portal rechecks on load and every 5 minutes).
create table if not exists sessions (
  email      text primary key,               -- gmail-normalised
  device_id  text not null,                  -- the ONE device allowed right now
  updated_at timestamptz not null default now()
);

-- =========================================================
-- UPGRADE POLICY — free trial → paid student
-- =========================================================
-- "Trial" is never stored; it is computed on every check as
-- "email not in students". So upgrading is ONE insert:
--
--   insert into students (email, batch_id) values ('theirname@gmail.com', 'jun26');
--
-- Rules:
--   1. Write the email GMAIL-NORMALISED: lowercase, remove dots and
--      +tags from the part before @ (suresh.kb78+x@ -> sureshkb78@),
--      googlemail.com -> gmail.com. Wrong form = lookup misses.
--   2. Takes effect automatically within ~5 minutes (the portal
--      rechecks the server) — the student does NOT need to sign in
--      again; the trial banner disappears and all days unlock.
--   3. Then share the Days 5+ Drive files (videos + PDFs) with their
--      real Gmail — Drive is the true gate on the content itself.
--   4. Nothing to clean up: their trial logins stay as history
--      (is_student=false), device count and live session carry over.
--
-- Downgrade / refund is the reverse:
--   delete from students where email = 'theirname@gmail.com';
--   (they fall back to free trial within ~5 minutes; also un-share
--    the Days 5+ Drive files from their Gmail)

-- =========================================================
-- Admin cheatsheet (run in the Neon SQL editor)
-- =========================================================
-- Add a student (remember: gmail-normalised, no dots):
--   insert into students (email, batch_id) values ('newstudent@gmail.com', 'jun26');
--
-- Unblock someone who hit the 5-machine limit (forget old machines):
--   delete from logins where email = 'student@gmail.com';
-- ...or give them a higher limit:
--   update students set machine_limit = 10 where email = 'student@gmail.com';
--
-- Manually block / unblock:
--   update students set status = 'blocked' where email = 'student@gmail.com';
--   update students set status = 'active'  where email = 'student@gmail.com';
--
-- Recent sign-ins:
--   select email, ip, is_student, created_at from logins order by created_at desc limit 50;
--
-- Free-trial users (leads to follow up with!):
--   select email, min(created_at) as first_seen, count(*) as visits
--   from logins where is_student = false group by email order by first_seen desc;
--
-- Machines per student:
--   select email, count(distinct device_id) as machines from logins
--   where is_student = true and device_id <> '' group by email order by machines desc;
