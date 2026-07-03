# Google Drive sharing — what you need to do

The portal only hides the page. The videos actually stream from **your Google
Drive**, so a student can watch a video **only if their email is shared on the
Drive file**. If you forget this step, they sign in fine but see a black
"You need access" box instead of the video.

The **PDF study guides are on Drive too**, so they need the same sharing as
the videos.

---

## Best setup (do this once — saves you time forever)

1. In Google Drive, create a folder called **LWP June 2026 — Course Videos**.
2. Move ALL the course video files into that folder.
3. Right-click the folder → **Share**.
4. In "Add people", paste the full student list (below) → set them as
   **Viewer** → click **Send**.
5. Click the **gear icon (Settings)** at the top of the Share window and
   **untick both boxes**:
   - "Editors can change permissions and share"
   - "Viewers and commenters can see the option to download, print, and copy"
6. Make sure **General access** says **Restricted** (NOT "Anyone with the
   link").

After this:

- **New day's videos** → just upload them INTO this folder. They inherit the
  sharing automatically — nothing else to do.
- **New student joins** → share the FOLDER with their email once (Viewer).
  They instantly get every past and future video.

---

## If you keep sharing file-by-file instead

For **every** video file: right-click → Share → paste the email list → Viewer
→ Send, and untick the two boxes in Settings (gear icon). Repeat for each new
file and re-do all files for each new student. (This is why the folder is
better.)

---

## Paste-ready student list (June 2026 batch — 18 emails)

```
raghavendranpalla@gmail.com, bunnya42@gmail.com, nalamatisyamsai@gmail.com, subbupalla555@gmail.com, suresh.kb78@gmail.com, surendraneelam5@gmail.com, kirankayala@gmail.com, keerthi.vasanta@gmail.com, ponnada.upendrasai@gmail.com, sreecharansdet95@gmail.com, lalitha.yarramsetty@gmail.com, kranthikollapati369@gmail.com, rojapavitra1308@gmail.com, narsing.mrao@gmail.com, vasanthigopisetti4912@gmail.com, suresh.marripalem@gmail.com, shankarpalla1@gmail.com, korlatharunchandra@gmail.com
```

Keep this list in sync with `emails[]` in `assets/js/portal.js` — when a
student is added to the portal, add them here (and in Drive) too.

---

## Files that must be shared (as of Day 4)

| Day | File | Shared? |
|---|---|---|
| Day 1 | Part 1 — Installing Node.js | ☐ |
| Day 1 | Part 2 — Installing & configuring VS Code | ☐ |
| Day 1 | Study & Practice Guide PDF | ☐ |
| Day 2 | Part 1 — JavaScript Comments | ☐ |
| Day 2 | Part 2 — JavaScript Variables | ☐ |
| Day 2 | Study & Practice Guide PDF | ☐ |
| Day 3 | Part 1 — JavaScript Data Types | ☐ |
| Day 3 | Part 2 — Variable Scoping | ☐ |
| Day 3 | Study & Practice Guide PDF | ☐ |
| Day 4 | Part 1 — Template Literals & Truthy/Falsy Values | ☐ |
| Day 4 | Study & Practice Guide PDF | ☐ |

(If you use the folder setup above, ticking one box — the folder — covers all
of these at once.)

---

## Quick check that it works

1. Ask one student (or use a test Gmail that is on the list) to open
   https://learnwithpalla.com/portal.html and sign in.
2. Click a video → it should play. If they see **"You need access"**, that
   file (or the folder) is not shared with their email yet.
3. Common cause: the student's browser is signed in to a **different Google
   account** than the one you shared with (many people have 2-3 Gmails).
   Ask them to open drive.google.com, click the avatar in the top-right,
   and switch to the email that is on the course list — then reload the
   portal.
