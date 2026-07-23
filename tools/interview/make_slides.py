# Interview Practice #2 (Days 1-7, 30 questions) — slide generator + narration manifest
# Writes SVG slides in ./slides and manifest.json for the assembler.
import io, json, os, textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
SLIDES = os.path.join(HERE, 'slides')
os.makedirs(SLIDES, exist_ok=True)

QA = [
 dict(q='What is npm, and what is the package.json file?',
      head='Node’s package manager',
      bullets=['npm downloads & manages libraries (Playwright, etc.)',
               'package.json = the project recipe: dependencies + scripts',
               'npm install reads it and recreates node_modules',
               'That’s how a project runs the same on every machine'],
      code=['npm install @playwright/test', 'npx playwright test'],
      a_narr="npm is Node's package manager — it downloads and manages the libraries we use, like Playwright. package json is the project's recipe card: it lists every dependency with its version, plus script shortcuts. When a teammate clones your repo, they just run npm install, and npm reads package json and rebuilds the exact same setup. That's what keeps an automation project portable."),
 dict(q='How do you run a JavaScript file from the terminal?',
      head='node filename',
      bullets=['node app.js — from any terminal or VS Code',
               'Node runs the file top to bottom',
               'console.log output appears in the terminal',
               'The test runner does exactly this underneath'],
      code=['node app.js', '// Hello from Node!'],
      a_narr="You run it with the node command — node, space, the file name, like node app dot js — from the terminal or the VS Code integrated terminal. Node executes the file from top to bottom and prints every console dot log to the terminal. And that's exactly what our test runner does underneath: it is just Node, running JavaScript files for us."),
 dict(q='What are the rules for naming variables in JavaScript?',
      head='camelCase, never digit-first',
      bullets=['Letters, digits, _ and $ — but cannot START with a digit',
               'Case sensitive: score and Score are different variables',
               'Reserved words (let, if, const…) are not allowed',
               'Convention: camelCase, and the name says what it holds'],
      code=['let userName = "ok";', 'let 2fast = "no";   // SyntaxError'],
      a_narr="Variable names can contain letters, digits, underscores and the dollar sign — but they cannot start with a digit. They're case sensitive, so score and capital S Score are two different variables, and reserved words like let or if are off limits. The JavaScript convention is camelCase: first word lowercase, every next word capitalised — and always pick a name that says what the value means."),
 dict(q='What is hoisting in JavaScript?',
      head='Declarations are read first',
      bullets=['JS registers declarations before running the code',
               'var: hoisted AND set to undefined — usable too early',
               'let / const: hoisted but locked until their line',
               'Touch them early → ReferenceError (a good thing!)'],
      code=['console.log(a); // undefined   (var a below)',
            'console.log(b); // ReferenceError (let b below)'],
      a_narr="Hoisting means JavaScript registers all declarations before it actually runs your code. Variables declared with var are hoisted and initialised to undefined, so you can touch them before their line — a classic source of silent bugs. let and const are also hoisted, but they stay locked until their declaration line, so using them early throws a ReferenceError instead. That louder, safer behaviour is one more reason we prefer let and const."),
 dict(q='You declared const list = [1, 2]. Can you push into it? Why or why not?',
      head='const locks the binding only',
      bullets=['const blocks REASSIGNMENT — not modification',
               'The array’s contents can still change: push works',
               'list = [9] → TypeError; list.push(3) → fine',
               'Need frozen contents? That’s Object.freeze'],
      code=['const list = [1, 2];', 'list.push(3);  // OK → [1, 2, 3]',
            'list = [9];    // TypeError'],
      a_narr="Yes — push works. const locks the binding: you cannot point list at a different array, but the contents of the array it points to can still change, so push is perfectly legal. What throws a TypeError is reassignment — list equals a new array. And if you genuinely need the contents locked too, that's a different tool: Object dot freeze. const alone never does that."),
 dict(q='What does typeof null return, and why?',
      head='"object" — a famous old bug',
      bullets=['typeof null → "object" — wrong, but kept forever',
               'A bug from the very first version of JavaScript',
               'Check null directly:  value === null',
               'Contrast: typeof undefined → "undefined" (correct)'],
      code=['typeof null     // "object"  (!)', 'value === null  // the right check'],
      a_narr="typeof null returns the string object — and that is a famous historical bug from the very first version of JavaScript, kept forever for backwards compatibility. So never use typeof to detect null; compare directly with triple equals null instead. And keep the contrast in mind for interviews: typeof undefined does correctly return the string undefined."),
 dict(q='What does it mean that JavaScript is dynamically typed?',
      head='Types live on values',
      bullets=['Variables have no fixed type — VALUES do',
               'The same variable can hold a string, then a number',
               'Type mistakes only appear at RUNTIME',
               'So: strict compares, explicit conversion, good tests'],
      code=['let x = "hi";  // a string', 'x = 42;        // now a number — no error'],
      a_narr="Dynamically typed means types belong to values, not to variables. The same variable can hold a string now and a number a moment later, and JavaScript will not complain. The cost is that type mistakes only show up at runtime, when the code actually executes. That's why we compare strictly, convert explicitly, and write tests — they are our safety net where the language doesn't provide one."),
 dict(q='How do you find the length of a string — and is that a method or a property?',
      head='.length — a property, no ( )',
      bullets=['str.length — property, so NO parentheses',
               'Counts every character, spaces included',
               '"" has length 0 — handy for empty checks',
               'Classic assert: results.length > 0'],
      code=['"Palla".length    // 5', '"Palla".length()  // TypeError'],
      a_narr="You use the length property — s dot length, with no parentheses, because it's a property, not a method. Add parentheses and you get a TypeError: length is not a function. It counts every character including spaces, and an empty string has length zero. In testing you use it constantly — asserting a field isn't empty, or that a search actually returned results."),
 dict(q='Are strings mutable in JavaScript? What does toUpperCase do to the original?',
      head='Strings never change',
      bullets=['Strings are IMMUTABLE — no method edits the original',
               'toUpperCase / toLowerCase / trim return a NEW string',
               'Classic bug: calling the method, ignoring the result',
               'Always capture:  s = s.trim()'],
      code=['let s = "palla";', 's.toUpperCase();   // returns "PALLA"',
            'console.log(s);    // still "palla"'],
      a_narr="Strings in JavaScript are immutable — no method ever changes the original. toUpperCase, toLowerCase, trim: they all return a brand new string and leave the old one untouched. So the classic mistake is calling s dot toUpperCase and throwing the result away — the original is still lowercase. Always capture the result: s equals s dot toUpperCase, or store it in a new variable."),
 dict(q='How do you access the first and the last character of a string?',
      head='[0] and [length − 1]',
      bullets=['Zero-indexed: the first character is s[0]',
               'The last is s[s.length - 1] — one less than length',
               'Out of range → undefined, not an error',
               'Modern shortcut for the last one: s.at(-1)'],
      code=['const s = "test";', 's[0]             // "t"',
            's[s.length - 1]  // "t"', 's.at(-1)         // "t"'],
      a_narr="Strings are zero-indexed, so the first character is s square-bracket zero, and the last one is s at position length minus one — the last index is always one less than the length. Ask for a position that doesn't exist and you quietly get undefined, not an error — which can hide bugs. And the modern shortcut for the last character is s dot at of minus one."),
 dict(q='What do includes, startsWith and endsWith do? Where do they help in tests?',
      head='Substring checks → boolean',
      bullets=['includes — is the text ANYWHERE in the string?',
               'startsWith / endsWith — checks just the edges',
               'All three return true / false — and are case sensitive',
               'Asserting URLs, titles and toast messages'],
      code=['url.endsWith("/dashboard")   // true / false',
            'msg.includes("success")      // true / false'],
      a_narr="All three answer a yes-or-no question about a string. includes checks whether the text appears anywhere inside; startsWith and endsWith check just the edges. They all return a boolean, and they are all case sensitive — Success with a capital S will not match success. In automation they're everywhere: assert the URL ends with slash dashboard, or that the toast message includes the word success."),
 dict(q='What is the difference between Number("12px") and parseInt("12px")?',
      head='NaN — versus 12',
      bullets=['Number: the WHOLE string must be numeric → NaN',
               'parseInt: reads digits from the left, stops at "px" → 12',
               'Perfect for UI values like widths and font sizes',
               'Always pass the radix: parseInt(x, 10)'],
      code=['Number("12px")       // NaN', 'parseInt("12px", 10) // 12'],
      a_narr="Number is strict — the entire string must be numeric, so Number of the string twelve px gives NaN. parseInt is forgiving: it reads digits from the left and stops at the first non-digit, so it returns the number twelve. That makes parseInt perfect for UI text like widths and font sizes. And make it a habit to pass the radix — parseInt x comma ten — so the number is always read as base ten."),
 dict(q='What does toFixed do — and what type does it return?',
      head='Rounds… into a STRING',
      bullets=['price.toFixed(2) → two decimals — rounded',
               'But it returns a STRING, not a number!',
               'Keep calculating? Wrap it: Number(x.toFixed(2))',
               'Meet it when 0.1 + 0.2 shows its long tail'],
      code=['(0.1 + 0.2).toFixed(2)   // "0.30"',
            'typeof (1.5).toFixed(1)  // "string"'],
      a_narr="toFixed rounds a number to a fixed count of decimal places — price dot toFixed two gives you two decimals. But here's the trap: it returns a string, not a number. If you need to keep calculating or comparing numerically, wrap it back — Number of price dot toFixed two. You'll meet this the first time floating point maths hands you zero point one plus zero point two with that famous long tail of digits: round it, then convert back."),
 dict(q='What do Math.round, Math.floor and Math.ceil do? And Math.random?',
      head='Nearest, down, up — and dice',
      bullets=['round → nearest whole number',
               'floor → ALWAYS down;  ceil → ALWAYS up',
               'random → decimal from 0 up to (not including) 1',
               'Random 0–9:  Math.floor(Math.random() * 10)'],
      code=['Math.round(4.6)  // 5', 'Math.floor(4.9)  // 4',
            'Math.ceil(4.1)   // 5'],
      a_narr="Math dot round goes to the nearest whole number. Math dot floor always rounds down, and Math dot ceil always rounds up — no matter what the decimal part is. Their best friend is Math dot random, which returns a decimal from zero up to, but never including, one. Combine them — Math dot floor of Math dot random times ten — and you get a random integer from zero to nine, which is great for generating test data."),
 dict(q='What is operator precedence? What is 2 + 3 * 4, and how do you make it obvious?',
      head='Multiply before add',
      bullets=['Like maths: * / % run before + and −',
               '2 + 3 * 4 → 14, not 20',
               'Parentheses always run first — and cost nothing',
               'If a reader would hesitate — add them'],
      code=['2 + 3 * 4    // 14', '(2 + 3) * 4  // 20'],
      a_narr="JavaScript follows operator precedence just like school maths: multiplication, division and remainder happen before addition and subtraction. So two plus three times four is fourteen, not twenty. Parentheses always win — whatever is inside runs first — and they're free. The professional habit is simple: if a reader would even hesitate about the order, add the parentheses and make it obvious."),
 dict(q='What is the difference between i++ and ++i?',
      head='Old value vs new value',
      bullets=['Both add 1 to i — the difference is what comes BACK',
               'i++ returns the OLD value, then increments',
               '++i increments first, returns the NEW value',
               'Alone on a line: identical — and clearest'],
      code=['let i = 5;', 'console.log(i++);  // 5  (i is now 6)',
            'console.log(++i);  // 7'],
      a_narr="Both increase i by one — the difference is what the expression hands back. i plus plus returns the old value first and increments afterwards; plus plus i increments first and returns the new value. It only matters when the increment sits inside a bigger expression, like a console dot log or an assignment. On a line by itself the two are identical — and honestly, that's the clearest way to use them."),
 dict(q='What does Boolean("false") return — and why is that a trap?',
      head='true — it’s a non-empty string!',
      bullets=['Boolean(x) gives the truthiness of x',
               '"false" is a NON-EMPTY string → truthy → true',
               'APIs and attributes often send booleans as TEXT',
               'Compare explicitly:  value === "false"'],
      code=['Boolean("false")   // true  (!)',
            'value === "false"  // explicit and safe'],
      a_narr="It returns true — because the string false is a non-empty string, and every non-empty string is truthy. The content is irrelevant; only emptiness matters. This bites in real testing when an API or an HTML attribute hands you the text false and you drop it straight into an if — the branch runs anyway. The fix is to compare the text explicitly, value triple equals the string false, instead of trusting truthiness."),
 dict(q='What does the double NOT (!!) trick do?',
      head='Any value → clean boolean',
      bullets=['! flips truthiness once — !! flips it twice',
               'Result: the value’s honest true / false',
               'Exactly equivalent to Boolean(x)',
               'Seen before asserts, flags and reports'],
      code=['!!"text"   // true', '!!0        // false', '!!null     // false'],
      a_narr="A single exclamation mark flips truthiness — not of a truthy value is false. Doubling it flips twice, which converts any value into its honest boolean form: truthy becomes true, falsy becomes false. It's exactly equivalent to calling Boolean of x, just shorter to type. You'll see it in code that needs a clean true or false — for a flag, a report, or an assertion — rather than the raw value."),
 dict(q='Why does 0 == "" evaluate to true? What rule causes it?',
      head='Coercion, caught red-handed',
      bullets=['Loose == converts both sides to numbers first',
               '"" converts to 0 → the check becomes 0 == 0',
               'With === it’s false — different types, no conversion',
               'Exhibit A for “always use strict equality”'],
      code=['0 == ""    // true  (!)', '0 === ""   // false'],
      a_narr="Because loose equality converts both sides to numbers before comparing. The empty string converts to zero, so the comparison quietly becomes zero equals zero — true. With triple equals it's false, because a number and a string are different types and no conversion happens. Keep this one as exhibit A in the case for always using strict equality in your tests."),
 dict(q='What is the difference between != and !==?',
      head='Loose vs strict “not equal”',
      bullets=['!=  converts types first:  "5" != 5 → false (!)',
               '!== strict: different type ⇒ not equal → true',
               'Mirror of == vs ===',
               'Rule: if you use ===, you must use !== too'],
      code=['"5" != 5    // false', '"5" !== 5   // true'],
      a_narr="It's the same story as double versus triple equals, mirrored. Exclamation equals is the loose version — it converts types first, so string five loose not-equals number five is false, because after conversion they look equal. Exclamation double-equals is strict — different types means not equal, full stop, so the same check is true. Keep your rule symmetrical: if you compare with triple equals, always use the strict not-equals as well."),
 dict(q='In an if / else-if / else chain, what happens once one condition is true?',
      head='First match wins',
      bullets=['Conditions are checked top-down',
               'First true branch runs — the REST are skipped',
               'Order matters: most specific condition first',
               'else is the catch-all when nothing matched'],
      code=['if (score >= 90)      grade = "A";',
            'else if (score >= 50) grade = "Pass";',
            'else                  grade = "Fail";'],
      a_narr="The conditions are checked from the top down, and the first one that's true wins — its block runs, and everything after it is skipped, even if a later condition would also have been true. That's why order matters: put the most specific condition first. In a grading chain, score greater-or-equal ninety must come before greater-or-equal fifty — otherwise every A student gets labelled Pass. And the final else is the catch-all that runs when nothing matched."),
 dict(q='What do comparison operators return? And what bug hides in if (x = 5)?',
      head='Booleans — and one sneaky =',
      bullets=['> < >= <= compare two values → true / false',
               'The result is a value: store it, pass it, assert it',
               'if (x = 5) ASSIGNS — no comparison at all',
               'Assignment is truthy → the if always runs'],
      code=['const passed = score >= 50;',
            'if (x = 5) { ... }  // BUG: always runs'],
      a_narr="Greater than, less than, and their or-equal versions compare two values and return a boolean — true or false. That result is a normal value: you can store it in a variable like passed, pass it to a function, or feed it to an if, a while, or a ternary. And watch for the classic typo: a single equals inside an if doesn't compare, it assigns — and since the assigned value five is truthy, the if runs every single time."),
 dict(q='What do logical operators actually return? What is "a" && "b"? And "" || "x"?',
      head='They return operands!',
      bullets=['&& returns the first FALSY value — or the last one',
               '|| returns the first TRUTHY value',
               '"a" && "b" → "b";   "" || "x" → "x"',
               'This is the engine behind default values'],
      code=['"a" && "b"   // "b"', '0 && "b"     // 0',
            '"" || "x"    // "x"'],
      a_narr="Here's the secret most people miss: logical operators don't return true or false — they return one of their operands. Double ampersand returns the first falsy value it meets, or the last value if everything was truthy — so string a AND string b gives you b. Double pipe returns the first truthy value — so empty string OR x gives you x. Once you know this, default values and guard patterns in real code suddenly make perfect sense."),
 dict(q='How do you set a default value with || — and what is its famous trap?',
      head='|| defaults — the zero trap',
      bullets=['input || 10 → use input, unless it’s falsy',
               'TRAP: 0 and "" are falsy — valid data gets replaced!',
               'A real quantity of 0 silently becomes 10',
               'When 0 / "" are valid → you need ?? instead'],
      code=['const qty = input || 10;',
            '// input = 0  →  qty is 10   (bug!)'],
      a_narr="input double-pipe ten means: if input is truthy, use it; otherwise fall back to ten. Clean — until a legitimate falsy value shows up. If input is zero or an empty string, those are falsy, so the fallback silently replaces them — a real quantity of zero becomes ten, and no error is thrown anywhere. That's the trap. When zero or empty are valid data, double pipe is the wrong tool — which is exactly why the nullish operator exists."),
 dict(q='What does the nullish coalescing operator ?? do? When is it better than ||?',
      head='Fallback only for null/undefined',
      bullets=['x ?? d → d only when x is null or undefined',
               '0 and "" PASS THROUGH — unlike with ||',
               '0 ?? 10 → 0,   but   0 || 10 → 10',
               'Modern rule: defaults → ??, truthiness → ||'],
      code=['0 ?? 10     // 0', '0 || 10     // 10', 'null ?? 10  // 10'],
      a_narr="Double question mark is the nullish coalescing operator: it falls back only when the left side is null or undefined — genuinely missing. Zero and the empty string are real values, so they pass through: zero nullish ten is zero, while zero double-pipe ten is ten. So the modern rule of thumb: use the nullish operator for default values, because it asks is the value missing — and keep double pipe for genuine truthiness checks."),
 dict(q='Can you chain ternary operators? What is the readable alternative?',
      head='You can — but don’t',
      bullets=['Nested ternaries parse fine — and read terribly',
               'Ternary = ONE condition, TWO values. That’s it',
               'Third branch appears? → if / else-if / else',
               'Readable beats clever in a shared test suite'],
      code=['// legal, but hard on the next reader:',
            'x > 0 ? "pos" : x < 0 ? "neg" : "zero"'],
      a_narr="You can nest ternaries — the syntax allows it — but readability collapses almost immediately, and readable code is the whole game in a test suite that other people maintain. Keep the ternary for a single two-way choice: one condition, two values, done. The moment a third branch appears, switch back to if, else-if, else — the extra lines are much cheaper than the confusion."),
 dict(q='When would you choose switch over an if / else-if chain?',
      head='One value, many exact matches',
      bullets=['One value versus a list of fixed options',
               'Cleaner than a long else-if ladder',
               'Compares with strict === automatically',
               'Ranges (score >= 50)? switch can’t — stay with if'],
      code=['switch (browser) {', '  case "chrome":  ... break;',
            '  case "firefox": ... break;', '}'],
      a_narr="Reach for switch when you're comparing one value against a list of exact options — a browser name, an environment, a status code. It reads much cleaner than a long else-if ladder, and it compares with strict equality automatically. But switch cannot express ranges: something like score greater-or-equal fifty has no case label, so grading bands and thresholds stay with if and else-if."),
 dict(q='How do you group several switch cases so they run the same code?',
      head='Intentional fall-through',
      bullets=['Stack the case labels with nothing between them',
               'A match on either label runs the shared block',
               'break once, at the end of the shared block',
               'Comment it — silent fall-through looks like a bug'],
      code=['case "sat":', 'case "sun":',
            '  type = "weekend"; break;'],
      a_narr="You stack the case labels with nothing between them: case saturday, case sunday, then the shared block, then one break. A match on either label falls through into the same code — that's intentional fall-through, and it's the one place where fall-through is a feature rather than a bug. Put the break at the end of the shared block, and add a short comment, so the next reader knows it was deliberate."),
 dict(q='Does default have to be the last case in a switch? Does it need a break?',
      head='Anywhere — but keep it last',
      bullets=['default runs when NO case matched',
               'It can legally sit anywhere in the switch',
               'Not last + no break → falls into the next case!',
               'Convention: last position, with a break anyway'],
      code=['default:', '  type = "unknown"; break;'],
      a_narr="default runs when no case matched — and technically it can sit anywhere inside the switch; the matching still works. But there's a catch: if default isn't last and has no break, execution falls straight through into the case below it, which is almost never what you wanted. So follow the convention: keep default at the bottom, give it a break anyway, and nobody ever has to think about it again."),
 dict(q='What does "10" < "9" evaluate to, and why?',
      head='true — string comparison!',
      bullets=['Two strings compare char by char, alphabetically',
               'First chars decide: "1" sorts before "9" → true',
               'Everything read from a page IS a string',
               'Convert first:  Number(a) < Number(b)'],
      code=['"10" < "9"                  // true  (!)',
            'Number("10") < Number("9")  // false'],
      a_narr="It's true. When both operands are strings, JavaScript compares them character by character, alphabetically — not numerically. The very first characters decide it: the character one sorts before the character nine, so the string ten counts as smaller. This bites in testing because everything you read from a page arrives as a string. Convert first — Number of a, less than Number of b — and the comparison becomes numeric and honest."),
]

