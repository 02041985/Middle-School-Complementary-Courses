import sys; sys.path.insert(0, "/home/claude/english")
"""Assemble the Middle School Complementary Courses repo (static front end + Vercel API) from the artifact page and lesson files.
Run after any change to index.html, data.js or lessons/. Writes into /home/claude/middle-school-complementary-courses."""
import json, re, shutil, pathlib
SRC = pathlib.Path("/home/claude/mscomp")
REF = pathlib.Path("/home/claude/middle-school-sciences")
OUT = pathlib.Path("/home/claude/middle-school-complementary-courses")
H = (SRC / "index.html").read_text()

def sub(text, old, new, n=1):
    c = text.count(old)
    assert c == n, f"expected {n} of {old[:80]!r}, found {c}"
    return text.replace(old, new)

# ---------- split the artifact page ----------
css = H[H.index('<style>\n/* Layout'):]
css = css[len("<style>\n"):css.index("</style>")]
script = H[H.index("<script>") + 8:H.rindex("</script>")]
cut = script.index("// ---------- helpers ----------")
data_js, app_js = script[:cut], script[cut:]

# platform-specific changes for the shared pb_* tables
app_js = sub(app_js, "if (!err) { S.pt.classes = c.data; S.pt.enroll = e.data;",
  'if (!err) { S.pt.classes = c.data.filter(x => x.subject === "complementary_ms" && COURSES[x.course]).map(x => ({...x, grade: x.course})); /* maths and sciences classes share this table */ S.pt.enroll = e.data;')
app_js = sub(app_js, 'const { data, error } = await sb.from("pb_classes").insert({name, grade, book_class_id:bookId}).select().single();\n    if (error) { toast("Couldn\'t create the class. Try again."); return; }\n    S.pt.classes.push(data);',
  'const { data, error } = await sb.from("pb_classes").insert({name, grade: COURSES[grade].grade, course: grade, subject: "complementary_ms", book_class_id:bookId}).select().single();\n    if (error) { toast("Couldn\'t create the class. Try again."); return; }\n    data.grade = data.course; S.pt.classes.push(data);')

# teacher access requests: signed-in teachers see pending requests and approve or decline them
import teacher_access
app_js = teacher_access.patch_app(app_js)
import teacher_portal
app_js = teacher_portal.patch_app(app_js)
import teacher_courses
app_js = teacher_courses.patch_app(app_js)
import flex_plan  # flexible weekly plans: days per lesson and other activities
app_js = flex_plan.patch_app(app_js)
css = flex_plan.patch_css(css)
import class_groups  # class groups A, B, C: online classes and students
app_js = class_groups.patch_app(app_js)

css += """
/* sign-in screen and account controls (web platform) */
.auth{position:fixed;inset:0;z-index:50;background-color:var(--bg);background-image:radial-gradient(900px 520px at 100% 0%,var(--bg-glow1),transparent 60%),radial-gradient(800px 520px at 0% 100%,var(--bg-glow2),transparent 60%),radial-gradient(700px 460px at 50% 50%,var(--bg-glow3),transparent 65%);display:grid;place-items:center;padding:24px max(16px,env(safe-area-inset-left,0px));overflow-y:auto}
.auth-card{width:100%;max-width:420px;background:var(--surface);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:28px;display:flex;flex-direction:column;gap:16px}
.auth-card .logo{padding:0}
.auth-card .logo b{color:var(--ink)}
.auth-card .logo span{color:var(--muted)}
.auth-card h1{font-size:1.4rem}
.auth-card form{display:flex;flex-direction:column;gap:14px}
.auth-card input{width:100%}
.auth-card .btn{justify-content:center;padding:10px 14px}
.auth-msg{font-size:.88rem;min-height:1.2em}
.auth-msg.ok{color:var(--l3)} .auth-msg.err{color:var(--l1)}
.linkbtn{font:inherit;font-size:.86rem;background:none;border:0;color:var(--accent);cursor:pointer;padding:0;text-align:left;text-decoration:underline}
.acct{display:flex;align-items:center;gap:8px;font-size:.78rem;min-width:0}
.acct-email{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.acct-out{font:inherit;font-size:.74rem;font-weight:700;color:var(--side-hi);background:var(--side-act);border:1px solid rgba(255,255,255,.16);border-radius:6px;padding:3px 8px;cursor:pointer;flex:none}
.topbar .acct{margin-left:8px}
@media (max-width:520px){.topbar .acct-email{display:none}}
"""

