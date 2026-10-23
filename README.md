# Middle School Complementary Courses

Planning and assessment app for Alberta junior high complementary (optional) courses, Grades 7 to 9: Art, Drama, General Music, Instrumental Music, Career and Technology Foundations (CTF), Environmental and Outdoor Education, Ethics, French as a Second Language (nine-year program), Spanish Language and Culture and Chinese (Mandarin) Language and Culture. Built on the same platform as the other planbooks.

- **Curriculum**: 112 outcomes across 28 courses (each subject in Grades 7, 8 and 9, plus one Ethics course), each with program components, guiding questions, lesson topics, essential questions, vocabulary, materials, a subject reference card, an assessment plan and proficiency descriptors. Outcomes are paraphrased from the Alberta programs of study.
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
