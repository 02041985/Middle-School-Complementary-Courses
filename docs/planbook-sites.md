# Planbook sites: links and how access works

## Teacher portal (one sign-in for every subject)
https://www.millardmiddleschoolmaths.live/teacher

- New teachers: Create teacher account → email, password, confirm password, name, school → tick every grade or course they teach (any mix of subjects, middle and high school) → confirm the email → sign in (this sends the request).
- Administrator (millard.chikoka@gmail.com, millard.chikoka@maplewood.school): approve or decline requests; remove single courses, a whole planbook, or all access, in the portal.
- Approved teachers see only their planbooks and open them without signing in again. Inside each planbook they see only their approved grades/courses (curriculum, lessons, plans, test builder, class pickers). Classes are always private to the teacher who made them.
- Example: a teacher approved for English 20-1 and Maths Grade 7 sees High School English (20-1 only) and Middle School Maths (Grade 7 only), nothing else.
- Teachers can add more grades or courses later from the portal ("Add more grades or courses"); each addition needs approval.

## Grades and courses on offer
- Elementary School: Grade 1–6 Math, Grade 1–6 ELA, Grade 1–6 Science, Grade 1–6 Social Studies (each ticked separately)
- Middle School Maths: Grade 7, 8, 9
- High School Maths: Math 10C, 20-1, 30-1
- Middle School Sciences: Grade 7, 8, 9
- High School Sciences: Science 10, Biology 20, Chemistry 20, Physics 20, Biology 30, Chemistry 30, Physics 30
- Middle School English: Grade 7, 8, 9
- High School English: English 10-1, 10-2, 20-1, 20-2, 30-1, 30-2
- Middle School Social Studies: Grade 7, 8, 9
- High School Social Studies: Social 10-1, 10-2, 20-1, 20-2, 30-1, 30-2
- Middle School PE and Wellness: Grade 7, 8, 9
- High School PE and Wellness: Physical Education 10, 20, 30, CALM
- Middle School Complementary Courses: Art, Drama, General Music, Instrumental Music, CTF, Outdoor Ed (each Grade 7, 8, 9), Ethics, French, Spanish, Mandarin (each Grade 7, 8, 9)

## Planbooks
| Planbook | Teacher site | Student site |
| --- | --- | --- |
| Elementary School (Grades 1–6, all subjects) | https://elementary.millardmiddleschoolmaths.live/ | /student |
| Middle School Maths | https://www.millardmiddleschoolmaths.live/ | /student |
| High School Maths | https://www.millardmiddleschoolmaths.live/high/ | /student |
| Middle School Sciences | https://www.millardmiddleschoolmaths.live/science/ | /science/student |
| High School Sciences | https://highsciences.millardmiddleschoolmaths.live/ | /student |
| Middle School English | https://middleenglish.millardmiddleschoolmaths.live/ | /student |
| High School English | https://english.millardmiddleschoolmaths.live/ | /student |
| Middle School Social Studies | https://middlesocial.millardmiddleschoolmaths.live/ | /student |
| High School Social Studies | https://highsocial.millardmiddleschoolmaths.live/ | /student |
| Middle School PE and Wellness | https://middlepe.millardmiddleschoolmaths.live/ | /student |
| High School PE and Wellness | https://highpe.millardmiddleschoolmaths.live/ | /student |
| Middle School Complementary Courses | https://middlecomplementary.millardmiddleschoolmaths.live/ | /student |

Teachers approved before per-course access existed (including Ayman Yahya) still have every planbook and every grade; trim with Remove in the portal. Middle School English, Elementary School, both Social Studies planbooks and both PE and Wellness planbooks and the complementary courses are new, so earlier teachers don't have it until you approve it for them.

## Behind the scenes
- Supabase project: engine-crew-planner (shared accounts, classes and marks). Access tables: pb_admins, pb_teacher_apps (app, courses, active), pb_teacher_requests (picks). App keys: elementary, maths, maths_hs, science, science_hs, english_ms, english_hs, social_ms, social_hs, physed_ms, physed_hs, complementary_ms.
- GitHub (02041985): Elementary-School, middleschoolmaths, Middle-School-Sciences, Middle-School-English, Middle-School-Social-Studies, High-School-English, High-School-Social-Studies, High-School-Sciences, Middle-School-Physical-Education, High-School-Physical-Education, Middle-School-Complementary-Courses.
- Vercel team MWIC: one project per repo; pushing to main deploys. Middle School English's project is middleschool-english (the older project called "middle-school-english" is the facilities app and was left alone).
- Each Vercel project needs ANTHROPIC_API_KEY (lesson writing) and GRADER_SECRET (must match the grader value in Supabase pb_secrets).
- Supabase → Authentication → URL Configuration must list each site under Redirect URLs.