# ---------- output tree ----------
if OUT.exists():
    for p in OUT.iterdir():
        if p.name not in (".git", "docs", "source", ".vercelignore"): shutil.rmtree(p) if p.is_dir() else p.unlink()
for d in ["js", "css", "api/_lessons"]: (OUT / d).mkdir(parents=True, exist_ok=True)
(OUT / "css/app.css").write_text(css.strip() + "\n")
(OUT / "js/data.js").write_text(data_js.strip() + "\n")
(OUT / "js/app.js").write_text(app_js.strip() + "\n")
(OUT / "js/config.js").write_text((REF / "js/config.js").read_text())
(OUT / ".gitignore").write_text((REF / ".gitignore").read_text())

plat = (REF / "js/platform.js").read_text()
plat = sub(plat, '// Same table as Middle School Sciences, so science rows are namespaced: key "sci:<key>", kind "sci_<kind>".\n  const K = k => "sci:" + k, KIND = k => (k ? "sci_" + k : "sci");',
  '// Same table as the Maths and Sciences apps, so Complementary rows are namespaced: key "mcc:<key>", kind "mcc_<kind>".\n  const K = k => "mcc:" + k, KIND = k => (k ? "mcc_" + k : "mcc");')
plat = plat.replace("Middle School Sciences", "Middle School Complementary Courses")
plat = plat.replace('const PB_APP = "science"', 'const PB_APP = "complementary_ms"')
assert 'const PB_APP = "complementary_ms"' in plat
# teacher requests and the /teacher page come from the shared Sciences platform.js (patched by teacher_access.py)
plat = class_groups.patch_platform(plat)
(OUT / "js/platform.js").write_text(plat)

LOGO = '<div class="logo"><div class="mark">7·9</div><div><b>Middle School Complementary</b><span>Alberta Curriculum</span></div></div>'
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@500;700&display=swap">'
idx = (REF / "index.html").read_text()
idx = idx.replace('<div class="logo"><div class="mark">7·9</div><div><b>Middle School Sciences</b><span>Alberta Curriculum</span></div></div>', LOGO)
idx = sub(idx, "<title>Middle School Sciences - Alberta Curriculum</title>", "<title>Middle School Complementary Courses - Alberta Curriculum</title>")
idx = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Planning, lessons and a proficiency markbook for Alberta junior high complementary courses: Art, Drama, Music, Band, CTF, Environmental and Outdoor Education, Ethics, French, Spanish and Mandarin.">', idx)
idx = sub(idx, "<div>Science 7–8–9 Program of Studies (2003, updated 2014)</div>", "<div>Arts · CTF · Outdoor Ed · Ethics<br>French · Spanish · Mandarin</div>")
idx = idx.replace("Middle School Sciences", "Middle School Complementary Courses")
assert "Middle School Sciences" not in idx
(OUT / "index.html").write_text(idx)

stu_html = (REF / "student.html").read_text()
stu_html = stu_html.replace("Middle School Sciences", "Middle School Complementary Courses").replace("science lessons", "lessons").replace("Science", "Complementary Courses")
stu_html = stu_html.replace('<script src="js/hs-titles.js"></script>\n', "")  # maths-only titles file, not in this repo
stu_html = class_groups.patch_student_html(stu_html)
(OUT / "student.html").write_text(stu_html)

stu = (REF / "js/student.js").read_text()
stu = sub(stu, '.filter(e => e.pb_classes?.subject === "science").map(e => ({ id: e.class_id, name: e.pb_classes?.name || "Class", grade: e.pb_classes?.grade, me: e.display_name }))',
  '.filter(e => e.pb_classes?.subject === "complementary_ms").map(e => ({ id: e.class_id, name: e.pb_classes?.name || "Class", grade: e.pb_classes?.course || e.pb_classes?.grade, me: e.display_name }))')