INTRO_NARR = ("Welcome back to interview practice at Learn with Palla — session two. "
              "Same rules as before: I ask a question, and you get fifteen seconds. "
              "Answer out loud, as if you're sitting in a real interview. When the time is up, "
              "I'll give you the answer — compare it with yours and evaluate yourself honestly. "
              "Thirty questions today — a deeper sweep of everything from day one to day seven. "
              "If session one felt comfortable, this one will make you interview-ready. Let's begin.")
OUTRO_NARR = ("And that's all thirty questions — excellent work staying till the end. "
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
    b = '  <text x="96" y="120" font-family="%s" font-size="24" letter-spacing="6" font-weight="700" fill="#22d3ee">INTERVIEW PRACTICE #2 · DAYS 1–7 · LEARN WITH PALLA</text>\n' % SANS
    b += '  <rect x="96" y="168" rx="14" width="300" height="58" fill="#f7df1e" fill-opacity=".12" stroke="#f7df1e" stroke-opacity=".6" stroke-width="1.5"/>\n'
    b += '  <text x="126" y="208" font-family="%s" font-size="28" font-weight="700" fill="#f7df1e">QUESTION %d / 30</text>\n' % (MONO, i)
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
    b = '  <text x="96" y="120" font-family="%s" font-size="24" letter-spacing="6" font-weight="700" fill="#34d399">ANSWER · QUESTION %d / 30 · LEARN WITH PALLA</text>\n' % (SANS, i)
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
b += '  <text x="96" y="456" font-family="%s" font-size="80" font-weight="800" fill="url(#grad)">Practice #2</text>\n' % SANS
b += '  <text x="96" y="530" font-family="%s" font-size="30" fill="#cbd5e1">Days 1–7  ·  30 questions  ·  15 seconds each</text>\n' % SANS
rules = ['1. I ask — you answer OUT LOUD', '2. 15 seconds on the clock', '3. I reveal — you self-evaluate']
ry = 200
b += '  <rect x="820" y="150" rx="16" width="380" height="230" fill="#22d3ee" fill-opacity=".07" stroke="#22d3ee" stroke-opacity=".4" stroke-width="1.5"/>\n'
b += '  <text x="850" y="196" font-family="%s" font-size="24" font-weight="700" letter-spacing="3" fill="#22d3ee">THE RULES</text>\n' % SANS
for r in rules:
    ry += 44
    b += '  <text x="850" y="%d" font-family="%s" font-size="25" fill="#cbd5e1">%s</text>\n' % (ry, SANS, esc(r))
b += '  <text x="96" y="614" font-family="%s" font-size="28" fill="#7e8da2"><tspan fill="#9cdcfe">interview</tspan>.<tspan fill="#dcdcaa">start</tspan>()   <tspan fill="#6a9955">// good luck!</tspan></text>\n' % MONO
write('intro.svg', svg(b, 'JavaScript Interview Practice 2 - Learn with Palla'))

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
           'thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty',
           'twenty one','twenty two','twenty three','twenty four','twenty five','twenty six',
           'twenty seven','twenty eight','twenty nine','thirty']
items = [dict(id='intro', slide='intro.png', narr=INTRO_NARR, kind='plain')]
for i, qa in enumerate(QA, 1):
    items.append(dict(id='q%02d' % i, slide='q%02d.png' % i,
                      narr='Question %s. %s Your fifteen seconds start... now.' % (NUMWORD[i-1], qa['q']),
                      kind='question'))
    items.append(dict(id='a%02d' % i, slide='a%02d.png' % i,
                      narr="Okay, time's up. " + qa['a_narr'], kind='plain'))
items.append(dict(id='outro', slide='outro.png', narr=OUTRO_NARR, kind='plain'))
json.dump(items, io.open(os.path.join(HERE, 'manifest.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
total = sum(len(x['narr']) for x in items)
print('manifest.json written, narration total chars:', total)
