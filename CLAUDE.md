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

## Marketing site

- Pages: index / courses / curriculum / about / contact (+ 404). Dark theme,
  Inter + JetBrains Mono.
- Contact via WhatsApp links (`wa.me`) — the phone number must never appear
  as plain text on the site or PDF.
- `tools/generate_pdf.py` regenerates the 45-day-plans brochure PDF after
  curriculum changes (`python tools/generate_pdf.py`).
- Still placeholder: course fees, stats, testimonials, Formspree form ID.