stu = sub(stu, 'pb_classes(name, grade, subject)', 'pb_classes(name, grade, subject, course)')
stu = sub(stu, '<span class="small muted">Grade ${esc(c.grade)} Science</span>', '<span class="small muted">${esc(elLabel(c.grade))}</span>')
lab = re.search(r"\$\{L\.lab\?\.procedure\?\.length \?.*?\: \"\"\}\n", stu, re.S)
assert lab, "lab block not found"
stu = stu.replace(lab.group(0), '${L.study?.passage ? `<div class="stack" style="gap:8px"><span class="eyebrow">Activity</span><b>${esc(L.study.title || "")}</b><p class="small" style="margin:0">${esc(L.study.question || "")}</p><div style="font-family:Georgia,serif;font-size:1.02rem;line-height:1.7;background:var(--sunk);border-left:3px solid var(--accent);border-radius:0 9px 9px 0;padding:12px 16px;white-space:pre-line">${esc(L.study.passage)}</div>${L.study.source ? `<span class="xs muted">${esc(L.study.source)}</span>` : ""}${L.study.steps?.length ? `<ol class="small" style="margin:0;padding-left:18px">${L.study.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}${L.study.discussion?.length ? `<span class="xs muted">Questions to think about:</span><ol class="small" style="margin:0;padding-left:18px">${L.study.discussion.map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}${L.study.product ? `<p class="note small" style="margin:0"><b>Writing task:</b> ${esc(L.study.product)}</p>` : ""}</div>` : ""}\n')
stu = stu.replace("Science", "Complementary Courses").replace("science", "complementary courses")
stu = "// Course keys look like ART7, FSL8, CHI9 or ETH.\nconst elLabel = k => { const m = /^(ART|DR|MU|IM|CTF|EOE|FSL|SPA|CHI)([789])$/.exec(String(k || \"\")); const N = {ART:\"Art\",DR:\"Drama\",MU:\"General Music\",IM:\"Instrumental Music\",CTF:\"CTF\",EOE:\"Outdoor Education\",FSL:\"French\",SPA:\"Spanish\",CHI:\"Mandarin\"}; return k === \"ETH\" ? \"Ethics\" : m ? `${N[m[1]]} ${m[2]}` : String(k || \"\"); };\n" + stu
stu = class_groups.patch_student_js(stu)
(OUT / "js/student.js").write_text(stu)

# ---------- API ----------
auth = (REF / "api/_auth.js").read_text()
auth = sub(auth, '// Science general outcomes look like 9A1: grade, unit letter A–E, outcome number.\nconst CODE = "[789][A-E][1-4]";',
  '// Outcomes look like ART7.A1, FSL8.C1 or ETH.B1: course, a dot, unit letter, outcome number.\nconst CODE = "(?:(?:ART|DR|MU|IM|CTF|EOE|FSL|SPA|CHI)[789]|ETH)\\\\.[A-D][1-4]";')
auth = sub(auth, 'const m = new RegExp("^(" + CODE + ")_(\\\\d{1,2})$").exec(String(key || ""));', 'const m = new RegExp("^(" + CODE + ")_(\\\\d{1,2})$").exec(String(key || ""));')
auth = sub(auth, 'const PB_APP = "science";', 'const PB_APP = "complementary_ms";')
(OUT / "api/_auth.js").write_text(auth)
for f in ["generate.js", "health.js", "lesson.js"]:
    (OUT / "api" / f).write_text((REF / "api" / f).read_text().replace("?code=9A1", "?code=ART7.A1"))
