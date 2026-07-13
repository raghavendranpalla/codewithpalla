# Interview Practice #1 (Days 1-7) — slide generator + narration manifest
# Writes SVG slides in ./slides and manifest.json for the assembler.
import io, json, os, textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.join(HERE, 'slides')
os.makedirs(SLIDES, exist_ok=True)

QA = [
 dict(q='What is Node.js, and why do we need it for test automation?',
      head='JavaScript outside the browser',
      bullets=['Node.js = JavaScript runtime built on Chrome’s V8 engine',
               'Runs JS from the terminal / VS Code — no web page needed',
               'Playwright and its test runner run on Node',
               'npm (comes with Node) installs all our packages'],
      code=[],
      a_narr="Node JS is a runtime that lets JavaScript run outside the browser — it's built on Chrome's V8 engine. In the browser, JavaScript needs a web page; with Node, we run JavaScript files straight from the terminal or VS Code. Our whole automation stack — Playwright and its test runner — runs on Node, and npm, which comes with it, installs all our packages."),
 dict(q='What is the difference between let, const and var?',
      head='const first, let when needed',
      bullets=['const — cannot be reassigned; your default choice',
               'let — can be reassigned; block-scoped like const',
               'var — old style, function-scoped, hoisted — avoid it',
               'Rule: start with const, switch to let only if it must change'],
      code=[],
      a_narr="const declares a value that cannot be reassigned — that's the default choice. let can be reassigned, and both let and const are block scoped. var is the old way — function scoped, hoisted, full of surprises — avoid it in new code. Rule of thumb: use const first, switch to let only when the value must change."),
 dict(q='What happens if you try to reassign a const variable?',
      head='TypeError — and that’s the point',
      bullets=['Runtime error: the program stops right there',
               'const documents intent: this value never changes',
               'The engine enforces it — not just a convention'],
      code=['const pi = 3.14;', 'pi = 3;  // TypeError: Assignment to constant variable.'],
      a_narr="JavaScript throws a TypeError — assignment to constant variable — and the program stops right there. And that's the point of const: anyone reading the code knows this value will never change, and the engine enforces it."),
 dict(q='What are the primitive data types in JavaScript?',
      head='Seven primitives',
      bullets=['string, number, boolean',
               'undefined and null',
               'bigint and symbol (the rare two)',
               'Everything else is an object — check with typeof'],
      code=['typeof "hi"   // "string"', 'typeof 42     // "number"'],
      a_narr="Seven primitives: string, number, boolean, undefined, null, and the two rare ones — bigint and symbol. Everything else — arrays, functions, objects — is an object type. And remember, we check a value's type with the typeof operator."),
 dict(q='What is the difference between null and undefined?',
      head='Missing vs intentionally empty',
      bullets=['undefined — declared but never assigned; JS puts it there',
               'null — YOU assign it to say “nothing here” on purpose',
               'null == undefined → true, but null === undefined → false',
               'In maths: null → 0, undefined → NaN'],
      code=[],
      a_narr="undefined means a variable exists but hasn't been given a value — JavaScript puts it there. null is a value you assign on purpose, to say nothing here. Loosely, null double-equals undefined is true; strictly, with triple equals, it's false. And in arithmetic they differ — null becomes zero, undefined becomes NaN."),
 dict(q='What is block scope? Where can a let variable be used?',
      head='Alive only between its { }',
      bullets=['A block = code between curly braces (if, loop, or bare { })',
               'let / const exist only inside the block they’re declared in',
               'Using them outside → ReferenceError',
               'var ignores block scope — one more reason to avoid it'],
      code=['if (true) { let x = 1; }', 'console.log(x);  // ReferenceError'],
      a_narr="A block is anything between curly braces — an if, a loop, or just braces on their own. Variables declared with let or const exist only inside that block; touch them outside and you get a ReferenceError. var doesn't respect block scope — one more reason we don't use it."),
 dict(q='What are template literals, and why are they better than string concatenation?',
      head='Backticks + ${…}',
      bullets=['Strings written with backticks instead of quotes',
               '${expression} embeds any value directly in the string',
               'Real multi-line strings — no \\n gymnastics',
               'Perfect for selectors and messages in automation'],
      code=['const name = "Palla";', 'console.log(`Hello ${name}!`);  // Hello Palla!'],
      a_narr="Template literals are strings written with backticks instead of quotes. Inside them, dollar and curly braces embed any expression directly — so instead of gluing strings together with plus signs, you write the sentence naturally. They also support real multi-line strings. In test automation they're perfect for building selectors and messages."),
 dict(q='What are the falsy values in JavaScript? List them.',
      head='Exactly six falsy values',
      bullets=['false,  0,  "" (empty string)',
               'null,  undefined,  NaN',
               'EVERYTHING else is truthy —',
               'including "0", "false", [ ] and { }'],
      code=[],
      a_narr="There are exactly six falsy values: false, the number zero, an empty string, null, undefined, and NaN. Every other value is truthy — including the string zero, the string false, empty arrays and empty objects. Interviewers love this list — know all six."),
 dict(q='Is the string "0" truthy or falsy? And the number 0?',
      head='"0" is truthy, 0 is falsy',
      bullets=['Any NON-EMPTY string is truthy — content doesn’t matter',
               'The number 0 is falsy',
               'The only falsy string is the empty one: ""'],
      code=['if ("0") { ... }  // runs!', 'if ( 0 )  { ... }  // skipped'],
      a_narr="The string zero is truthy, because any non-empty string is truthy — the content doesn't matter. The number zero is falsy. So an if on the string zero runs, but an if on the number zero doesn't. The only falsy string is the empty one."),
 dict(q='What is the difference between implicit and explicit type conversion?',
      head='You convert vs JS converts',
      bullets=['Explicit — you do it: Number(x), String(x), Boolean(x)',
               'Implicit (coercion) — JS quietly converts for you',
               'Coercion is where the weird bugs live',
               'In tests: convert explicitly, then compare'],
      code=['"5" * 2          // 10  (implicit)', 'Number("5") * 2  // 10  (explicit — visible!)'],
      a_narr="Explicit conversion is when you do it yourself with Number, String or Boolean — it's visible in the code. Implicit conversion, or coercion, is when JavaScript quietly converts for you — like the string five times two giving the number ten. Coercion is where the weird bugs live, so in tests: convert explicitly, then compare."),
 dict(q='What is NaN, and what does typeof NaN return?',
      head='Not-a-Number… of type number',
      bullets=['NaN = result of a failed numeric operation',
               'typeof NaN → "number"  — the classic trick question',
               'NaN is the ONLY value not equal to itself',
               'Detect it with Number.isNaN(x)'],
      code=['Number("hello")  // NaN', 'NaN === NaN      // false!'],
      a_narr="NaN means Not a Number — it's what you get when a numeric operation fails, like Number of the string hello. The trick question: typeof NaN is, ironically, number. And NaN is the only value in JavaScript that is not equal to itself — so use Number dot isNaN to detect it."),
 dict(q='What do null + 1 and undefined + 1 evaluate to?',
      head='1 — and NaN',
      bullets=['null + 1 → 1   (null converts to 0)',
               'undefined + 1 → NaN   (undefined poisons the maths)',
               'Exactly what happens when test data is missing',
               'Guard your inputs before doing arithmetic'],
      code=[],
      a_narr="null plus one is one, because null converts to zero in arithmetic. undefined plus one is NaN, because undefined becomes NaN and poisons the whole expression. This is exactly what happens when a field is missing in your test data — so guard your inputs before doing maths."),
 dict(q='What is the difference between == and ===?',
      head='Always use ===',
      bullets=['==  loose — converts types first:  "5" == 5 → true',
               '=== strict — types must match:  "5" === 5 → false',
               'Rule for life: always === and !==',
               'Page text is a string — Number() it, then compare'],
      code=[],
      a_narr="Double equals is loose equality — it converts the types first, so string five double-equals number five is true. Triple equals is strict — no conversion, the types must match, so the same comparison is false. The rule for life: always use triple equals. If the types differ, convert explicitly and then compare."),
 dict(q='What does the % operator do? Give a practical use in testing.',
      head='The remainder operator',
      bullets=['7 % 3 → 1 — what’s LEFT OVER after dividing',
               'n % 2 === 0 → n is even — alternating rows, batching',
               'Small trap: 4 % 10 → 4 (not 0!)'],
      code=['7 % 3   // 1', '4 % 10  // 4  — surprises everyone once'],
      a_narr="Percent is the remainder operator — seven mod three is one: what's left after dividing. The classic use: n mod two equals zero tells you a number is even — handy for alternating table rows or splitting test data into batches. And a small trap: four mod ten is four, not zero."),
 dict(q='What is the result of "5" + 3 and "5" - 3, and why?',
      head='"53" — but 2',
      bullets=['"5" + 3 → "53" — with a string, + concatenates',
               '"5" - 3 → 2 — minus has no string meaning, so it converts',
               '+ is the odd one out among the operators',
               'Fix: Number("5") + 3 → 8 — convert first, then calculate'],
      code=[],
      a_narr="String five plus three gives the string fifty-three, because when either side of a plus is a string, JavaScript concatenates. But string five minus three gives the number two — minus has no string meaning, so JavaScript converts. Plus is the odd one out. The fix, as always: convert first, then calculate."),
 dict(q='What are compound assignment operators? What does score **= 2 do?',
      head='Update in place',
      bullets=['Shortcuts that operate AND assign: += -= *= /= %= **=',
               'score **= 2  →  score = score ** 2 (squared)',
               'They reassign — so they need let, not const'],
      code=['let score = 4;', 'score += 1;   // 5', 'score **= 2;  // 25'],
      a_narr="Compound assignment operators combine an operation with assignment: plus-equals adds to a variable in place, and the same shortcut exists for minus, multiply, divide, remainder and exponent. Score star-star-equals two squares the score. They reassign the variable — so they only work with let; a const would throw."),
 dict(q='What is the difference between && and ||? What is short-circuit evaluation?',
      head='AND, OR — and lazy evaluation',
      bullets=['&& (AND) — true only if EVERY side is true',
               '|| (OR) — ONE true side is enough',
               'Short-circuit: JS stops once the answer is known',
               'false && x → x never runs;  true || x → same'],
      code=[],
      a_narr="Double ampersand is AND — the whole expression is true only if every side is true. Double pipe is OR — one true side is enough. Short-circuiting means JavaScript stops as soon as the answer is known: if the left of an AND is false, the right side never even runs. That's why order matters when the right side is slow — or can crash."),
 dict(q='What is the ternary operator? When would you use it instead of if/else?',
      head='if/else in one line',
      bullets=['condition ? valueIfTrue : valueIfFalse',
               'Best when simply PICKING between two values',
               'Read ? as “then” and : as “otherwise”',
               'Never nest ternaries — switch back to if/else'],
      code=['const result = score >= 50 ? "PASS" : "FAIL";'],
      a_narr="The ternary is the three-part operator: a condition, a question mark, the value if true, a colon, the value if false. It's an if-else squeezed into one expression, and it shines when you're just choosing between two values — like pass or fail from a score. But the moment you want to nest one inside another — go back to if-else."),
 dict(q='How does the switch statement work, and why is break important?',
      head='One value, many cases',
      bullets=['Compares ONE value against many case labels',
               'A matching case runs until it hits break',
               'No break → fall-through: the NEXT case runs too',
               'default = the “else” — runs when nothing matched'],
      code=['case "Mon": start(); break;', 'default: console.log("no match");'],
      a_narr="Switch takes one value and compares it against a list of cases. When a case matches, execution starts there — and keeps going into the next case unless you break. That's fall-through: occasionally useful for grouping cases, usually a bug. And default is your safety net when nothing matched."),
 dict(q='switch(count) where count is the number 3 — will case "3" match? Why?',
      head='No — switch uses ===',
      bullets=['switch compares with STRICT equality (===)',
               'number 3 !== string "3" — so no match; default runs',
               'The type is part of the value — convert first if needed'],
      code=['switch (3) {', '  case "3": ...   // never matches', '  default:  ...   // this runs', '}'],
      a_narr="No. Switch compares with strict equality — triple equals — so the number three never matches the string three, and you fall through to default. It's the same lesson from the type conversion and comparison days: in JavaScript, the type is part of the value. Convert first if you need to."),
]

