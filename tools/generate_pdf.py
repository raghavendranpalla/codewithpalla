"""
Generate the branded "Learn with Palla" 45-day curriculum PDF.
Pure-Python (reportlab + segno) — no native deps. Re-run any time the
curriculum changes:  python tools/generate_pdf.py
"""
import os
import segno
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak)

ROOT = r'C:\Users\palrag\Documents\PallasTech'
OUT = os.path.join(ROOT, 'assets', 'learn-with-palla-45-day-plans.pdf')
QR_PNG = os.path.join(ROOT, 'assets', 'img', 'whatsapp-qr.png')

# ---- palette (print-friendly: dark text on white, brand accents) ----
TEAL      = colors.HexColor('#0E9F84')
TEAL_DK   = colors.HexColor('#0B7E69')
INDIGO    = colors.HexColor('#4F46E5')
INDIGO_TT = colors.HexColor('#ECEDFB')
DARK      = colors.HexColor('#11161F')
GRAY      = colors.HexColor('#5B6B7C')
SEP       = colors.HexColor('#E6EBF1')
AMBER     = colors.HexColor('#B45309')
AMBER_TT  = colors.HexColor('#FDF3E0')
LIGHT     = colors.HexColor('#EAF6F2')

W, H = A4
CW = W - 100          # content width (50pt margins)
BADGE = 58

# ---- styles ----
st_h2   = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=DARK, spaceAfter=4)
st_body = ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=15, textColor=GRAY)
st_track= ParagraphStyle('track', fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.white)
st_phase= ParagraphStyle('phase', fontName='Helvetica', fontSize=11, leading=15, textColor=DARK)
st_dnum = ParagraphStyle('dnum', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=TEAL_DK)
st_day  = ParagraphStyle('day', fontName='Helvetica', fontSize=10, leading=13, textColor=DARK)
st_qa   = ParagraphStyle('qa', fontName='Helvetica', fontSize=9, leading=12, textColor=INDIGO)


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