(OUT / "api/_grade.js").write_text("""// Automatic marking for complementary course lessons.
// Multiple-choice reading questions are marked against the key. Written responses are always "open":
// students see the model answer, and the teacher reads them in each lesson's results.
function markItem(item, answer) {
  if (item.type === "mc") return answer != null && String(answer) === String(item.answer);
  return null;
}
function rule() { return { t: "open" }; }
function levelFor(pct) { return pct >= 80 ? 4 : pct >= 65 ? 3 : pct >= 50 ? 2 : 1; }
module.exports = { rule, markItem, levelFor };
""")
st = (REF / "api/student.js").read_text()
st = sub(st, "vocabulary: b.vocabulary, examples: b.examples, lab: b.lab || null,", "vocabulary: b.vocabulary, examples: b.examples, study: b.study || null,")
st = st.replace("?key=9A1_0", "?key=ART7.A1_0")
(OUT / "api/student.js").write_text(st)

vj = json.loads((REF / "vercel.json").read_text())
(OUT / "vercel.json").write_text(json.dumps(vj, indent=2) + "\n")

order = json.loads((SRC / "lessons/index.json").read_text())
for code in order:
    shutil.copy(SRC / f"lessons/{code}.json", OUT / f"api/_lessons/{code}.json")
(OUT / "api/_lessons/all.js").write_text("// Built-in complementary course lessons (with answers). One file per unit outcome; regenerated by build_repo.py.\nmodule.exports = {\n" +
    ",\n".join(f'  "{c}": require("./{c}.json")' for c in order) + "\n};\n")

rows = json.loads(__import__("subprocess").check_output(["node", "-e", (SRC / "data.js").read_text() + "\nconsole.log(JSON.stringify(SO_ROWS.map(r=>r[0])))"]))
(OUT / "README.md").write_text(f"""# Middle School Complementary Courses

Planning and assessment app for Alberta junior high complementary (optional) courses, Grades 7 to 9: Art, Drama, General Music, Instrumental Music, Career and Technology Foundations (CTF), Environmental and Outdoor Education, Ethics, French as a Second Language (nine-year program), Spanish Language and Culture and Chinese (Mandarin) Language and Culture. Built on the same platform as the other planbooks.

- **Curriculum**: {len(rows)} outcomes across 28 courses (each subject in Grades 7, 8 and 9, plus one Ethics course), each with program components, guiding questions, lesson topics, essential questions, vocabulary, materials, a subject reference card, an assessment plan and proficiency descriptors. Outcomes are paraphrased from the Alberta programs of study.
- **Lessons**: objective, vocabulary, an activity (studio task, scene, listening or playing task, design challenge, field activity, dilemma or dialogue), worked examples, 15 practice questions and a 20-question practice test. The first lesson of every course is built in; teachers write the rest with "Generate lesson". Language lessons give target-language text with English support (simplified characters with pinyin for Mandarin).
- **Markbook**, **analysis by subject**, **test builder** and the **student site** at `/student`.

## Stack

| Part | Where |
| --- | --- |
| Static front end | `index.html`, `student.html`, `js/`, `css/` (no build step) |
| Data and sign-in | Supabase project `engine-crew-planner` (shared with the other planbooks) |
| Lesson writing | Vercel function `api/generate.js` → Claude API |
| Hosting | Vercel project `middleschool-complementary`, deployed from this repo's `main` branch, at middlecomplementary.millardmiddleschoolmaths.live |

Teacher documents use the `mcc:` prefix in `planbook_docs`. Classes have `subject = 'complementary_ms'`, `grade` 7 to 9 and the course key in `course` (ART7–9, DR7–9, MU7–9, IM7–9, CTF7–9, EOE7–9, ETH, FSL7–9, SPA7–9, CHI7–9); lesson keys look like `FSL8.A1_0`. The teacher-portal app key is `complementary_ms`; teachers tick each course separately.

## Environment variables (Vercel)

| Name | Required | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes, for lesson writing | Server-side only. |
| `GRADER_SECRET` | Yes, for the student site | Must match the `grader` row in `pb_secrets`. |

In Supabase → Authentication → URL Configuration, add `https://middlecomplementary.millardmiddleschoolmaths.live/**` to **Redirect URLs**. See `docs/` and `source/`.
""")

print("built", len(order), "lesson files")

import assess_kit  # assessment tracker, student quizzes, lesson slides and uploads
assess_kit.install(OUT)
print("assessment tracker installed")