INTRO_NARR = ("Welcome to your first interview practice session at Learn with Palla. "
              "Here's how this works: I'll ask you a question, and you get forty-five seconds. "
              "Answer out loud, as if you're sitting in a real interview. When the time is up, "
              "I'll give you the answer — compare it with yours and evaluate yourself honestly. "
              "Twenty questions today, covering everything from day one to day seven. "
              "This way, while you're learning JavaScript, you're getting interview-ready in parallel. "
              "Let's begin.")
OUTRO_NARR = ("And that's all twenty questions — well done for staying till the end. "
              "Now be honest with your self-evaluation: for any question you couldn't answer confidently, "
              "go back, rewatch that day's video, read the study guide — and retake this interview in a few days. "
              "Do this after every module, and by the end of the course, interviews will feel like just another class. "
              "See you in the next session.")

# ---------------------------------------------------------------- svg helpers
DEFS = '''  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7df1e"/><stop offset=".5" stop-color="#22d3ee"/><stop offset="1" stop-color="#818cf8"/>
    </linearGradient>
    <radialGradient id="glowL" cx="12%" cy="-5%" r="55%">
      <stop offset="0" stop-color="#f7df1e" stop-opacity=".18"/><stop offset="1" stop-color="#f7df1e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowR" cx="96%" cy="2%" r="55%">
      <stop offset="0" stop-color="#818cf8" stop-opacity=".24"/><stop offset="1" stop-color="#818cf8" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".035" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1280" height="720" fill="#0a0e14"/>
  <rect width="1280" height="720" fill="url(#grid)"/>
  <rect width="1280" height="720" fill="url(#glowL)"/>
  <rect width="1280" height="720" fill="url(#glowR)"/>
'''
SANS = "'Segoe UI',Inter,Arial,sans-serif"
MONO = "'JetBrains Mono',Consolas,monospace"
FOOT = '  <text x="96" y="695" font-family="%s" font-size="22" fill="#7e8da2">&lt;/&gt; learnwithpalla.com</text>\n' % MONO

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def svg(body, aria):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="%s">\n'
            % esc(aria)) + DEFS + body + FOOT + '</svg>\n'

