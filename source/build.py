"""Build the Middle School Complementary Courses page (index.html) from the Elementary page.
Same multi-subject engine and look; Art, Drama, Music, Band, CTF, Outdoor Ed, Ethics, French, Spanish and Mandarin, Grades 7–9."""
import sys, pathlib
SRC = pathlib.Path("/home/claude/elementary/index.html").read_text()
DATA = pathlib.Path("/home/claude/mscomp/data.js").read_text()
H = SRC

def R(old, new, n=1):
    global H
    c = H.count(old)
    if c != n: print("COUNT MISMATCH", c, "expected", n, "for:\n", old[:200]); sys.exit(1)
    H = H.replace(old, new)

# ---------- shell and colours (plum) ----------
R('<div class="logo"><div class="mark">1·6</div><div><b>Elementary School</b><span>Alberta Curriculum</span></div></div>',
  '<div class="logo"><div class="mark">7·9</div><div><b>Middle School Complementary</b><span>Alberta Curriculum</span></div></div>', 2)
R("<div>Math · ELA · Science · Social Studies<br>Grades 1–6 Alberta curriculum</div>", "<div>Arts · CTF · Outdoor Ed · Ethics<br>French · Spanish · Mandarin</div>")
R("<title>Elementary School - Alberta Curriculum</title>", "<title>Middle School Complementary Courses - Alberta Curriculum</title>")
R("--bg:#e6f0e2;", "--bg:#efe6f3;")
R("--accent:#2f7d3a; --accent-ink:#ffffff; --accent-soft:#e3f2e3; --accent-2:#1f5a28;", "--accent:#8a3b9c; --accent-ink:#ffffff; --accent-soft:#f3e4f6; --accent-2:#64296f;")
R("--side:#18301b;", "--side:#2a1530;")
R("--accent:#8fd18f; --accent-ink:#0a1a0b; --accent-soft:#1b3a1e; --accent-2:#b9e5b4;", "--accent:#d39ae0; --accent-ink:#1e0a23; --accent-soft:#36203d; --accent-2:#e7c3ee;", 2)
i = H.index(":root{--bg-glow1:rgba(170,215,150,.50)"); j = H.index("}", i) + 1
H = H[:i] + ":root{--bg-glow1:rgba(205,160,225,.46);--bg-glow2:rgba(245,195,170,.38);--bg-glow3:rgba(225,205,235,.42);--bg-glow4:rgba(180,200,240,.32);--hero1:#ffffff;--hero2:#ffffff;--hero3:#f8f0fa}" + H[j:]

# ---------- data block ----------
start = H.index("// Alberta Elementary curriculum, Grades 1 to 6")
end = H.index("const SOS = SO_ROWS.map")
H = H[:start] + DATA.rstrip() + "\n" + H[end:]
R("const SUBJ = so => SUBJECTS[so.subj] || SUBJECTS.M;", "const SUBJ = so => SUBJECTS[so.subj] || SUBJECTS.ART;")
R('const isELA = so => so.subj === "E";', 'const isELA = so => false;\nconst isLang = so => ["FSL","SPA","CHI"].includes(so.subj);')