# ============================== curriculum data ==============================
PLAYWRIGHT = {
    'name': 'Playwright + TypeScript',
    'meta': '45 days  ·  45 min/day  ·  15 live Q&A  ·  9 phases  ·  22h+ lessons',
    'bonus': 'Use it with Playwright MCP and the AI Test Agents to plan, generate and self-heal tests.',
    'phases': [
        ('01', 'Kickoff & Setup', 'Days 1-2', 'Get the big picture and a fully working dev environment.', [
            ('d', 'Day 1', 'Welcome & the Playwright big picture', 'Course intro & format, quick automation demo, overview & architecture, why it beats legacy tools.'),
            ('d', 'Day 2', 'Set up your machine', 'Node.js & VS Code (Win/macOS), first Node "Hello World", Playwright extensions, folder & naming conventions.'),
        ]),
        ('02', 'JavaScript / TypeScript Essentials', 'Days 3-14', 'The language foundation every automation framework is built on.', [
            ('d', 'Day 3', 'Readiness check + variables', 'JS/TS readiness self-check, comments, variable definition, syntax & rules.'),
            ('q', 'Live Q&A 1', 'Setup & JavaScript basics - clear blockers, review your environment.'),
            ('d', 'Day 4', 'Variables & scope', 'var / let / const, variable scoping, best practices.'),
            ('d', 'Day 5', 'Data types I', 'Intro, literals, the typeof operator.'),
            ('d', 'Day 6', 'Data types II', 'Different forms, truthy / falsy / nullish, type conversion.'),
            ('q', 'Live Q&A 2', 'Variables & data types - mini coding challenge.'),
            ('d', 'Day 7', 'Operators I', 'Assignment, arithmetic and comparison operators.'),
            ('d', 'Day 8', 'Operators II', 'Logical AND / OR / NOT, default values, ternary operator.'),
            ('d', 'Day 9', 'Conditionals & switch', 'if / else (6 real use-cases), nested conditions, switch.'),
            ('q', 'Live Q&A 3', 'Operators & conditionals - logic practice.'),
            ('d', 'Day 10', 'Loops', 'for, for-with-array, break, forEach, while, for-in / for-of.'),
            ('d', 'Day 11', 'Strings I', 'String forms, formatting, comparing, slice().'),
            ('d', 'Day 12', 'Strings II', 'replace / replaceAll, split, indexOf, escaping.'),
            ('q', 'Live Q&A 4', 'Loops & strings - string-manipulation exercises.'),
            ('d', 'Day 13', 'Functions I', 'Named & anonymous functions, parameters.'),
            ('d', 'Day 14', 'Functions II', 'Rest params, return, self-invoking, arrow functions + JS exercises.'),
        ]),
        ('03', 'Playwright Foundations', 'Days 15-18', 'Install Playwright, wire up Git, and learn the core test objects.', [
            ('d', 'Day 15', 'Install Playwright & first test', 'Install, run the generated test, project setup, package.json scripts.'),
            ('q', 'Live Q&A 5', 'Functions & your first Playwright run.'),
            ('d', 'Day 16', 'Git & GitHub workflow', 'Git install & basics, GitHub repo, local setup, commit & push.'),
            ('d', 'Day 17', 'First spec & the test runner', 'First spec file, common errors & fixes, test runner, the test() function.'),
            ('d', 'Day 18', 'Core Playwright objects', 'Page fixtures, the locator object, expect() assertions, the await keyword.'),
            ('q', 'Live Q&A 6', 'Playwright core & the test runner.'),
        ]),
        ('04', 'Codegen, Locators & Interactions', 'Days 19-23', 'Record tests, master locators, and automate every kind of element.', [
            ('d', 'Day 19', 'Codegen mastery', 'Codegen overview & benefits, CLI usage, record a login spec, capture flows.'),
            ('d', 'Day 20', 'Locators deep dive', 'Locator strategies, pick-locator, resilient-selector best practices.'),
            ('d', 'Day 21', 'Interacting with elements I', 'Form filling, buttons & links, text fields.'),
            ('q', 'Live Q&A 7', 'Codegen, locators & interactions - record-along clinic.'),
            ('d', 'Day 22', 'Interacting with elements II', 'Dropdowns, radio buttons & checkboxes.'),
            ('d', 'Day 23', 'Lists & full flows', 'Iterate over element lists, complete a checkout flow end-to-end.'),
        ]),
        ('05', 'Debugging, Reporting & Config', 'Days 24-28', 'Find failures fast, produce great reports, and master configuration.', [
            ('d', 'Day 24', 'Debugging toolkit', 'Test Explorer, UI mode, CLI debug mode, the Trace Viewer.'),
            ('q', 'Live Q&A 8', 'Debugging - bring your broken tests.'),
            ('d', 'Day 25', 'Allure reporting', 'Allure setup, Java install, configuration, rich HTML reports.'),
            ('d', 'Day 26', 'Test config & fixtures', 'playwright.config deep dive, building custom fixtures.'),
            ('d', 'Day 27', 'Screenshots & video', 'Capture screenshots & video evidence on failures.'),
            ('q', 'Live Q&A 9', 'Reporting & configuration review.'),
            ('d', 'Day 28', 'Annotations & tags', 'Annotations, tags, organise & filter your suite.'),
        ]),
        ('06', 'Reliability, Cross-Browser & Parallel', 'Days 29-32', 'Kill flakiness and run fast across browsers and devices.', [
            ('d', 'Day 29', 'Auto-waiting & timeouts', 'How auto-waiting works, configuring timeouts, hands-on demos.'),
            ('d', 'Day 30', 'Advanced debugging & browser args', 'Debugging at the Playwright API level, Chrome browser args.'),
            ('q', 'Live Q&A 10', 'Waits, timeouts & browser tuning.'),
            ('d', 'Day 31', 'Hooks & global setup', 'beforeEach / afterEach hooks, global setup & teardown.'),
            ('d', 'Day 32', 'Cross-browser, mobile & parallel', 'Multi-browser runs, device emulation, parallelism & sharding.'),
        ]),
        ('07', 'Data-Driven Testing & Page Objects', 'Days 33-37', 'Parameterise everything and structure a maintainable framework.', [
            ('d', 'Day 33', 'Data-driven testing I', 'tsconfig, static / constant data, parameterising with forEach.'),
            ('q', 'Live Q&A 11', 'Hooks, parallel runs & data basics.'),
            ('d', 'Day 34', 'Data-driven testing II', 'Dynamic global data, environment-specific data, sensitive data.'),
            ('d', 'Day 35', 'Data-driven testing III', 'Read data from CSV, helper functions, parameterised CSV runs, logger.'),
            ('d', 'Day 36', 'Page Object Model I', 'POM concept, TypeScript classes, building a base page.'),
            ('q', 'Live Q&A 12', 'Data-driven design & POM kickoff.'),
            ('d', 'Day 37', 'Page Object Model II', 'Implement POM, build tests with page objects, run E2E.'),
        ]),
        ('08', 'API & End-to-End', 'Days 38-40', 'Test APIs and tie UI + API into complete end-to-end journeys.', [
            ('d', 'Day 38', 'API testing I', 'API overview, GET & POST examples, request context.'),
            ('d', 'Day 39', 'API testing II', 'API + framework integration, Playwright & file helpers.'),
            ('q', 'Live Q&A 13', 'Page objects & API testing.'),
            ('d', 'Day 40', 'End-to-end integration', 'Full E2E combining page objects, web UI and API together.'),
        ]),
        ('09', 'AI, CI/CD & Graduation', 'Days 41-45', 'The modern edge - AI agents, pipelines, and your launch into the field.', [
            ('d', 'Day 41', 'AI: Copilot & Playwright MCP', 'GitHub Copilot setup & modes, Playwright MCP server in action.'),
            ('d', 'Day 42', 'CI/CD with GitHub Actions', 'YAML basics, GitHub Actions pipeline, Allure reports in CI.'),
            ('q', 'Live Q&A 14', 'End-to-end, AI & continuous integration.'),
            ('d', 'Day 43', 'CI/CD with Jenkins', 'Jenkins install, set up a pipeline, build & run it.'),
            ('d', 'Day 44', 'Playwright Test Agents (AI)', 'Planner, generator & healer agents - install & see them in action.'),
            ('d', 'Day 45', 'Pro practices & graduation', 'Safely upgrading Playwright, forking repos for fast setup, final quiz, next steps.'),
            ('q', 'Live Q&A 15', 'Graduation - careers, portfolio review & what next.'),
        ]),
    ],
}

