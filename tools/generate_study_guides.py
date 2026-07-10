"""
Generate the per-day "Study & Practice Guide" PDFs for the student portal.
Pure-Python (reportlab) — no native deps. Re-run any time a day's content
changes:  python tools/generate_study_guides.py

Output: assets/docs/day<N>-study-practice-guide.pdf (one per day below).
NOTE: the output PDFs are NOT committed / served from the site. Palla uploads
them to Google Drive (shared with the batch emails, like the videos) and the
portal references them via obfuscated Drive-id tokens in portal.js.
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, HRFlowable)

ROOT = r'C:\Users\palrag\Documents\PallasTech'
OUT_DIR = os.path.join(ROOT, 'assets', 'docs')

# ---- palette (matches the brochure: dark text on white, brand accents) ----
TEAL      = colors.HexColor('#0E9F84')
TEAL_DK   = colors.HexColor('#0B7E69')
INDIGO    = colors.HexColor('#4F46E5')
INDIGO_TT = colors.HexColor('#ECEDFB')
DARK      = colors.HexColor('#11161F')
GRAY      = colors.HexColor('#5B6B7C')
SEP       = colors.HexColor('#E6EBF1')
CODE_BG   = colors.HexColor('#F3F6FA')
AMBER     = colors.HexColor('#B45309')
AMBER_TT  = colors.HexColor('#FDF3E0')

W, H = A4
CW = W - 100  # content width (50pt margins)

st_eyebrow = ParagraphStyle('eyebrow', fontName='Helvetica-Bold', fontSize=10, leading=13,
                            textColor=TEAL_DK, spaceAfter=4)
st_title   = ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=22, leading=27,
                            textColor=DARK, spaceAfter=6)
st_sub     = ParagraphStyle('sub', fontName='Helvetica', fontSize=10.5, leading=15,
                            textColor=GRAY, spaceAfter=2)
st_h2      = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=13.5, leading=17,
                            textColor=INDIGO, spaceBefore=14, spaceAfter=6)
st_body    = ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=15,
                            textColor=DARK, spaceAfter=6)
st_bullet  = ParagraphStyle('bullet', parent=st_body, leftIndent=14, bulletIndent=2,
                            spaceAfter=3)
st_code    = ParagraphStyle('code', fontName='Courier', fontSize=9, leading=13,
                            textColor=DARK)
st_ex      = ParagraphStyle('ex', parent=st_body, leftIndent=18, bulletIndent=2, spaceAfter=5)
st_hint    = ParagraphStyle('hint', fontName='Helvetica-Oblique', fontSize=9, leading=13,
                            textColor=GRAY, leftIndent=18, spaceAfter=6)
st_chal    = ParagraphStyle('chal', fontName='Helvetica', fontSize=10, leading=15,
                            textColor=AMBER)
st_foot    = ParagraphStyle('foot', fontName='Helvetica', fontSize=9, leading=12,
                            textColor=GRAY)
st_thead   = ParagraphStyle('thead', fontName='Helvetica-Bold', fontSize=9.5, leading=12,
                            textColor=colors.white)
st_tcell   = ParagraphStyle('tcell', fontName='Helvetica', fontSize=9.5, leading=13,
                            textColor=DARK)
st_tcode   = ParagraphStyle('tcode', fontName='Courier', fontSize=9, leading=13,
                            textColor=DARK)


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def code_block(lines):
    rows = [[Paragraph(esc(l).replace(' ', '&nbsp;'), st_code)] for l in lines]
    t = Table(rows, colWidths=[CW])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CODE_BG),
        ('LINEBEFORE', (0, 0), (0, -1), 3, TEAL),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -2), 0),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 8),
    ]))
    return t


def ref_table(head, rows):
    data = [[Paragraph(esc(h), st_thead) for h in head]]
    for r in rows:
        data.append([Paragraph(cell if cell.startswith('<font') else esc(cell),
                               st_tcode if i == 0 else st_tcell)
                     for i, cell in enumerate(r)])
    n = len(head)
    t = Table(data, colWidths=[CW * 0.38] + [CW * 0.62 / (n - 1)] * (n - 1))
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), INDIGO),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, INDIGO_TT]),
        ('GRID', (0, 0), (-1, -1), 0.5, SEP),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


# ============================== guide content ==============================
# Each day: title, intro, sections (h2 + mix of paragraphs/bullets/code),
# quick-reference table, numbered practice exercises (text, optional hint),
# and a bonus challenge.
DAYS = [
    {
        'num': 1,
        'title': 'Node.js &amp; VS Code Installation',
        'intro': 'Everything from the Day 1 videos in one place: what you installed, '
                 'why it matters for automation, and hands-on tasks to make sure your '
                 'setup really works before Day 2.',
        'sections': [
            ('What is Node.js?', [
                ('p', 'Node.js is a <b>JavaScript runtime</b> — it lets you run JavaScript '
                      'outside the browser, straight from your terminal. Playwright, npm and '
                      'almost all modern test tooling run on top of it.'),
                ('b', 'It ships with <b>npm</b> (Node Package Manager), which installs '
                      'libraries like Playwright into your projects.'),
                ('b', 'Always install the <b>LTS</b> (Long-Term Support) version for '
                      'stability.'),
                ('c', ['node -v     // prints the Node version, e.g. v22.11.0',
                       'npm -v      // prints the npm version, e.g. 10.9.0']),
            ]),
            ('Visual Studio Code', [
                ('p', 'VS Code is the editor we use for the whole course. Two habits to '
                      'build from day one:'),
                ('b', 'Open the <b>integrated terminal</b> with <b>Ctrl + `</b> so you can '
                      'run code without leaving the editor.'),
                ('b', 'Open a project folder (File &gt; Open Folder, or <font face="Courier">code .</font> '
                      'from a terminal) instead of opening loose files.'),
                ('p', 'Recommended extensions: <b>Prettier</b> (auto-formatting) and, later '
                      'in the course, <b>Playwright Test for VS Code</b>.'),
            ]),
            ('Running your first script', [
                ('c', ['// hello.js',
                       'console.log("Hello from Node.js!");',
                       '',
                       '// in the terminal, from the file\'s folder:',
                       '// node hello.js']),
            ]),
        ],
        'ref_head': ['Command / shortcut', 'What it does'],
        'ref_rows': [
            ['node -v', 'Show the installed Node.js version (proves the install worked)'],
            ['npm -v', 'Show the installed npm version'],
            ['node file.js', 'Run a JavaScript file with Node'],
            ['code .', 'Open the current folder in VS Code'],
            ['Ctrl + `', 'Open / close the integrated terminal in VS Code'],
        ],
        'practice': [
            ('Open a terminal and run <font face="Courier">node -v</font> and '
             '<font face="Courier">npm -v</font>. Write both version numbers down.',
             'If either command is not recognised, Node is not on your PATH — re-run the '
             'installer and restart the terminal.'),
            ('Create a folder called <font face="Courier">learn-with-palla</font> and open '
             'it in VS Code.', None),
            ('Inside it, create <font face="Courier">hello.js</font> that prints '
             '"Hello, &lt;your name&gt;!" using <font face="Courier">console.log</font>, '
             'then run it with <font face="Courier">node hello.js</font>.', None),
            ('Add a second line that prints the result of <font face="Courier">7 * 6</font>.',
             'console.log can print numbers and expressions directly — no quotes needed.'),
            ('Install the Prettier extension, then right-click your file and choose '
             '"Format Document".', None),
        ],
        'challenge': 'Make a file <font face="Courier">today.js</font> that prints the current '
                     'date and time using <font face="Courier">new Date()</font>. Run it twice '
                     'and confirm the time changes.',
    },
    {
        'num': 2,
        'title': 'JavaScript Comments &amp; Variables',
        'intro': 'Recap of the Day 2 videos: writing comments that explain intent, and '
                 'declaring variables with let and const — the containers every test '
                 'you ever write will use.',
        'sections': [
            ('Comments', [
                ('p', 'Comments are notes for humans — JavaScript ignores them. Use them to '
                      'explain <b>why</b> code exists, not to repeat what it does.'),
                ('c', ['// single-line comment',
                       '',
                       '/* multi-line comment:',
                       '   useful for longer explanations',
                       '   or temporarily disabling code */']),
            ]),
            ('Variables: let, const (and var)', [
                ('b', '<b>const</b> — the default choice. The variable cannot be '
                      'reassigned.'),
                ('b', '<b>let</b> — use when the value needs to change (counters, '
                      'accumulators).'),
                ('b', '<b>var</b> — the legacy keyword. Avoid it; you will see why in '
                      'Day 3 (scoping).'),
                ('c', ['const courseName = "Playwright";  // fixed value',
                       'let score = 10;                   // will change',
                       'score = score + 5;                // OK',
                       '// courseName = "Cypress";        // Error! const cannot be reassigned']),
            ]),
            ('Naming rules &amp; conventions', [
                ('b', 'Names may contain letters, digits, <font face="Courier">_</font> and '
                      '<font face="Courier">$</font> — but cannot <b>start</b> with a digit.'),
                ('b', 'Names are case-sensitive: <font face="Courier">userName</font> and '
                      '<font face="Courier">username</font> are different variables.'),
                ('b', 'Reserved words (<font face="Courier">let</font>, '
                      '<font face="Courier">if</font>, <font face="Courier">class</font>...) '
                      'cannot be used as names.'),
                ('b', 'Convention: <b>camelCase</b> for variables — '
                      '<font face="Courier">firstName</font>, '
                      '<font face="Courier">totalPrice</font>, '
                      '<font face="Courier">isLoggedIn</font>.'),
            ]),
        ],
        'ref_head': ['Keyword', 'Reassignable?', 'When to use'],
        'ref_rows': [
            ['const', 'No', 'Default — values that never change'],
            ['let', 'Yes', 'Values that change (counters, loops)'],
            ['var', 'Yes', 'Legacy — avoid in new code'],
        ],
        'practice': [
            ('Declare <font face="Courier">const courseName = "Playwright"</font>, then try '
             'to reassign it. Read the error message carefully — you will meet it again.',
             'TypeError: Assignment to constant variable.'),
            ('Declare <font face="Courier">let score = 10</font>, add 5 to it, and print the '
             'result.', None),
            ('Write a small script with a one-line comment on top describing what it does, '
             'and one multi-line comment explaining a decision.', None),
            ('Which of these names are invalid, and why? <font face="Courier">1name</font>, '
             '<font face="Courier">first-name</font>, <font face="Courier">let</font>, '
             '<font face="Courier">$total</font>, <font face="Courier">user_2</font>.',
             'Two are invalid, one is a reserved word — and two are perfectly fine.'),
            ('Create <font face="Courier">a = 1</font> and <font face="Courier">b = 2</font> '
             '(with let), then swap their values using a third variable. Print both.', None),
        ],
        'challenge': 'Create three variables — <font face="Courier">name</font>, '
                     '<font face="Courier">age</font>, <font face="Courier">city</font> — and '
                     'print them in a single console.log as one sentence. (After Day 4 you can '
                     'rewrite it with a template literal.)',
    },
    {
        'num': 3,
        'title': 'Data Types &amp; Variable Scoping',
        'intro': 'Recap of the Day 3 videos: the seven values typeof can show you, and '
                 'where a variable "lives" — global, function or block scope — plus the '
                 'real reason we avoid var.',
        'sections': [
            ('The basic data types', [
                ('c', ['typeof "Palla"     // "string"',
                       'typeof 45          // "number"',
                       'typeof true        // "boolean"',
                       'typeof undefined   // "undefined"',
                       'typeof { id: 1 }   // "object"',
                       'typeof null        // "object"  <-- famous JS quirk!']),
                ('b', '<b>undefined</b> — a variable that was declared but never given a '
                      'value.'),
                ('b', '<b>null</b> — an intentional "no value", set by you on purpose.'),
                ('b', '<font face="Courier">typeof null</font> returns '
                      '<font face="Courier">"object"</font> — a 30-year-old bug that is now '
                      'part of the language. Interviewers love this one.'),
            ]),
            ('Variable scoping', [
                ('b', '<b>Global scope</b> — declared outside everything; visible '
                      'everywhere.'),
                ('b', '<b>Function scope</b> — declared inside a function; invisible '
                      'outside it.'),
                ('b', '<b>Block scope</b> — <font face="Courier">let</font> and '
                      '<font face="Courier">const</font> live only inside the nearest '
                      '<font face="Courier">{ }</font>. <font face="Courier">var</font> '
                      'ignores blocks — that is why we avoid it.'),
                ('c', ['if (true) {',
                       '  let inside = "block only";',
                       '  var leaky  = "escapes the block";',
                       '}',
                       '// console.log(inside);  // ReferenceError',
                       'console.log(leaky);      // "escapes the block"  (var leaked!)']),
            ]),
        ],
        'ref_head': ['Expression', 'Result'],
        'ref_rows': [
            ['typeof "text"', '"string"'],
            ['typeof 3.14', '"number"'],
            ['typeof false', '"boolean"'],
            ['typeof undefined', '"undefined"'],
            ['typeof null', '"object"  (the quirk — remember it)'],
            ['typeof {}', '"object"'],
            ['typeof []', '"object"  (arrays are objects too)'],
        ],
        'practice': [
            ('Before running anything, predict the typeof result for: '
             '<font face="Courier">"45"</font>, <font face="Courier">45</font>, '
             '<font face="Courier">true</font>, <font face="Courier">null</font>, '
             '<font face="Courier">undefined</font>, <font face="Courier">[1,2]</font>. '
             'Then verify each in Node.',
             'Watch out: "45" in quotes is a string, and two of these say "object".'),
            ('Create an object <font face="Courier">student</font> with properties name, '
             'batch and score. Print just the name.', None),
            ('Write an if-block that declares a variable with let inside it, then try to '
             'print that variable after the block. What happens?',
             'ReferenceError — that is block scope protecting you.'),
            ('Repeat exercise 3 with var instead of let. Compare the behaviour.', None),
            ('Declare a variable without a value and print it, then set it to null and '
             'print again. Explain the difference in a comment.', None),
        ],
        'challenge': 'Write a loop: <font face="Courier">for (var i = 0; i &lt; 3; i++)</font> '
                     'then print <font face="Courier">i</font> AFTER the loop. Now change var '
                     'to let. One version prints 3, the other crashes — write a comment '
                     'explaining why.',
    },
    {
        'num': 4,
        'title': 'Template Literals &amp; Truthy/Falsy Values',
        'intro': 'Recap of the Day 4 video: building strings with backticks and ${ } '
                 'instead of messy concatenation, and the six falsy values that decide '
                 'what an if-statement really does.',
        'sections': [
            ('Template literals', [
                ('p', 'Template literals use <b>backticks</b> (`) instead of quotes. Inside '
                      'them, <font face="Courier">${ }</font> drops any expression straight '
                      'into the string — and line breaks are kept as-is.'),
                ('c', ['const name = "Palla";',
                       '',
                       '// old way — concatenation:',
                       'const msg1 = "Hi " + name + ", you scored " + (40 + 5) + "!";',
                       '',
                       '// new way — template literal:',
                       'const msg2 = `Hi ${name}, you scored ${40 + 5}!`;',
                       '',
                       'const multi = `line one',
                       'line two`;   // real line break, no \\n needed']),
                ('b', 'In automation you will use these constantly: '
                      '<font face="Courier">`Test case ${id} failed on ${browser}`</font>.'),
            ]),
            ('Truthy &amp; falsy values', [
                ('p', 'When JavaScript needs a yes/no answer — like inside '
                      '<font face="Courier">if (value)</font> — every value converts to '
                      'true or false. Only <b>six values are falsy</b>; everything else is '
                      'truthy.'),
                ('c', ['// the SIX falsy values — memorise them:',
                       'false   0   ""   null   undefined   NaN',
                       '',
                       'if ("hello") { }   // runs   — non-empty string is truthy',
                       'if (0)       { }   // skipped — 0 is falsy',
                       'if ([])      { }   // runs   — empty array is TRUTHY!',
                       'if ({})      { }   // runs   — empty object is TRUTHY!',
                       '',
                       'Boolean("")        // false  — check any value yourself',
                       '!!"text"           // true   — the double-bang shortcut']),
            ]),
        ],
        'ref_head': ['Value', 'Truthy or falsy?'],
        'ref_rows': [
            ['false, 0, "", null, undefined, NaN', 'The six falsy values — everything else is truthy'],
            ['"0"  (string zero)', 'Truthy — it is a non-empty string'],
            ['[]  (empty array)', 'Truthy — a common surprise'],
            ['{}  (empty object)', 'Truthy — a common surprise'],
            ['-1  (negative number)', 'Truthy — only 0 (and NaN) are falsy numbers'],
        ],
        'practice': [
            ('Rewrite with a template literal: <font face="Courier">"User " + user + " has " '
             '+ count + " messages"</font>.', None),
            ('Build a three-line address string using ONE template literal with real line '
             'breaks (no \\n).', None),
            ('Predict truthy or falsy, then verify each with '
             '<font face="Courier">Boolean(...)</font> in Node: '
             '<font face="Courier">"0"</font>, <font face="Courier">0</font>, '
             '<font face="Courier">""</font>, <font face="Courier">" "</font>, '
             '<font face="Courier">[]</font>, <font face="Courier">undefined</font>, '
             '<font face="Courier">NaN</font>, <font face="Courier">-1</font>.',
             'Exactly four of these are falsy.'),
            ('Write a function <font face="Courier">check(value)</font> that prints '
             '`${value} is truthy` or `${value} is falsy` using a template literal.', None),
            ('Loop i from 1 to 5 and print <font face="Courier">`Test case ${i} passed`</font> '
             'each time.', None),
        ],
        'challenge': 'Write <font face="Courier">greet(name)</font> that prints '
                     '<font face="Courier">`Hello, ${name}!`</font> — but when name is falsy '
                     '(empty string, undefined...) it greets "Guest" instead. '
                     'Hint: <font face="Courier">name || "Guest"</font>.',
    },
    {
        'num': 5,
        'title': 'Type Conversion &amp; Maths with null/undefined',
        'intro': 'Recap of the Day 5 videos: converting values between types on purpose '
                 '(and how JavaScript converts them behind your back), plus the two '
                 'special cases every tester must know — null becomes 0, undefined '
                 'becomes NaN.',
        'sections': [
            ('Explicit type conversion', [
                ('p', 'Explicit conversion is when <b>you</b> change the type, using the '
                      'three built-in converter functions. This is the safe, readable way '
                      '— say what you mean.'),
                ('c', ['Number("45")     // 45      — string to number',
                       'Number("45px")   // NaN     — not a clean number',
                       'Number("")       // 0       — surprise! empty string is 0',
                       '',
                       'String(45)       // "45"    — number to string',
                       'String(true)     // "true"',
                       '',
                       'Boolean("hi")    // true    — same rules as truthy/falsy (Day 4)',
                       'Boolean(0)       // false']),
                ('b', 'In automation this matters constantly: everything you read from a '
                      'web page — input values, prices, counts — arrives as a <b>string</b>. '
                      'Convert before you compare: '
                      '<font face="Courier">Number(priceText) &gt; 100</font>.'),
            ]),
            ('Implicit conversion (coercion)', [
                ('p', 'Implicit conversion is when <b>JavaScript</b> changes the type for '
                      'you, based on the operator. The <b>+</b> operator is the troublemaker: '
                      'if either side is a string, it glues (concatenates) instead of adding.'),
                ('c', ['"45" + 1     // "451"  — + with a string concatenates!',
                       '"45" - 1     // 44     — -, *, / convert to numbers',
                       '"45" * 2     // 90',
                       '"6" / "2"    // 3',
                       '',
                       '// the classic interview line:',
                       '1 + "2" + 3  // "123"']),
            ]),
            ('null and undefined in maths', [
                ('p', 'When null and undefined land in a numeric expression they behave '
                      'completely differently — this is a favourite interview question and '
                      'a real source of test bugs when data is missing.'),
                ('c', ['10 + null        // 10   — null converts to 0',
                       '10 * null        // 0',
                       '',
                       '10 + undefined   // NaN  — undefined converts to NaN',
                       '10 * undefined   // NaN',
                       '',
                       'Number(null)       // 0',
                       'Number(undefined)  // NaN',
                       '',
                       '// NaN poisons everything it touches:',
                       'NaN === NaN        // false!  use Number.isNaN(x)']),
                ('b', 'Rule of thumb: <b>null → 0</b>, <b>undefined → NaN</b> — and any '
                      'calculation containing NaN stays NaN.'),
            ]),
        ],
        'ref_head': ['Expression', 'Result — and why'],
        'ref_rows': [
            ['Number("45") / Number("")', '45 / 0 — strings convert cleanly; empty string is 0'],
            ['Number("45px")', 'NaN — not a valid number'],
            ['"45" + 1', '"451" — + with a string concatenates'],
            ['"45" - 1', '44 — the other maths operators convert to numbers'],
            ['10 + null', '10 — null becomes 0 in maths'],
            ['10 + undefined', 'NaN — undefined becomes NaN'],
            ['NaN === NaN', 'false — check with Number.isNaN(x) instead'],
        ],
        'practice': [
            ('Predict each result, then verify in Node: '
             '<font face="Courier">Number("100")</font>, '
             '<font face="Courier">Number("100rs")</font>, '
             '<font face="Courier">Number("")</font>, '
             '<font face="Courier">String(2026)</font>, '
             '<font face="Courier">Boolean("false")</font>.',
             'Careful with the last one — "false" is a non-empty string.'),
            ('Predict, then verify: <font face="Courier">"5" + 5</font>, '
             '<font face="Courier">"5" - 5</font>, <font face="Courier">"5" * "2"</font>, '
             '<font face="Courier">1 + "2" + 3</font>.', None),
            ('Predict, then verify: <font face="Courier">7 + null</font>, '
             '<font face="Courier">7 - null</font>, <font face="Courier">7 + undefined</font>, '
             '<font face="Courier">null + undefined</font>.',
             'Remember: null → 0, undefined → NaN.'),
            ('A web page gives you <font face="Courier">const price = "1499"</font> (a string). '
             'Write code that adds 18% tax and prints the total as a number.',
             'Convert first with Number(price), then multiply by 1.18.'),
            ('Write a function <font face="Courier">safeAdd(a, b)</font> that treats null OR '
             'undefined arguments as 0, so <font face="Courier">safeAdd(10, undefined)</font> '
             'returns 10 instead of NaN.',
             'Convert each argument with (x || 0), or check Number.isNaN after converting.'),
        ],
        'challenge': 'Build <font face="Courier">toNumberReport(value)</font> that prints '
                     '<font face="Courier">`${value} → ${Number(value)}`</font> for any input, '
                     'then run it on: "42", "42abc", "", " ", true, false, null, undefined, '
                     '[] and [7]. Two of the results will surprise you — write down which two '
                     'and why.',
    },
    {
        'num': 6,
        'title': 'Arithmetic, Assignment &amp; Comparison Operators',
        'intro': 'Recap of the Day 6 videos: the maths operators (including % and **), '
                 'the compound assignment shortcuts like += and *=, and the comparison '
                 'operators — with the single most important rule of the day: always '
                 'prefer === over ==.',
        'sections': [
            ('Arithmetic operators', [
                ('p', 'JavaScript has six arithmetic operators. Four you know from school '
                      '— plus two that show up constantly in interviews and real code: '
                      '<b>%</b> (remainder) and <b>**</b> (exponent).'),
                ('c', ['7 + 3    // 10   addition',
                       '7 - 3    // 4    subtraction',
                       '7 * 3    // 21   multiplication',
                       '7 / 3    // 2.3333...  division (no integer division in JS)',
                       '7 % 3    // 1    remainder (modulus) — what is LEFT OVER',
                       '2 ** 3   // 8    exponent — 2 to the power 3']),
                ('b', '<b>%</b> is the tester\'s friend: <font face="Courier">n % 2 === 0'
                      '</font> means n is even — handy for alternating rows in a table.'),
                ('b', 'Operator precedence works like maths: <font face="Courier">2 + 3 * 4'
                      '</font> is 14, not 20. Use parentheses to make intent obvious: '
                      '<font face="Courier">(2 + 3) * 4</font>.'),
            ]),
            ('Assignment operators', [
                ('p', 'The <b>=</b> sign assigns a value. Every arithmetic operator has a '
                      'compound shortcut that updates a variable in place:'),
                ('c', ['let score = 10;',
                       'score += 5;    // score = score + 5   → 15',
                       'score -= 3;    // score = score - 3   → 12',
                       'score *= 2;    // score = score * 2   → 24',
                       'score /= 4;    // score = score / 4   → 6',
                       'score %= 4;    // score = score % 4   → 2',
                       'score **= 3;   // score = score ** 3  → 8']),
                ('b', 'Read <font face="Courier">score += 5</font> as "add 5 to score". '
                      'It only works on variables declared with <b>let</b> — a const '
                      'cannot be reassigned (Day 2!).'),
            ]),
            ('Comparison operators', [
                ('p', 'Comparison operators always produce a <b>boolean</b> — true or '
                      'false. They are the heart of every assertion your tests will make.'),
                ('c', ['5 &gt; 3     // true    greater than',
                       '5 &lt; 3     // false   less than',
                       '5 &gt;= 5    // true    greater than or equal',
                       '5 &lt;= 4    // false   less than or equal',
                       '',
                       '"5" ==  5   // true   loose equality — CONVERTS types first',
                       '"5" === 5   // false  strict equality — types must match too',
                       '"5" !=  5   // false  loose not-equal',
                       '"5" !== 5   // true   strict not-equal']),
                ('b', '<b>Rule of the day: always use === and !==.</b> Loose == converts '
                      'types behind your back ("5" == 5 is true!) and causes bugs that '
                      'are painful to find. Strict === has no surprises.'),
                ('b', 'This matters in automation because everything read from a page is '
                      'a <b>string</b> (Day 5). <font face="Courier">countText === 3</font> '
                      'is always false — convert first: '
                      '<font face="Courier">Number(countText) === 3</font>.'),
            ]),
        ],
        'ref_head': ['Expression', 'Result — and why'],
        'ref_rows': [
            ['7 % 3', '1 — the remainder after dividing 7 by 3'],
            ['2 ** 3', '8 — exponent: 2 × 2 × 2'],
            ['score += 5', 'Shortcut for score = score + 5 (needs let, not const)'],
            ['"5" == 5', 'true — loose equality converts the string first'],
            ['"5" === 5', 'false — strict equality: number vs string'],
            ['"5" !== 5', 'true — strict not-equal (the one to use)'],
            ['5 >= 5', 'true — greater than OR equal'],
        ],
        'practice': [
            ('Predict each result, then verify in Node: '
             '<font face="Courier">10 % 4</font>, <font face="Courier">4 % 10</font>, '
             '<font face="Courier">3 ** 2</font>, <font face="Courier">2 + 3 * 4</font>, '
             '<font face="Courier">(2 + 3) * 4</font>.',
             '4 % 10 surprises most people — 4 divided by 10 is 0 remainder 4.'),
            ('Start with <font face="Courier">let points = 100</font>, then apply in order: '
             '<font face="Courier">+= 20</font>, <font face="Courier">-= 50</font>, '
             '<font face="Courier">*= 2</font>, <font face="Courier">%= 7</font>. '
             'Predict the final value before you run it.', None),
            ('Predict, then verify: <font face="Courier">"10" == 10</font>, '
             '<font face="Courier">"10" === 10</font>, <font face="Courier">0 == false</font>, '
             '<font face="Courier">0 === false</font>, <font face="Courier">null == undefined'
             '</font>, <font face="Courier">null === undefined</font>.',
             'The last pair is a classic interview question.'),
            ('Write code that checks whether a number stored in '
             '<font face="Courier">const year = 2026</font> is even, and prints '
             '"even" or "odd".',
             'year % 2 === 0 — combine it with the ternary or an if from earlier days.'),
            ('A page gives you <font face="Courier">const priceText = "1499"</font>. Write '
             'the WRONG check (<font face="Courier">priceText === 1499</font>) and the RIGHT '
             'check, and print both results.',
             'Convert with Number(priceText) before comparing — Day 5 + Day 6 together.'),
        ],
        'challenge': 'FizzBuzz, the most famous interview warm-up: for the numbers 1 to 15, '
                     'print "Fizz" if the number is divisible by 3, "Buzz" if divisible by 5, '
                     '"FizzBuzz" if divisible by both, otherwise the number itself. '
                     'Everything you need is % and === . (Use a for loop if you know one, '
                     'or just write 15 checks — the operators are the point.)',
    },
]


def build_day(day):
    out = os.path.join(OUT_DIR, 'day%d-study-practice-guide.pdf' % day['num'])
    doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=50, rightMargin=50,
                            topMargin=46, bottomMargin=46,
                            title='Day %d Study & Practice Guide — Learn with Palla' % day['num'],
                            author='Learn with Palla')
    story = []

    # header
    story.append(Paragraph('DAY %d  ·  LEARN WITH PALLA  ·  STUDY &amp; PRACTICE GUIDE'
                           % day['num'], st_eyebrow))
    story.append(Paragraph(day['title'], st_title))
    story.append(Paragraph(day['intro'], st_sub))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width='100%', thickness=1.2, color=TEAL, spaceAfter=4))

    # study sections
    for heading, items in day['sections']:
        story.append(Paragraph(heading, st_h2))
        for kind, content in items:
            if kind == 'p':
                story.append(Paragraph(content, st_body))
            elif kind == 'b':
                story.append(Paragraph(content, st_bullet, bulletText='•'))
            elif kind == 'c':
                story.append(Spacer(1, 3))
                story.append(code_block(content))
                story.append(Spacer(1, 6))

    # quick reference
    story.append(Paragraph('Quick reference', st_h2))
    story.append(ref_table(day['ref_head'], day['ref_rows']))

    # practice
    story.append(Paragraph('Practice exercises', st_h2))
    story.append(Paragraph('Do these in VS Code, run them with Node, and bring questions '
                           'to the next live Q&amp;A.', st_body))
    for i, (text, hint) in enumerate(day['practice'], 1):
        story.append(Paragraph(text, st_ex, bulletText='%d.' % i))
        if hint:
            story.append(Paragraph('Hint: ' + hint, st_hint))
    story.append(Spacer(1, 4))

    # bonus challenge
    chal = Table([[Paragraph('<b>Bonus challenge</b> — ' + day['challenge'], st_chal)]],
                 colWidths=[CW])
    chal.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), AMBER_TT),
        ('LINEBEFORE', (0, 0), (0, -1), 3, AMBER),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(chal)

    # footer
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width='100%', thickness=0.8, color=SEP, spaceAfter=6))
    story.append(Paragraph('learnwithpalla.com  ·  Playwright + TypeScript — 45-day course  ·  '
                           'This guide accompanies the Day %d videos in your student portal.'
                           % day['num'], st_foot))

    doc.build(story)
    return out


if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)
    for d in DAYS:
        print('wrote', build_day(d))
