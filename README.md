# Learn with Palla — course website

A fast, dependency-free **static website** for Palla Raghavendran's TypeScript +
Playwright + AI test-automation training. Dark, developer-styled, mobile-friendly,
with **WhatsApp** contact + an **email lead form**, ready to deploy on **AWS**.

> Domain to buy: **`learnwithpalla.com`** (confirmed available). Good `.com`
> backups if you want them: `testwithpalla.com`, `pallaplaywright.com`,
> `learnqawithpalla.com`, `pallaqa.com`.

---

## 1. What's in here

```
.
├── index.html         # Home
├── about.html         # About Palla
├── courses.html       # Courses + full syllabus + pricing
├── contact.html       # WhatsApp + call + email lead form
├── 404.html           # Friendly not-found page
├── robots.txt         # SEO
├── sitemap.xml        # SEO (update the domain if it changes)
├── assets/
│   ├── css/styles.css # The whole design system
│   ├── js/main.js     # Nav, reveal animations, form handling
│   └── img/favicon.svg
├── deploy.ps1         # One-command deploy (Windows / PowerShell)
└── deploy.sh          # One-command deploy (Mac/Linux/Git Bash)
```

No build step, no framework — just open it.

---

## 2. Preview it locally

**Easiest:** double-click `index.html` to open it in your browser.

**Better (forms behave exactly like production)** — run a tiny local server:

```powershell
# If you have Python:
python -m http.server 8080
# then open http://localhost:8080

# Or if you have Node.js:
npx serve .
```

---

## 3. Two things to fill in (everything else already works)

### a) Your real course details
The WhatsApp number (**+91 95813 41999**) and LinkedIn are already wired in.
Search-and-replace these **placeholders** when you have the final info:

| Placeholder in the pages         | Replace with                              |
|----------------------------------|-------------------------------------------|
| `₹—` (in `courses.html`)         | Your actual course fees                   |
| `12+`, `2000+` stats (`index.html`) | Your real numbers                      |
| Testimonials (`index.html`)      | Real student quotes (or remove the block) |
| “Based in Andhra Pradesh”        | Your city, if you prefer                  |

You can also send me (Claude) these details and I'll drop them in for you.

### b) The email lead form (Formspree — free)
The form already works — until you set it up, it **auto-forwards the details to
your WhatsApp**. To receive form submissions by email instead:

1. Go to **https://formspree.io** → sign up (free plan is fine).
2. Create a new form → copy its endpoint, e.g. `https://formspree.io/f/abcwxyz`.
3. Open `contact.html`, find this line and paste your endpoint:
   ```html
   <form id="leadForm" class="form" action="https://formspree.io/f/XXXXXXXX" method="POST">
   ```
4. Done — submissions now land in your email.

> Want to change the WhatsApp number later? Search the project for
> `919581341999` and replace it everywhere.

---

## 4. Buy the domain

Register **`learnwithpalla.com`** at any registrar — e.g. **Namecheap**,
**GoDaddy**, **Cloudflare**, or **AWS Route 53**. (~₹900–1,200/year for `.com`.)
You can keep DNS at the registrar, or move it to Route 53 (step 5d).

---

## 5. Deploy to AWS (S3 + CloudFront + free HTTPS)

This is the **production setup**: private S3 bucket, served worldwide over HTTPS
by CloudFront, with a free SSL certificate from AWS. The static hosting itself
fits comfortably in the **AWS Free Tier**; you only pay for the domain and
(optionally) ~$0.50/mo if you use Route 53 DNS.

> Region note: pick **`ap-south-1` (Mumbai)** or **`ap-south-2` (Hyderabad)** for
> the S3 bucket — closest to Andhra Pradesh. CloudFront serves from edge
> locations across India regardless, so visitors are fast either way.
> **The ACM certificate for CloudFront MUST be created in `us-east-1`** — that's
> an AWS requirement, even though your bucket is in India.

### 5a. Create the S3 bucket and upload
```powershell
# Create a private bucket (name it whatever you like; domain name is tidy)
aws s3 mb s3://learnwithpalla.com --region ap-south-1

# Push the site (run from the project folder)
./deploy.ps1 -Bucket "learnwithpalla.com" -Region "ap-south-1"
```

### 5b. Request a free SSL certificate (in us-east-1!)
```powershell
aws acm request-certificate `
  --domain-name learnwithpalla.com `
  --subject-alternative-names www.learnwithpalla.com `
  --validation-method DNS `
  --region us-east-1
```
Then add the CNAME validation record ACM gives you to your DNS (registrar or
Route 53). Wait until the cert status is **ISSUED**.

### 5c. Create the CloudFront distribution
In the **AWS Console → CloudFront → Create distribution**:
- **Origin:** your S3 bucket, using **Origin access control (OAC)** — let the
  console update the bucket policy for you (keeps the bucket private).
- **Viewer protocol policy:** Redirect HTTP → HTTPS.
- **Default root object:** `index.html`.
- **Alternate domain names (CNAMEs):** `learnwithpalla.com`, `www.learnwithpalla.com`.
- **Custom SSL certificate:** pick the ACM cert from 5b.
- **Custom error responses:** map **403** and **404** → response page
  `/404.html` (so clean URLs and missing pages show your branded 404).

Copy the distribution's **ID** (looks like `E1A2B3C4D5`) and its domain
(`dxxxx.cloudfront.net`).

### 5d. Point the domain at CloudFront
At your DNS provider, create records for the apex and `www` pointing to the
CloudFront domain (`dxxxx.cloudfront.net`):
- **Route 53:** create an **A / AAAA Alias** record → the CloudFront distribution.
- **Other registrars:** a **CNAME** for `www`, and use their ALIAS/ANAME (or
  CNAME-flattening, e.g. Cloudflare) for the apex.

### 5e. From now on, every update is one command
```powershell
./deploy.ps1 -Bucket "learnwithpalla.com" -DistributionId "E1A2B3C4D5"
```
This syncs changed files **and** invalidates the CloudFront cache so updates go
live immediately.

---

## 6. Cost summary

| Item                         | Cost                                  |
|------------------------------|---------------------------------------|
| S3 storage + requests        | Free tier (this site is tiny)         |
| CloudFront                   | Free tier (1 TB/mo out, 12 months)    |
| ACM SSL certificate          | **Free**                              |
| Formspree (lead form)        | Free plan                             |
| Domain `learnwithpalla.com`  | ~₹900–1,200 / year                    |
| Route 53 hosted zone (optional) | ~$0.50 / month                     |

---

## 7. Handy commands

```powershell
# See what would change without uploading (dry run)
aws s3 sync . s3://learnwithpalla.com --dryrun

# Manually invalidate cache
aws cloudfront create-invalidation --distribution-id E1A2B3C4D5 --paths "/*"
```

---

Built for **Learn with Palla** — TypeScript · Playwright · AI test automation.