SELENIUM = {
    'name': 'Selenium + Java',
    'meta': '45 days  ·  45 min/day  ·  15 live Q&A  ·  9 phases  ·  16h+ lessons',
    'bonus': 'Use it with Cursor, MCP and the AI toolkit to generate, review and refine your Selenium tests.',
    'phases': [
        ('01', 'Orientation & Setup', 'Days 1-3', 'The big picture, then a complete Java + Selenium toolchain.', [
            ('d', 'Day 1', 'Welcome & the Selenium + Java big picture', 'Course overview, materials, how to learn effectively, the Selenium WebDriver ecosystem, Java in Selenium.'),
            ('d', 'Day 2', 'Install Java & Maven', 'Install Java (Win/macOS), why Maven matters, install Maven (Win/macOS).'),
            ('d', 'Day 3', 'IDE setup', 'Java IDE options, set up IntelliJ IDEA, environment ready to code.'),
            ('q', 'Live Q&A 1', 'Setup & toolchain - get everyone running.'),
        ]),
        ('02', 'Java for Testers', 'Days 4-9', 'Just enough Java - done properly - to write real tests.', [
            ('d', 'Day 4', 'Java I - first program', 'Your first Java program, classes & methods.'),
            ('d', 'Day 5', 'Java II - classes & methods', 'Classes & methods homework, variables & data types.'),
            ('d', 'Day 6', 'Java III - variables & parameters', 'Variables & data types deep-dive, method parameters (+ variables homework).'),
            ('q', 'Live Q&A 2', 'Java basics - variables & methods.'),
            ('d', 'Day 7', 'Java IV - returns & a calculator', 'Method return values, build a simple calculator.'),
            ('d', 'Day 8', 'Java V - JUnit basics', 'Intro to JUnit & unit testing, write & run your first JUnit test.'),
            ('d', 'Day 9', 'Java VI - consolidation', 'Review, homework solutions & hands-on practice.'),
            ('q', 'Live Q&A 3', 'Java & JUnit - code review.'),
        ]),
        ('03', 'Selenium Foundations', 'Days 10-13', 'Drive a browser, and learn how the page is structured.', [
            ('d', 'Day 10', 'Meet WebDriver', 'Dive into Selenium WebDriver, create a Maven project.'),
            ('d', 'Day 11', 'First browser automation', 'Getting started with Selenium, running on Firefox.'),
            ('d', 'Day 12', 'HTML & the DOM', 'HTML for automation, understanding the Document Object Model.'),
            ('q', 'Live Q&A 4', 'WebDriver & HTML/DOM.'),
            ('d', 'Day 13', 'Inspecting elements', 'Element location in Selenium, dev-tools inspection exercises.'),
        ]),
        ('04', 'Locators & WebElements', 'Days 14-18', 'The make-or-break skill: finding elements reliably.', [
            ('d', 'Day 14', 'Locators I', 'Comprehensive look at locators, the WebElement interface.'),
            ('d', 'Day 15', 'Locators II', 'Simple locators in practice, efficient element-selection tools.'),
            ('q', 'Live Q&A 5', 'Locator basics - find-it practice.'),
            ('d', 'Day 16', 'Locators III', 'Complex locators: XPath & CSS selectors.'),
            ('d', 'Day 17', 'Locators IV', 'Troubleshooting & refining locators, best-practice strategies.'),
            ('d', 'Day 18', 'Locators V', 'Homework: build locators (+ review), WebElement commands in action.'),
            ('q', 'Live Q&A 6', 'XPath, CSS & WebElement commands.'),
        ]),
        ('05', 'Tests with TestNG', 'Days 19-24', 'Write real, structured tests and practical login scenarios.', [
            ('d', 'Day 19', 'First tests I', 'The app under test, a new Maven project, your first test class & method.'),
            ('d', 'Day 20', 'First tests II', 'Implement steps (start the browser), intro to the TestNG framework.'),
            ('d', 'Day 21', 'First tests III', 'Verifications & assertions, run tests with TestNG, debugging.'),
            ('q', 'Live Q&A 7', 'First TestNG tests.'),
            ('d', 'Day 22', 'Practical writing I', 'Negative login testing, set up the test class.'),
            ('d', 'Day 23', 'Practical writing II', 'Test for an incorrect username (homework + implementation).'),
            ('d', 'Day 24', 'Practical writing III', 'Test for an incorrect password, avoiding false positives.'),
            ('q', 'Live Q&A 8', 'Practical test writing.'),
        ]),
        ('06', 'Cross-Browser & TestNG Suites', 'Days 25-28', 'Run everywhere, and organise tests into suites.', [
            ('d', 'Day 25', 'Cross-browser I', 'Cross-browser concepts, Firefox via Selenium Manager.'),
            ('d', 'Day 26', 'Cross-browser II', 'Manually configure Edge (Windows) & Safari (Mac).'),
            ('d', 'Day 27', 'TestNG suites I', 'Suites theory, build & run a full regression suite.'),
            ('q', 'Live Q&A 9', 'Cross-browser & suites.'),
            ('d', 'Day 28', 'TestNG suites II', 'Create & run a smoke-test suite (homework).'),
        ]),
        ('07', 'TestNG Mastery & Debugging', 'Days 29-33', 'Get advanced with TestNG, then debug like a pro.', [
            ('d', 'Day 29', 'TestNG power I', 'Deep dive & docs, reading reports, consolidating login tests.'),
            ('d', 'Day 30', 'TestNG power II', 'Groups, suites & selective execution, TestNG parameters.'),
            ('q', 'Live Q&A 10', 'TestNG groups & parameters.'),
            ('d', 'Day 31', 'TestNG power III', 'Before/after annotations, dynamic browser selection & flexibility.'),
            ('d', 'Day 32', 'Debugging I', 'Debugging essentials, navigating IDE debug features.'),
            ('d', 'Day 33', 'Debugging II', 'Logs for debugging, hands-on debugging in IntelliJ IDEA.'),
            ('q', 'Live Q&A 11', 'TestNG flexibility & debugging.'),
        ]),
        ('08', 'Waits, Exceptions & Page Object Model', 'Days 34-41', 'Beat flaky tests, then build a clean, maintainable framework.', [
            ('d', 'Day 34', 'Waits & exceptions I', 'WebDriver exceptions overview, NoSuchElementException (reproduce & debug).'),
            ('d', 'Day 35', 'Waits & exceptions II', 'Waits theory, resolve NoSuchElement with implicit & explicit waits.'),
            ('d', 'Day 36', 'Waits & exceptions III', 'TimeoutException, ElementNotInteractableException.'),
            ('q', 'Live Q&A 12', 'Waits & exceptions - part 1.'),
            ('d', 'Day 37', 'Waits & exceptions IV', 'InvalidElementState & StaleElementReference exceptions.'),
            ('d', 'Day 38', 'POM I', 'POM fundamentals, build a login page object, successful-login page.'),
            ('d', 'Day 39', 'POM II', 'Base page class, inheritance, SuccessfulLoginPage.'),
            ('q', 'Live Q&A 13', 'Exceptions & POM kickoff.'),
            ('d', 'Day 40', 'POM III', 'Convert positive tests to POM, refactor negative tests.'),
            ('d', 'Day 41', 'POM IV', 'Homework: POM for the exceptions page (solutions), POM best practices.'),
        ]),
        ('09', 'AI-Powered Selenium, Career & Graduation', 'Days 42-45', 'Add the AI edge, then launch your automation career.', [
            ('d', 'Day 42', 'AI-Powered Selenium I', 'The AI toolkit, set up Cursor, context files (teach AI your project).'),
            ('q', 'Live Q&A 14', 'POM & AI setup.'),
            ('d', 'Day 43', 'AI-Powered Selenium II', 'MCP (AI eyes on the browser), rules (code standards), skills (repeatable AI workflows).'),
            ('d', 'Day 44', 'AI-Powered Selenium III', 'Build tests for a new page with AI, review & refine your stack (knowledge check).'),
            ('d', 'Day 45', 'Career & graduation', 'Portfolio, resume, job listings, interview prep, networking, final wrap-up.'),
            ('q', 'Live Q&A 15', 'Graduation - careers, portfolio review & what next.'),
        ]),
    ],
}


