# Learn with Palla — project notes for Claude

Static course site + student portal. No build step — plain HTML/CSS/vanilla JS.
Live at https://learnwithpalla.com (GitHub Pages, repo `raghavendranpalla/codewithpalla`, branch `main`).

## Deploying

- Commit and `git push` to `main` — Pages redeploys in ~1 minute.
- gh CLI has two accounts; this repo needs the personal one:
  `gh auth switch --user raghavendranpalla` before pushing (otherwise 403).
- **Cache-busting is mandatory:** every JS/CSS change must bump the `?v=N`
  query on that file's tag (e.g. `portal.js?v=20` in `portal.html`), or
  browsers serve the stale file.

## Student portal (portal.html + assets/js/portal.js)

- Google sign-in (Google Identity Services). Access is granted by matching the
  signed-in email against a batch allow-list in `CONFIG.batches[].emails[]`.
  Matching is Gmail-smart (dots, +tags, googlemail ignored).
- Default batch: **June 2026** (`jun26`). New student emails go there unless
  told otherwise.
- Content is organised as `days[]` (title, description, resources).
- **Backend (2026-07):** Cloudflare Worker `worker/` at
  https://lwp-api.learnwithpalla.workers.dev + Neon Postgres (schema +
  admin cheatsheet in `db/schema.sql`; connection string is a Worker
  secret, never in git). It logs every sign-in (email/IP/device),
  gives unregistered accounts a FREE TRIAL of the first 4 days, and
  enforces ONE live session per account (newest login wins; 5-device/
  30-day block as backstop). Deploy: `cd worker && npx wrangler deploy`.
  Portal falls back to the local `emails[]` lists if the API is down.
- **Roles:** `students.role` is `student` or `admin` (currently
  raghavendranpalla@gmail.com). Admins get a ⚙ Admin panel button in the
  portal: list students/trials, add any email to a chosen batch (also
  moves existing students), create new batches, remove a student (back
  to trial), unblock machines. Server-enforced via 30-day `admin_tokens`
  minted at Google sign-in (X-Admin-Token header).
- **Live calls (2026-07):** real in-portal WebRTC audio/video calls.
  ONLY the admin can start a call (server-enforced via X-Admin-Token);
  students can only receive/answer/decline. Admin panel students table
  has a "Live: on/off" toggle and 📞 Audio / 🎥 Video call buttons.
  Flow: admin's cam/mic start → offer SDP (vanilla ICE, candidates
  embedded, 3 s gathering cap) posted with `/api/admin/live/call` →
  student's portal rings full-screen (10 s polling of `/api/live/poll`,
  beep + flashing title) → Accept turns on their cam/mic automatically
  and posts the answer SDP via `/api/live/respond` → P2P call renders
  in-page (remote full-screen, mirrored local PiP, mute/camera/hang-up
  controls). Media is browser-to-browser (Google STUN + openrelay.metered.ca
  public TURN fallback) — the Worker only relays SDP. The admin
  "Ringing…" dialog heartbeats `/api/admin/live/status` every 2.5 s (a
  ring goes stale 45 s after it closes) and receives the answer SDP;
  both sides also watch call status every 3 s to notice hang-ups.
  Polls are gated by the account's one-live-session device id. Schema
  (`students.live_enabled`, `live_calls` incl. offer/answer) is
  auto-created by the Worker — no manual Neon step. After toggling a
  student ON, their portal picks it up within ~5 min (the /api/status
  recheck) — or immediately after a re-login. Browser rule: the FIRST
  call asks the student to Allow camera/mic; after that it's automatic.
  The portal can only ring while open in a browser tab.
- **Batches** now live in the DB `batches` table (admin panel can create
  them), but a batch's course content still comes from
  `CONFIG.batches[]` in portal.js — students of a DB-only batch see a
  "recordings coming soon" page until that batch's `days[]` is added.

### Adding a student email

1. Insert into the `students` table (Neon SQL editor or a script) —
   gmail-normalised (lowercase, dots/+tags stripped). This alone is
   enough: the portal picks it up within ~5 min, no redeploy needed.
2. Also append to the `jun26` `emails[]` array in `assets/js/portal.js`
   (offline fallback), bump `portal.js?v=N` in `portal.html`, commit, push.
3. Remind Palla to also share the Drive video files with that email —
   Drive sharing is the real access control.
4. His messages have frequent typos — if two spellings of an address appear,
   confirm which is correct.

### Upgrade policy (free trial → paid student)

- Trial is computed, never stored: any signed-in email not in `students`
  is a trial user (first 4 days). Upgrading = the insert in step 1 above;
  full policy + downgrade steps are documented in `db/schema.sql`.