def write(name, content):
    io.open(os.path.join(SLIDES, name), 'w', encoding='utf-8').write(content)
    print('wrote', name)

# ---------------------------------------------------------------- Q slides
for i, qa in enumerate(QA, 1):
    lines = textwrap.wrap(qa['q'], 32)
    b = '  <text x="96" y="120" font-family="%s" font-size="24" letter-spacing="6" font-weight="700" fill="#22d3ee">INTERVIEW PRACTICE · DAYS 1–7 · LEARN WITH PALLA</text>\n' % SANS
    b += '  <rect x="96" y="168" rx="14" width="300" height="58" fill="#f7df1e" fill-opacity=".12" stroke="#f7df1e" stroke-opacity=".6" stroke-width="1.5"/>\n'
    b += '  <text x="126" y="208" font-family="%s" font-size="28" font-weight="700" fill="#f7df1e">QUESTION %d / 20</text>\n' % (MONO, i)
    y = 310
    for ln in lines[:5]:
        b += '  <text x="96" y="%d" font-family="%s" font-size="46" font-weight="800" fill="#e6edf3">%s</text>\n' % (y, SANS, esc(ln))
        y += 62
    # timer ring (numbers drawn by ffmpeg at 1060,470)
    b += '  <circle cx="1060" cy="450" r="110" fill="#22d3ee" fill-opacity=".05"/>\n'
    b += '  <circle cx="1060" cy="450" r="110" fill="none" stroke="url(#grad)" stroke-width="5"/>\n'
    b += '  <text x="1060" y="600" text-anchor="middle" font-family="%s" font-size="24" letter-spacing="4" fill="#7e8da2">SECONDS</text>\n' % SANS
    b += '  <text x="96" y="648" font-family="%s" font-size="26" fill="#7e8da2">Answer OUT LOUD — like a real interview. Self-evaluate when I reveal the answer.</text>\n' % SANS
    write('q%02d.svg' % i, svg(b, 'Question %d' % i))

