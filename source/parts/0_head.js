// Alberta junior high complementary (optional) courses, Grades 7 to 9. Each course is one subject in one grade.
// Programs of study: Art 7–9 (1985), Drama 7–9 (1989), General Music 7–9 (1989), Instrumental Music 7–9 (1988),
// Career and Technology Foundations (CTF, 2016), Environmental and Outdoor Education 7–9, Ethics (Grade 7, 8 or 9),
// French as a Second Language nine-year program (2004), and the Spanish and Chinese Language and Culture nine-year
// programs. Outcomes are paraphrased; check the program of studies on alberta.ca for the full wording.
// Schools must offer at least two optional courses in junior high.
const SUBJECTS = {
  ART: {name:"Art", short:"Art", go:"A"},
  DR: {name:"Drama", short:"Drama", go:"D"},
  MU: {name:"General Music", short:"Music", go:"M"},
  IM: {name:"Instrumental Music", short:"Band", go:"I"},
  CTF: {name:"Career and Technology Foundations", short:"CTF", go:"C"},
  EOE: {name:"Environmental and Outdoor Education", short:"Outdoor Ed", go:"O"},
  ETH: {name:"Ethics", short:"Ethics", go:"E"},
  FSL: {name:"French as a Second Language", short:"French", go:"F"},
  SPA: {name:"Spanish Language and Culture", short:"Spanish", go:"S"},
  CHI: {name:"Chinese (Mandarin) Language and Culture", short:"Mandarin", go:"Z"}
};
const COURSES = {
  ART7:{name:"Art 7", short:"Art 7", grade:7, subj:"ART", blurb:"Observing and drawing natural forms; line, shape, texture and value; colour mixing; and art from many cultures, including First Nations, Métis and Inuit artists."},
  ART8:{name:"Art 8", short:"Art 8", grade:8, subj:"ART", blurb:"The built and designed world: perspective drawing, design principles, printmaking and 3-D construction, and how artists and designers solve problems."},
  ART9:{name:"Art 9", short:"Art 9", grade:9, subj:"ART", blurb:"People and the human figure: proportion and gesture, portraiture, art as personal and social expression, and planning a portfolio."},
  DR7:{name:"Drama 7", short:"Drama 7", grade:7, subj:"DR", blurb:"Trust and concentration, mime and movement, voice basics, improvisation games and story theatre."},
  DR8:{name:"Drama 8", short:"Drama 8", grade:8, subj:"DR", blurb:"Character building, vocal expression, scripted scenes, choral speech and readers theatre, and basic stage roles."},
  DR9:{name:"Drama 9", short:"Drama 9", grade:9, subj:"DR", blurb:"Developing a role, playbuilding, directing short scenes, technical theatre (lights, sound, sets) and reviewing performances."},
  MU7:{name:"General Music 7", short:"Music 7", grade:7, subj:"MU", blurb:"Rhythm and metre, reading pitch on the staff, singing and playing classroom instruments, and listening to music of many styles."},
  MU8:{name:"General Music 8", short:"Music 8", grade:8, subj:"MU", blurb:"Melody and scales, chords and harmony, guitar or keyboard basics, music in film and media, and composing short pieces."},
  MU9:{name:"General Music 9", short:"Music 9", grade:9, subj:"MU", blurb:"Form and structure, Canadian and world music, songwriting and music technology, and ensemble performance."},
  IM7:{name:"Instrumental Music 7", short:"Band 7", grade:7, subj:"IM", blurb:"Beginning band: instrument care, posture and tone, reading rhythms and concert B♭ notes, and playing together."},
  IM8:{name:"Instrumental Music 8", short:"Band 8", grade:8, subj:"IM", blurb:"Expanding range and scales, dotted rhythms and syncopation, dynamics and articulation, and balance in the ensemble."},
  IM9:{name:"Instrumental Music 9", short:"Band 9", grade:9, subj:"IM", blurb:"Advanced rhythms and key signatures, style and interpretation, small ensembles, sight-reading and concert performance."},
  CTF7:{name:"CTF 7", short:"CTF 7", grade:7, subj:"CTF", blurb:"Exploring interests through hands-on challenges in foods, design and communication, with safety, planning and reflection."},
  CTF8:{name:"CTF 8", short:"CTF 8", grade:8, subj:"CTF", blurb:"Building and making: construction, textiles and technology challenges using the design process, with career connections."},
  CTF9:{name:"CTF 9", short:"CTF 9", grade:9, subj:"CTF", blurb:"Media, coding and entrepreneurship challenges, exploring career pathways and high school CTS options."},
  EOE7:{name:"Environmental and Outdoor Education 7", short:"Outdoor Ed 7", grade:7, subj:"EOE", blurb:"Outdoor safety and comfort, observing local ecosystems, Leave No Trace, and personal connections to the land."},
  EOE8:{name:"Environmental and Outdoor Education 8", short:"Outdoor Ed 8", grade:8, subj:"EOE", blurb:"Navigation and trip planning, watersheds and wildlife, human impact on Alberta environments, and Indigenous perspectives on the land."},
  EOE9:{name:"Environmental and Outdoor Education 9", short:"Outdoor Ed 9", grade:9, subj:"EOE", blurb:"Leading outdoor activities, winter skills, sustainability issues and planning a community stewardship project."},
  ETH:{name:"Ethics", short:"Ethics", grade:9, subj:"ETH", blurb:"Offered in Grade 7, 8 or 9. Values and moral reasoning, honesty and responsibility, fairness and respect in relationships, and ethics in the community and the world."},
  FSL7:{name:"French 7", short:"French 7", grade:7, subj:"FSL", blurb:"Nine-year FSL program: talking about myself, school life, food and leisure, with francophone culture in Canada."},
  FSL8:{name:"French 8", short:"French 8", grade:8, subj:"FSL", blurb:"Nine-year FSL program: shopping and clothing, health and the body, travel and weather, and the francophone world."},
  FSL9:{name:"French 9", short:"French 9", grade:9, subj:"FSL", blurb:"Nine-year FSL program: media and technology, the environment, future plans and careers, and francophone celebrations."},
  SPA7:{name:"Spanish 7", short:"Spanish 7", grade:7, subj:"SPA", blurb:"Spanish Language and Culture: greetings and introductions, family, school and daily routines, and Spanish-speaking communities."},
  SPA8:{name:"Spanish 8", short:"Spanish 8", grade:8, subj:"SPA", blurb:"Spanish Language and Culture: food and restaurants, home and community, hobbies and sports, and festivals of the Spanish-speaking world."},
  SPA9:{name:"Spanish 9", short:"Spanish 9", grade:9, subj:"SPA", blurb:"Spanish Language and Culture: travel, health, the environment and future plans, using past and future time frames."},
  CHI7:{name:"Mandarin 7", short:"Mandarin 7", grade:7, subj:"CHI", blurb:"Chinese Language and Culture: pinyin and tones, greetings, numbers and dates, family, and basic characters."},
  CHI8:{name:"Mandarin 8", short:"Mandarin 8", grade:8, subj:"CHI", blurb:"Chinese Language and Culture: school and daily routine, food and ordering, shopping with money, and Chinese festivals."},
  CHI9:{name:"Mandarin 9", short:"Mandarin 9", grade:9, subj:"CHI", blurb:"Chinese Language and Culture: hobbies, travel and directions, weather and seasons, and Chinese communities in Canada."}
};
// Outcome groups (one per subject) and program components used to tag outcomes
const GOS = {
  "A":"Art: reflection, depiction, composition and expression.",
  "D":"Drama: orientation, movement, speech, improvisation and acting, and theatre arts.",
  "M":"General Music: rhythm, melody, harmony, form and expression through listening, performing and creating.",
  "I":"Instrumental Music: tone and technique, rhythm, melody and harmony, form and expression in ensemble playing.",
  "C":"Career and Technology Foundations: exploring interests, planning, creating, appraising and communicating, and career connections.",
  "O":"Environmental and Outdoor Education: outdoor skills, environmental knowledge, and environmental ethics and action.",
  "E":"Ethics: moral reasoning and personal, interpersonal and social responsibility.",
  "F":"French as a Second Language: communication, language concepts, culture and language-learning strategies.",
  "S":"Spanish Language and Culture: applications, language competence, global citizenship and strategies.",
  "Z":"Chinese Language and Culture: applications, language competence, global citizenship and strategies."
};
const GOSHORT = {"A":"Art","D":"Drama","M":"General Music","I":"Instrumental Music","C":"CTF","O":"Outdoor Ed","E":"Ethics","F":"French","S":"Spanish","Z":"Mandarin"};
const POS = {
  "A.1":"Reflection","A.2":"Depiction","A.3":"Composition","A.4":"Expression",
  "D.1":"Orientation","D.2":"Movement","D.3":"Speech","D.4":"Improvisation and acting","D.5":"Theatre arts",
  "M.1":"Rhythm","M.2":"Melody","M.3":"Harmony","M.4":"Form","M.5":"Expression","M.6":"Listening","M.7":"Creating",
  "I.1":"Tone and technique","I.2":"Rhythm","I.3":"Melody and harmony","I.4":"Form and style","I.5":"Expression","I.6":"Ensemble skills",
  "C.1":"Explore interests and passions","C.2":"Plan","C.3":"Create","C.4":"Appraise","C.5":"Communicate","C.6":"Career connections","C.7":"Safety",
  "O.1":"Outdoor skills and safety","O.2":"Environmental knowledge","O.3":"Environmental ethics","O.4":"Stewardship and action",
  "E.1":"Moral reasoning","E.2":"Personal responsibility","E.3":"Interpersonal responsibility","E.4":"Social and global responsibility",
  "F.1":"Communication: comprehension","F.2":"Communication: production","F.3":"Communication: interaction","F.4":"Language concepts","F.5":"Culture","F.6":"Language-learning strategies",
  "S.1":"Applications","S.2":"Language competence","S.3":"Global citizenship","S.4":"Strategies",
  "Z.1":"Applications","Z.2":"Language competence","Z.3":"Global citizenship","Z.4":"Strategies"
};
// Subject reference cards
const REF_BY_SUBJ = {
  ART:[["Elements of art","Line · shape · form · space · texture · value · colour"],["Principles of design","Balance · contrast · emphasis · movement · pattern · rhythm · unity · proportion"],["Colour wheel","Primary: red, yellow, blue · secondary: orange, green, violet · complementary colours sit opposite"],["Critique steps","Describe → analyze → interpret → judge"]],
  DR:[["Stage areas","Upstage (back) · downstage (front) · stage left and stage right are the actor's left and right facing the audience"],["Voice","Projection · articulation · pace · pitch · pause · tone"],["Improvisation","Say \"yes, and…\" · listen · commit · stay in role · share the focus"],["Tableau","A frozen picture: levels, focus, facial expression, no backs to the audience"]],
  MU:[["Note values (4/4)","Whole = 4 beats · half = 2 · quarter = 1 · eighth = ½"],["Treble clef","Lines E G B D F · spaces F A C E"],["Bass clef","Lines G B D F A · spaces A C E G"],["Dynamics","pp · p · mp · mf · f · ff · crescendo (getting louder) · decrescendo (getting softer)"]],
  IM:[["Concert B♭ scale","B♭ C D E♭ F G A B♭ (concert pitch)"],["Note values (4/4)","Whole = 4 · half = 2 · quarter = 1 · eighth = ½ · dotted half = 3"],["Dynamics","pp · p · mp · mf · f · ff · crescendo · decrescendo"],["Rehearsal habits","Posture · breath support · watch the conductor · listen for balance · count rests"]],
  CTF:[["Design process","Plan → create → appraise → communicate (and repeat)"],["Career clusters","Business, finance and IT · health, recreation and human services · media, design and communication arts · natural resources · trades, manufacturing and transportation"],["Safety first","Follow the teacher's demonstration · use protective equipment · report hazards · clean up"],["Appraisal questions","Does it meet the criteria? What works? What would I change? What did I learn?"]],
  EOE:[["Leave No Trace","Plan ahead · travel on durable surfaces · dispose of waste properly · leave what you find · minimize fire impacts · respect wildlife · be considerate"],["Layering","Base layer (wicks moisture) · insulating layer · shell (wind and water); avoid cotton in cold or wet weather"],["Outdoor ten essentials","Map and compass · light · extra layers · first aid · fire starter · repair kit · food · water · shelter · whistle"],["Trip plan","Where, who, gear, route and return time, left with someone at home"]],
  ETH:[["Decision-making steps","Identify the issue → gather facts → list options → consider who is affected → check values and principles → decide → reflect"],["Ethical lenses","Consequences (what does the most good?) · rights and duties (what is fair and respectful?) · character (what would a good person do?)"],["Discussion norms","Listen fully · question ideas, not people · give reasons · be open to changing your mind"]],
  FSL:[["Être (to be)","je suis · tu es · il/elle/on est · nous sommes · vous êtes · ils/elles sont"],["Avoir (to have)","j'ai · tu as · il/elle/on a · nous avons · vous avez · ils/elles ont"],["Regular -er verbs","parler: je parle · tu parles · il parle · nous parlons · vous parlez · ils parlent"],["Questions","Est-ce que…? · Qu'est-ce que…? · Où? · Quand? · Comment? · Pourquoi? · Qui?"]],
  SPA:[["Ser (to be)","soy · eres · es · somos · sois · son"],["Estar (to be: location, state)","estoy · estás · está · estamos · estáis · están"],["Regular -ar verbs","hablar: hablo · hablas · habla · hablamos · habláis · hablan"],["Questions","¿Qué? · ¿Quién? · ¿Dónde? · ¿Cuándo? · ¿Cómo? · ¿Por qué? · ¿Cuánto?"]],
  CHI:[["Four tones","1st ā high and level · 2nd á rising · 3rd ǎ falling-rising · 4th à falling · neutral tone (light)"],["Numbers","一 yī 1 · 二 èr 2 · 三 sān 3 · 四 sì 4 · 五 wǔ 5 · 六 liù 6 · 七 qī 7 · 八 bā 8 · 九 jiǔ 9 · 十 shí 10"],["Sentence order","Subject + time + place + verb + object: 我今天在学校学习中文。"],["Questions","吗 ma (yes/no) · 什么 shénme (what) · 谁 shéi (who) · 哪儿 nǎr (where) · 几 jǐ / 多少 duōshao (how many)"]]
};
const REF = {};
Object.keys(COURSES).forEach(k => { REF[k] = REF_BY_SUBJ[COURSES[k].subj]; });
// Performance task for each subject (used by the assessment plan)
const WSFORM_BY_SUBJ = {
  ART:{task:"A finished artwork with planning sketches and a short artist statement", cats:"Observation and skill · Use of elements and principles · Ideas and expression · Reflection"},
  DR:{task:"A rehearsed scene, improvisation or presentation with a short reflection", cats:"Focus and commitment · Voice · Movement · Collaboration · Reflection"},
  MU:{task:"A performance, composition or listening response connected to this unit", cats:"Accuracy · Musical understanding · Expression · Creativity · Reflection"},
  IM:{task:"A playing test (scale, excerpt or piece) or ensemble performance with self-assessment", cats:"Tone · Accuracy of notes and rhythm · Technique · Expression · Ensemble skills"},
  CTF:{task:"A product, prototype or presentation created through the design process, with an appraisal", cats:"Planning · Creating and skills · Safety · Appraisal · Communication"},
  EOE:{task:"A field activity, trip plan, field journal or stewardship action with reflection", cats:"Outdoor skills and safety · Environmental understanding · Ethics and action · Reflection"},
  ETH:{task:"A reasoned position on an ethical issue, in writing or discussion", cats:"Understanding the issue · Considering perspectives · Reasoning · Communication"},
  FSL:{task:"An oral or written task in French, such as a conversation, presentation or short text", cats:"Comprehension · Production · Interaction · Accuracy · Cultural understanding"},
  SPA:{task:"An oral or written task in Spanish, such as a conversation, presentation or short text", cats:"Comprehension · Production · Interaction · Accuracy · Cultural understanding"},
  CHI:{task:"An oral or written task in Mandarin, such as a dialogue, presentation or short text in characters and pinyin", cats:"Comprehension · Production (tones and characters) · Interaction · Accuracy · Cultural understanding"}
};
const WSFORM = {};
Object.keys(COURSES).forEach(k => { WSFORM[k] = WSFORM_BY_SUBJ[COURSES[k].subj]; });
const UNITS = {};
const SO_ROWS = [];
// Register a subject's units: meta = {A:[title, [questions], materials], ...}; kc = {course: {A:[key concepts], ...}}
function addUnits(meta, kc){
  Object.entries(kc).forEach(([c, units]) => Object.entries(units).forEach(([L, k]) => {
    UNITS[`${c}.${L}`] = {title: meta[L][0], fq: meta[L][1], kc: k, mat: meta[L][2]};
  }));
}