# ---- WhatsApp QR (PNG for the cover) ----
segno.make('https://wa.me/919581341999').save(QR_PNG, scale=9, border=2, dark='#0E1117', light='#ffffff')


def cover(canvas, doc):
    canvas.saveState()
    # header band
    canvas.setFillColor(TEAL)
    canvas.rect(0, H - 300, W, 300, stroke=0, fill=1)
    canvas.setFillColor(INDIGO)
    canvas.rect(0, H - 306, W, 6, stroke=0, fill=1)
    # brand
    canvas.setStrokeColor(colors.white)
    canvas.setLineWidth(1.5)
    canvas.roundRect(50, H - 66, 34, 34, 8, stroke=1, fill=0)
    canvas.setFillColor(colors.white)
    canvas.setFont('Helvetica-Bold', 12)
    canvas.drawCentredString(67, H - 54, '</>')
    canvas.setFont('Helvetica-Bold', 15)
    canvas.drawString(95, H - 54, 'Learn with Palla')
    # title
    canvas.setFont('Helvetica-Bold', 30)
    canvas.drawString(50, H - 150, 'The 45-Day')
    canvas.drawString(50, H - 188, 'Automation Mastery Plan')
    canvas.setFont('Helvetica', 12)
    canvas.drawString(50, H - 222, 'Playwright + TypeScript    ·    Selenium + Java    ·    AI-powered testing')
    # body (white area)
    canvas.setFillColor(DARK)
    canvas.setFont('Helvetica-Bold', 13)
    canvas.drawString(50, H - 345, "What's inside")
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 10.5)
    canvas.drawString(50, H - 368, 'Two complete, job-ready learning paths - just 45 minutes a day for 45 days, a live')
    canvas.drawString(50, H - 384, 'Q&A every 3rd day (15 sessions), and a hands-on capstone project.')
    canvas.setFillColor(DARK)
    canvas.setFont('Helvetica-Bold', 10.5)
    canvas.drawString(50, H - 414, 'Playwright + TypeScript')
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 10.5)
    canvas.drawString(196, H - 414, '9 phases  ·  22h+ lessons  ·  Playwright MCP & AI test agents')
    canvas.setFillColor(DARK)
    canvas.setFont('Helvetica-Bold', 10.5)
    canvas.drawString(50, H - 432, 'Selenium + Java')
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 10.5)
    canvas.drawString(196, H - 432, '9 phases  ·  16h+ lessons  ·  TestNG, Page Object Model & AI toolkit')
    # bonus
    canvas.setFillColor(AMBER)
    canvas.setFont('Helvetica-Bold', 11)
    canvas.drawString(50, H - 466, 'BONUS:  1 month of Claude Pro - free for every enrolled student.')
    # QR + contact
    canvas.drawImage(QR_PNG, 50, 95, 104, 104, mask='auto')
    canvas.setFillColor(DARK)
    canvas.setFont('Helvetica-Bold', 13)
    canvas.drawString(172, 178, 'Scan to chat on WhatsApp')
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 10)
    canvas.drawString(172, 160, 'Point your phone camera at the code to message Palla directly.')
    canvas.setFillColor(TEAL_DK)
    canvas.setFont('Helvetica-Bold', 13)
    canvas.drawString(172, 132, 'learnwithpalla.com')
    # footer
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 9)
    canvas.drawCentredString(W / 2, 46, 'Learn with Palla  -  AI-Powered Test Automation Training')
    canvas.restoreState()


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(TEAL_DK)
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(50, H - 40, 'Learn with Palla')
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 9)
    canvas.drawRightString(W - 50, H - 40, '45-Day Automation Plan')
    canvas.setStrokeColor(SEP)
    canvas.setLineWidth(0.6)
    canvas.line(50, H - 48, W - 50, H - 48)
    canvas.setFillColor(GRAY)
    canvas.setFont('Helvetica', 8.5)
    canvas.drawString(50, 34, 'learnwithpalla.com')
    canvas.drawRightString(W - 50, 34, 'Page %d' % doc.page)
    canvas.restoreState()