### Adding a day's videos

1. Obfuscate each Drive file id: XOR with the key in `OBF_KEY` (portal.js),
   then base64. Verify the token round-trips through `deob()` logic before use.
2. Create branded SVG thumbnails at `assets/img/thumb-dayN-partM.svg`,
   1280x720, matching the existing ones: dark `#0a0e14` background, faint
   grid, "DAY N · LEARN WITH PALLA" cyan eyebrow, big white + gradient title
   (yellow→cyan→indigo), PART badge, small code snippet, learnwithpalla.com
   footer, and a colorful diagram of the topic on the right. Render with
   headless Edge (`msedge --headless --screenshot`) to verify before pushing.
3. Add the day to `CONFIG.batches[].days[]` with `{type:"video", label,
   poster, vid}` entries (`vid` = obfuscated token).
4. Add the day's Study & Practice Guide PDF: append its content to `DAYS`
   in `tools/generate_study_guides.py`, run the script (outputs to
   `assets/docs/dayN-study-practice-guide.pdf`), then have Palla upload the
   PDF to Google Drive and send back the link. Obfuscate its Drive id (same
   XOR+base64 as videos) and add a `{type:"pdf", label:"Study & Practice
   Guide (PDF)", vid}` resource to the day. Do NOT commit the PDF — it is
   Drive-gated, not site-hosted. The player previews it inline and shows a
   download button.
5. Bump `?v=N`, commit, push.
6. Remind Palla to share the new Drive files with all batch student emails.

### Adding a test (quiz)

- Add a `days[]` entry with a `{type:"quiz", label, quizId, questions}`
  resource. Each question is `{q, opts:[4 strings], a:<correct index>}`.
  The portal renders it exam-style in the player area, grades on submit,
  shows per-question feedback and keeps the best score per device
  (localStorage `lwp_quiz_scores`). Spread correct answers across A-D.
- Note: answers are visible in view-source — fine for practice tests,
  not for anything that counts.
- Bump `?v=N`, commit, push. No Drive sharing needed for quizzes.

### Mock-interview videos (tools/interview/)

- Format Palla promised students: he asks a question in his voice →
  15-second on-screen countdown for out-loud self-evaluation (beeps in
  the last 3 s; TIMER_SECONDS in assemble.py, was 45 then 20) →
  he reveals the answer. ~18 min for 20 questions.
- Narration voice: **"Raghu"** `XArEYi9seQIEXf0bxQuP` — the clone Palla
  registered himself and prefers. (An earlier auto-clone
  "Palla Raghavendran" `x8tHWG9VqOQ8sTCj3MZC` also exists.) He wants
  delivery slightly slow with emphasis — voice_settings in assemble.py
  (speed 0.9, style 0.35, speaker boost OFF — Palla picked this
  "v24" combo from a 30-variant blind test, 2026-07-23) reflect
  that. API key is in the *user-scope*
  env var `ELEVANLABS` (his typo spelling — keep it). Needs the paid
  Starter plan (~30k credits/mo; one 20-question video ≈ 9.3k).
- Workflow: edit the `QA` list in `tools/interview/make_slides.py`
  (question, answer headline/bullets/code, `a_narr` narration), run it
  (writes `slides/*.svg` + `manifest.json`), render SVGs→PNGs with
  headless Edge, then `python assemble.py --voice x8tHWG9VqOQ8sTCj3MZC`
  (TTS is cached per id in `audio/`; `--only q01,a01` for smoke tests).
  Needs ffmpeg (`FFMPEG_DIR` env var or on PATH) — not installed
  globally on this machine; grab the gyan.dev essentials zip.
- Output mp4 goes to Google Drive like class videos (not the repo);
  slides/audio/segs work dirs are gitignored by location (scratch).
- Interview Practice #1 (Days 1–7, 20 questions) delivered 2026-07-13;
  regenerated 2026-07-23 with the v24 voice + 15 s timer. Practice #2
  (Days 1–7, 30 fresh questions, deeper answers) delivered 2026-07-23.

## Marketing site

- Pages: index / courses / curriculum / about / contact (+ 404). Dark theme,
  Inter + JetBrains Mono.
- Contact via WhatsApp links (`wa.me`) — the phone number must never appear
  as plain text on the site or PDF.
- `tools/generate_pdf.py` regenerates the 45-day-plans brochure PDF after
  curriculum changes (`python tools/generate_pdf.py`).
- Still placeholder: course fees, stats, testimonials, Formspree form ID.
