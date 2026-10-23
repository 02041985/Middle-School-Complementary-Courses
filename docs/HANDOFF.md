# Middle School Complementary Courses: hand-off note

Middle School Complementary Courses (Alberta junior high optional courses) was built from the High School English project chat on 23 Oct 2026.

## Where it lives
- Teacher site: https://middlecomplementary.millardmiddleschoolmaths.live/ (students: /student; /teacher goes to the shared portal)
- GitHub: 02041985/Middle-School-Complementary-Courses (push to main deploys)
- Vercel: project middleschool-complementary, team MWIC
- Supabase: engine-crew-planner (shared). App key `complementary_ms`; classes have subject 'complementary_ms', grade 7–9 and the course key in `course`; lesson keys look like FSL8.A1_0; teacher documents use the mcc: prefix. In the portal the courses are listed under Fine Arts, CTF, Outdoor Education and Ethics, and Languages, and teachers tick each course separately.

## What's in it
- 28 courses: Art, Drama, General Music, Instrumental Music, CTF, Environmental and Outdoor Education, French (FSL nine-year), Spanish Language and Culture and Chinese (Mandarin) Language and Culture, each in Grades 7, 8 and 9, plus one Ethics course (offered in Grade 7, 8 or 9; filed under Grade 9 in course pickers).
- 112 outcomes (four units per course), paraphrased from the Alberta programs of study, each tagged with the program's components. Analysis rolls up by subject.
- 28 built-in lessons: the first lesson of every course. Teachers write the rest with "Generate lesson". Language lessons give target-language text with English support; Mandarin uses simplified characters with pinyin and tone marks.
- Not included: Religious Studies, Knowledge and Employability courses and locally developed courses (no provincial program), and other languages (German, Ukrainian, Cree, Blackfoot and others), which can be added the same way.

## Source
`source/parts/*.js` are concatenated into `source/data.js` (one part per subject group). Lesson sources are in `source/src/`.

## Still to do by the owner
- Vercel → middleschool-complementary → Environment Variables: add ANTHROPIC_API_KEY. GRADER_SECRET is already set.
- Supabase → Authentication → URL Configuration: add https://middlecomplementary.millardmiddleschoolmaths.live/** to Redirect URLs.