# ---------- state defaults and pickers ----------
R('curGrade: "M1", curSel: "M1.A1"', 'curGrade: "ART7", curSel: "ART7.A1"')
R('plan: {grade:"M1", sos:["M1.A1","M1.A2"]', 'plan: {grade:"ART7", sos:["ART7.A1","ART7.B1"]')
R('lesson: {code:"M1.A1", i:0}', 'lesson: {code:"ART7.A1", i:0}')
R("[1,2,3,4,5,6].map(gr =>", "[7,8,9].map(gr =>")
R('S.tb = {course:"M1"', 'S.tb = {course:"ART7"')
R('courseOpts("M1")', 'courseOpts("ART7")')
H = H.replace('courseOpts(S.newAssess ? SO[S.newAssess.sos[0]]?.grade : "M1")', 'courseOpts(S.newAssess ? SO[S.newAssess.sos[0]]?.grade : "ART7")')
H = H.replace('placeholder="e.g. Grade 3 Room 12"', 'placeholder="e.g. Art 8 Block C"')
R('name:"Grade 1 Math example class", grade:"M1"', 'name:"Art 7 example class", grade:"ART7"')
R('weak = {3:"M1.A2",5:"M1.A3",7:"M1.A1",8:"M1.A2",10:"M1.C1"}', 'weak = {3:"ART7.B1",5:"ART7.C1",7:"ART7.A1",8:"ART7.B1",10:"ART7.C1"}')
R("""    mk("Counting to 100 check-in (example)","2026-09-15","Quiz",["M1.A1"]),
    mk("Adding within 20 task (example)","2026-09-24","Performance task",["M1.A2"]),
    mk("Halves check-in (example)","2026-10-06","Quiz",["M1.A3"]),
    mk("Number unit check (example)","2026-10-14","Unit test",["M1.A1","M1.A2","M1.A3"])""",
  """    mk("Artwork critique (example)","2026-09-15","Written response",["ART7.A1"]),
    mk("Natural forms drawing (example)","2026-09-24","Performance task",["ART7.B1"]),
    mk("Colour wheel check-in (example)","2026-10-06","Quiz",["ART7.C1"]),
    mk("Term 1 portfolio check (example)","2026-10-14","Unit test",["ART7.A1","ART7.B1","ART7.C1"])""")

# ---------- no PATs in these courses ----------
R('<span class="badge b-quiz" style="align-self:center">Grade 6 PAT</span>', '<span class="badge b-quiz" style="align-self:center">Program note</span>')
R('COURSES[so.grade].diploma ? "Grade 6 Provincial Achievement Test" : "Reference"', '"Reference"')
H = H.replace("From the 2026–27 Alberta Education Grade 6 subject bulletins and parent guide. Check the current bulletins each year.", "Check the current program of studies on alberta.ca.")
R("explaining the idea to a younger student.", "teaching the skill to a classmate.")

# ---------- lesson-writing prompt ----------
R("You are an experienced Alberta elementary teacher writing ${SUBJ(so).name} classroom materials for young students.",
  "You are an experienced Alberta junior high ${SUBJ(so).name} teacher writing classroom materials.")
R("Alberta K–6 ${SUBJ(so).name} curriculum", "Alberta ${SUBJ(so).name} program of studies, a junior high complementary course")
R("(about ${COURSES[so.grade].grade + 5} to ${COURSES[so.grade].grade + 6} years old): short sentences, friendly tone and concrete examples.",
  "(about 12 to 15 years old): clear, engaging and practical. ${isLang(so) ? \"This is a beginner second-language course: give target-language words and sentences with English meanings, keep the language at this grade's level, and check spelling, accents and grammar carefully.\" + (so.subj === \"CHI\" ? \" Give simplified characters with pinyin and tone marks.\" : \"\") : \"\"} For hands-on, studio, kitchen, shop or outdoor work, include clear safety steps.")
R('"type":"Read-aloud, Shared reading, Hands-on task, Problem solving, Investigation, Source study or Discussion"',
  '"type":"Studio, Performance, Rehearsal, Listening, Design challenge, Field activity, Case study, Dialogue or Discussion"')
R('"passage":"the material for the activity, 60-200 words: a short story or poem for ELA, a problem situation or hands-on task for Math, an investigation set-up for Science, or a source (a short story, description of a map, photo or artifact) for Social Studies"',
  '"passage":"the material for the activity, 80-250 words: studio steps for Art, a scene, game or script excerpt for Drama, a listening or performance task for Music, a design brief for CTF, a field task for Outdoor Ed, a case or dilemma for Ethics, or a dialogue or short text with English support for a language"')

R("a learning activity (a story or passage, a problem, an investigation or a source)", "a learning activity (a studio task, scene, listening or playing task, design challenge, field activity, dilemma or dialogue)")
pathlib.Path("/home/claude/mscomp/index.html").write_text(H)
for w in ["Elementary", "1·6", "Grade 6", "young students", "\"M1", "K–6", "Grades 1–6"]:
    hits = [(i + 1, l.strip()[:150]) for i, l in enumerate(H.split("\n")) if w in l]
    if hits: print(w, len(hits)); [print("   ", h) for h in hits[:4]]
print("OK", len(H))