def cell(text, style):
    return Paragraph(text, style)


def build_track(track):
    flow = []
    # track banner
    banner = Table([[cell('<b>%s</b><br/><font size="8" color="#DFF6EF">%s</font>'
                          % (esc(track['name']).upper(), esc(track['meta'])), st_track)]],
                   colWidths=[CW])
    banner.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), TEAL),
        ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 11), ('BOTTOMPADDING', (0, 0), (-1, -1), 11),
    ]))
    flow.append(banner)
    flow.append(Spacer(1, 6))
    # bonus strip
    bonus = Table([[cell('<b><font color="#B45309">BONUS - 1 month of Claude Pro, free.</font></b> '
                         '<font color="#5B6B7C">%s</font>' % esc(track['bonus']),
                         ParagraphStyle('b', fontName='Helvetica', fontSize=9, leading=12))]],
                  colWidths=[CW])
    bonus.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), AMBER_TT),
        ('LEFTPADDING', (0, 0), (-1, -1), 12), ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    flow.append(bonus)
    flow.append(Spacer(1, 12))

    for num, title, rng, desc, rows in track['phases']:
        ph = Table([[cell('<b>Phase %s  ·  %s</b>   <font color="#0B7E69" size="8">%s</font>'
                          '<br/><font size="8" color="#5B6B7C">%s</font>'
                          % (num, esc(title), esc(rng), esc(desc)), st_phase)]], colWidths=[CW])
        ph.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT),
            ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        flow.append(ph)
        flow.append(Spacer(1, 4))

        data, cmds = [], [
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LINEBELOW', (0, 0), (-1, -1), 0.4, SEP),
        ]
        for i, row in enumerate(rows):
            if row[0] == 'd':
                _, dnum, dtitle, topics = row
                data.append([cell('<b>%s</b>' % esc(dnum), st_dnum),
                             cell('<b>%s</b><br/><font size="8" color="#5B6B7C">%s</font>'
                                  % (esc(dtitle), esc(topics)), st_day)])
            else:
                _, label, theme = row
                data.append([cell('<b>%s</b>  - %s' % (esc(label), esc(theme)), st_qa), ''])
                cmds.append(('SPAN', (0, i), (1, i)))
                cmds.append(('BACKGROUND', (0, i), (1, i), INDIGO_TT))
                cmds.append(('LEFTPADDING', (0, i), (1, i), 10))
        t = Table(data, colWidths=[BADGE, CW - BADGE])
        t.setStyle(TableStyle(cmds))
        flow.append(t)
        flow.append(Spacer(1, 14))
    return flow