# ---------------------------------------------------------------- A slides
for i, qa in enumerate(QA, 1):
    b = '  <text x="96" y="120" font-family="%s" font-size="24" letter-spacing="6" font-weight="700" fill="#34d399">ANSWER · QUESTION %d / 20 · LEARN WITH PALLA</text>\n' % (SANS, i)
    qlines = textwrap.wrap(qa['q'], 68)
    y = 172
    for ln in qlines[:2]:
        b += '  <text x="96" y="%d" font-family="%s" font-size="30" font-weight="600" fill="#7e8da2">%s</text>\n' % (y, SANS, esc(ln))
        y += 40
    y += 26
    for hl in textwrap.wrap(qa['head'], 34)[:2]:
        b += '  <text x="96" y="%d" font-family="%s" font-size="54" font-weight="800" fill="url(#grad)">%s</text>\n' % (y + 28, SANS, esc(hl))
        y += 70
    y += 30
    for bl in qa['bullets']:
        for j, ln in enumerate(textwrap.wrap(bl, 66)[:2]):
            pre = '<tspan fill="#22d3ee">▸</tspan>  ' if j == 0 else '     '
            b += '  <text x="96" y="%d" font-family="%s" font-size="29" fill="#cbd5e1">%s%s</text>\n' % (y, SANS, pre, esc(ln))
            y += 42
        y += 4
    if qa['code']:
        y += 6
        h = len(qa['code']) * 38 + 24
        b += '  <rect x="88" y="%d" rx="12" width="1000" height="%d" fill="#0d1420" stroke="#22d3ee" stroke-opacity=".35" stroke-width="1.2"/>\n' % (y - 26, h)
        for cl in qa['code']:
            b += '  <text x="112" y="%d" font-family="%s" font-size="26" fill="#9cdcfe">%s</text>\n' % (y + 8, MONO, esc(cl))
            y += 38
    write('a%02d.svg' % i, svg(b, 'Answer %d' % i))

# ---------------------------------------------------------------- intro/outro
b = '  <text x="96" y="150" font-family="%s" font-size="26" letter-spacing="7" font-weight="700" fill="#22d3ee">LEARN WITH PALLA · MOCK INTERVIEW</text>\n' % SANS
b += '  <text x="92" y="268" font-family="%s" font-size="64" font-weight="800" fill="#e6edf3">JavaScript</text>\n' % SANS
b += '  <text x="96" y="362" font-family="%s" font-size="80" font-weight="800" fill="url(#grad)">Interview</text>\n' % SANS
b += '  <text x="96" y="456" font-family="%s" font-size="80" font-weight="800" fill="url(#grad)">Practice #1</text>\n' % SANS
b += '  <text x="96" y="530" font-family="%s" font-size="30" fill="#cbd5e1">Days 1–7  ·  20 questions  ·  45 seconds each</text>\n' % SANS
rules = ['1. I ask — you answer OUT LOUD', '2. 45 seconds on the clock', '3. I reveal — you self-evaluate']
ry = 200
b += '  <rect x="820" y="150" rx="16" width="380" height="230" fill="#22d3ee" fill-opacity=".07" stroke="#22d3ee" stroke-opacity=".4" stroke-width="1.5"/>\n'
b += '  <text x="850" y="196" font-family="%s" font-size="24" font-weight="700" letter-spacing="3" fill="#22d3ee">THE RULES</text>\n' % SANS
for r in rules:
    ry += 44
    b += '  <text x="850" y="%d" font-family="%s" font-size="25" fill="#cbd5e1">%s</text>\n' % (ry, SANS, esc(r))
b += '  <text x="96" y="614" font-family="%s" font-size="28" fill="#7e8da2"><tspan fill="#9cdcfe">interview</tspan>.<tspan fill="#dcdcaa">start</tspan>()   <tspan fill="#6a9955">// good luck!</tspan></text>\n' % MONO
write('intro.svg', svg(b, 'JavaScript Interview Practice 1 - Learn with Palla'))

b = '  <text x="96" y="150" font-family="%s" font-size="26" letter-spacing="7" font-weight="700" fill="#34d399">LEARN WITH PALLA · MOCK INTERVIEW</text>\n' % SANS
b += '  <text x="92" y="290" font-family="%s" font-size="72" font-weight="800" fill="#e6edf3">Well done!</text>\n' % SANS
b += '  <text x="96" y="384" font-family="%s" font-size="52" font-weight="800" fill="url(#grad)">Now self-evaluate honestly</text>\n' % SANS
tips = ['▸  Shaky answer? Rewatch that day’s video + study guide',
        '▸  Retake this interview after a few days',
        '▸  Repeat after every module — interviews become routine']
ty = 452
for t in tips:
    b += '  <text x="96" y="%d" font-family="%s" font-size="30" fill="#cbd5e1">%s</text>\n' % (ty, SANS, esc(t))
    ty += 52
write('outro.svg', svg(b, 'Well done - self evaluate'))

# ---------------------------------------------------------------- manifest
NUMWORD = ['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve',
           'thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty']
items = [dict(id='intro', slide='intro.png', narr=INTRO_NARR, kind='plain')]
for i, qa in enumerate(QA, 1):
    items.append(dict(id='q%02d' % i, slide='q%02d.png' % i,
                      narr='Question %s. %s Your forty-five seconds start... now.' % (NUMWORD[i-1], qa['q']),
                      kind='question'))
    items.append(dict(id='a%02d' % i, slide='a%02d.png' % i,
                      narr="Okay, time's up. " + qa['a_narr'], kind='plain'))
items.append(dict(id='outro', slide='outro.png', narr=OUTRO_NARR, kind='plain'))
json.dump(items, io.open(os.path.join(HERE, 'manifest.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
total = sum(len(x['narr']) for x in items)
print('manifest.json written, narration total chars:', total)