def intro():
    flow = [cell('How the 45-day plan works', st_h2),
            cell('Pick one track and commit to <b>45 focused minutes a day</b> - roughly 30 minutes of '
                 'guided lessons and 15 minutes of hands-on practice. A <b>live Q&amp;A every 3rd day</b> '
                 '(15 in total) keeps you unblocked, and you finish with a real portfolio project. '
                 'Every enrolled student also gets <b>1 month of Claude Pro free</b> to learn AI-assisted '
                 'testing from day one.', st_body),
            Spacer(1, 16)]
    return flow


def closing():
    box = Table([[cell('<b>Ready to start your 45 days?</b><br/>'
                       '<font color="#5B6B7C">Scan the QR on the cover, or visit '
                       '<b><font color="#0B7E69">learnwithpalla.com</font></b> and tap '
                       '<b>Chat on WhatsApp</b>. Next batch is filling up - reserve your seat.</font>',
                       ParagraphStyle('c', fontName='Helvetica', fontSize=11, leading=16, textColor=DARK))]],
                colWidths=[CW])
    box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT),
        ('LEFTPADDING', (0, 0), (-1, -1), 16), ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('TOPPADDING', (0, 0), (-1, -1), 16), ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
    ]))
    return [Spacer(1, 6), box]


doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=50, rightMargin=50,
                        topMargin=64, bottomMargin=54,
                        title='Learn with Palla - 45-Day Automation Plans',
                        author='Palla Raghavendran')
story = [PageBreak()]
story += intro()
story += build_track(PLAYWRIGHT)
story.append(PageBreak())
story += build_track(SELENIUM)
story += closing()
doc.build(story, onFirstPage=cover, onLaterPages=header_footer)
print('PDF written:', OUT, '|', os.path.getsize(OUT), 'bytes')
