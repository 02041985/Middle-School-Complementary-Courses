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
// ---------- Art 7–9 ----------
addUnits({
  A:["Reflection",["How do artists see and respond to the world?","How do I describe, analyze and judge art?"],"art reproductions and images from galleries (including the Art Gallery of Alberta and Indigenous artists), critique sheets"],
  B:["Depiction",["How can I show what I see?","How do artists represent form, space and detail?"],"drawing pencils (HB–6B), viewfinders, still-life objects, sketchbooks"],
  C:["Composition",["How do artists organize a work?","How do elements and principles work together?"],"paper, paint, printmaking supplies, collage materials, clay or cardboard for 3-D work"],
  D:["Expression",["How can art communicate ideas and feelings?","How do I develop my own style?"],"sketchbooks, mixed media, portfolio folders, artist statements"]
},{
  ART7:{A:["describe, analyze, interpret, judge","art from many cultures"],B:["contour line","observational drawing","natural forms","value and shading"],C:["colour wheel","colour mixing","balance","pattern"],D:["mood and colour","personal symbols","sketchbook ideas"]},
  ART8:{A:["design in everyday objects","architecture","art criticism"],B:["one-point perspective","two-point perspective","proportion in objects"],C:["principles of design","printmaking","3-D construction"],D:["designing for a purpose","visual communication","problem solving"]},
  ART9:{A:["art and identity","art as social commentary","Canadian artists"],B:["figure proportion","gesture drawing","portraiture"],C:["emphasis and unity","mixed media","series of works"],D:["personal style","artist statement","portfolio"]}
});
SO_ROWS.push(
["ART7.A1","Looking at art","Describe, analyze, interpret and judge artworks from many times and cultures, including First Nations, Métis and Inuit artists.",["Use the four critique steps","Compare artworks about nature from different cultures","Respond to an Alberta artist's work"],["How do artists see the world differently?","What makes an artwork meaningful?"],["describe","analyze","interpret","judge","critique","culture"],["A.1"]],
["ART7.B1","Drawing natural forms","Draw natural forms from observation using contour line, texture and value to show form.",["Draw contour lines from observation","Show texture with mark-making","Use value to create form"],["How can I draw what I really see?","How does shading make something look 3-D?"],["contour line","observation","texture","value","shading","form"],["A.2"]],
["ART7.C1","Colour and composition","Mix and use colour, and arrange elements with balance and pattern in a composition.",["Mix colours using the colour wheel","Use warm and cool colours","Arrange a balanced composition"],["How do colours work together?","How do artists arrange a picture?"],["primary","secondary","complementary","warm and cool colours","balance","pattern"],["A.3"]],
["ART7.D1","Expressing feelings and ideas","Use colour, line and symbols to express a mood or personal idea in an original artwork.",["Explore how colour and line show mood","Develop personal symbols","Create and reflect on an expressive artwork"],["How can art show feelings?","What symbols represent me?"],["mood","symbol","expression","abstract","sketchbook","reflection"],["A.4"]],
["ART8.A1","Art and design in the built world","Analyze how design and architecture shape everyday life and respond to designed objects and buildings.",["Analyze form and function in designed objects","Study architecture in Alberta communities","Critique a design"],["How does design affect daily life?","What makes a design successful?"],["design","form","function","architecture","aesthetic","critique"],["A.1"]],
["ART8.B1","Perspective drawing","Use one-point and two-point perspective to show depth and space.",["Draw in one-point perspective","Draw in two-point perspective","Add detail and value to a perspective drawing"],["How do artists create the illusion of depth?","Why do objects look smaller far away?"],["horizon line","vanishing point","orthogonal lines","one-point perspective","two-point perspective","depth"],["A.2"]],
["ART8.C1","Design principles and printmaking","Apply principles of design in prints and 3-D constructions.",["Apply the principles of design","Create a relief print","Construct a 3-D form"],["How do design principles guide a composition?","How does printmaking allow repetition?"],["emphasis","rhythm","unity","relief print","brayer","3-D form"],["A.3"]],
["ART8.D1","Designing with a purpose","Plan and create an artwork or design that communicates a message to an audience.",["Identify a design purpose and audience","Develop thumbnails and a final design","Present and explain a design"],["How can visual design communicate a message?","How do designers solve problems?"],["purpose","audience","thumbnail sketch","logo","layout","message"],["A.4"]],
["ART9.A1","Art, identity and society","Analyze how artists express identity and comment on society, including Canadian and Indigenous artists.",["Analyze art about identity","Examine art as social commentary","Research a Canadian artist"],["How do artists express who they are?","Can art change how people think?"],["identity","social commentary","context","Canadian art","Indigenous art","symbolism"],["A.1"]],
["ART9.B1","Drawing the human figure","Draw the figure and face using proportion, gesture and observation.",["Use proportion to draw the figure","Capture movement with gesture drawing","Draw a portrait using facial proportions"],["How do artists capture the human form?","What makes a portrait feel alive?"],["proportion","gesture","head-to-body ratio","portrait","features","foreshortening"],["A.2"]],
["ART9.C1","Mixed media and series","Combine media and techniques and develop a related series of works.",["Combine media in one work","Use emphasis and unity","Develop a series of related works"],["How can different media work together?","How do artists develop an idea across several works?"],["mixed media","collage","emphasis","unity","series","technique"],["A.3"]],
["ART9.D1","Personal style and portfolio","Develop a personal style and present a portfolio with an artist statement.",["Identify my artistic strengths and influences","Write an artist statement","Curate and present a portfolio"],["What is my artistic voice?","How do I present my work?"],["style","influence","artist statement","portfolio","curate","exhibition"],["A.4"]]
);
// ---------- Drama 7–9 ----------
addUnits({
  A:["Orientation and Movement",["How do actors work together safely?","How do I communicate with my body?"],"open floor space, music for movement, trust and focus games"],
  B:["Voice and Speech",["How do I use my voice on stage?","How does speech create character?"],"tongue twisters, choral speech texts, short scripts, recording device"],
  C:["Improvisation and Acting",["How do I create a scene on the spot?","How do I build a believable character?"],"improvisation prompts, character cards, scene starters"],
  D:["Theatre Arts and Forms",["How do theatre forms tell stories?","What happens behind the scenes?"],"simple props and costumes, scripts, lighting and sound equipment if available"]
},{
  DR7:{A:["trust","concentration","mime","gesture"],B:["projection","articulation","breathing"],C:["yes, and…","tableau","story theatre"],D:["story theatre","audience etiquette","stage areas"]},
  DR8:{A:["levels","character movement","physical theatre"],B:["vocal expression","choral speech","readers theatre"],C:["character traits","objectives","scripted scenes"],D:["blocking","stage manager","props and costumes"]},
  DR9:{A:["ensemble work","movement composition","physical character"],B:["subtext","pace and pause","monologues"],C:["playbuilding","directing","motivation"],D:["lighting and sound","set design","theatre review"]}
});
SO_ROWS.push(
["DR7.A1","Trust, focus and mime","Build trust and concentration in a group and communicate through mime and gesture.",["Build trust and focus with ensemble games","Communicate with gesture and facial expression","Create a mime sequence"],["Why do actors need trust?","How can I tell a story without words?"],["trust","concentration","ensemble","mime","gesture","facial expression"],["D.1","D.2"]],
["DR7.B1","Voice basics","Use breath, projection and articulation to speak clearly on stage.",["Breathe from the diaphragm","Project my voice","Articulate clearly"],["How can I be heard at the back of the room?","Why does clear speech matter?"],["projection","articulation","diaphragm","volume","pace","enunciation"],["D.3"]],
["DR7.C1","Improvisation games","Use \"yes, and\" thinking, listening and commitment to build improvised scenes and tableaux.",["Accept and build offers in improvisation","Create tableaux","Improvise a short scene with a beginning, middle and end"],["What makes improvisation work?","How do actors build on each other's ideas?"],["improvisation","offer","yes, and","tableau","commitment","scene"],["D.4"]],
["DR7.D1","Story theatre","Present a story using narration, tableau and movement, and practise audience etiquette.",["Adapt a story for story theatre","Use stage areas in a performance","Perform and give audience feedback"],["How can a group bring a story to life?","What does a good audience do?"],["story theatre","narrator","stage areas","audience etiquette","feedback","adaptation"],["D.5"]],
["DR8.A1","Movement and character","Use levels, posture and movement to show character.",["Use levels and posture","Show character through walk and gesture","Create a physical theatre piece"],["How does movement show who a character is?","How can bodies create settings?"],["levels","posture","physical theatre","character walk","status","space"],["D.2"]],
["DR8.B1","Vocal expression and choral speech","Use pitch, pace, tone and pause to interpret text alone and in a chorus.",["Vary pitch, pace and tone","Perform choral speech","Present readers theatre"],["How does the voice change meaning?","How does a group speak as one?"],["pitch","pace","tone","pause","choral speech","readers theatre"],["D.3"]],
["DR8.C1","Building a character","Develop a believable character with traits, objectives and obstacles in a scripted scene.",["Identify character traits and objectives","Rehearse a scripted scene","Stay in character under pressure"],["What makes a character believable?","What does my character want?"],["character","trait","objective","obstacle","script","rehearsal"],["D.4"]],
["DR8.D1","Staging a scene","Block and stage a short scene using stage directions, props and simple costumes.",["Use blocking and stage directions","Plan props and costumes","Rehearse with a stage manager"],["How do directors move actors on stage?","What jobs make a show happen?"],["blocking","stage directions","upstage","downstage","stage manager","prop"],["D.5"]],
["DR9.A1","Ensemble and movement composition","Create a movement piece as an ensemble that expresses a theme.",["Create an ensemble movement piece","Use focus and contrast in movement","Refine a piece with feedback"],["How does an ensemble move as one?","How can movement express a theme?"],["ensemble","composition","contrast","unison","canon","theme"],["D.1","D.2"]],
["DR9.B1","Monologues and subtext","Perform a monologue using pace, pause and subtext.",["Analyze a monologue for subtext","Use pace and pause","Perform a monologue"],["What is a character not saying?","How do I hold an audience alone on stage?"],["monologue","subtext","pause","pace","emphasis","intention"],["D.3"]],
["DR9.C1","Playbuilding and directing","Collaboratively create and direct an original short play.",["Brainstorm and structure an original play","Direct peers in a scene","Rehearse and revise a group play"],["How do groups build a play from an idea?","What does a director do?"],["playbuilding","structure","director","conflict","climax","revision"],["D.4"]],
["DR9.D1","Technical theatre and review","Design lighting, sound or set elements and review a performance.",["Plan lighting and sound cues","Design a simple set","Write a theatre review"],["How do technical elements support a story?","How do I review a performance fairly?"],["lighting cue","sound cue","set design","technical rehearsal","review","critique"],["D.5"]]
);
// ---------- General Music 7–9 ----------
addUnits({
  A:["Rhythm and Metre",["How is music organized in time?","How do I read and perform rhythms?"],"rhythm cards, drums and percussion, metronome"],
  B:["Melody and Harmony",["How are melodies built?","How do chords support a melody?"],"keyboards, xylophones, ukuleles or guitars, staff paper"],
  C:["Listening and Styles",["How does music reflect culture and history?","What do I hear when I listen closely?"],"recordings from many cultures and eras, including Canadian and Indigenous musicians, listening guides"],
  D:["Creating and Performing",["How do I compose music?","How do I perform with others?"],"notation or music apps, recording devices, classroom instruments"]
},{
  MU7:{A:["beat and rhythm","note values","time signatures"],B:["treble clef","pitch","melody shape"],C:["listening for instruments","music of many cultures"],D:["rhythm compositions","singing in parts"]},
  MU8:{A:["syncopation","dotted rhythms","tempo"],B:["major scale","chords I, IV, V","keyboard or guitar basics"],C:["music in film and media","program music"],D:["composing a melody","performing with chords"]},
  MU9:{A:["compound metre","rhythm in world music"],B:["minor scales","chord progressions"],C:["form (AB, ABA, verse-chorus)","Canadian music"],D:["songwriting","music technology","ensemble performance"]}
});
SO_ROWS.push(
["MU7.A1","Beat, rhythm and metre","Read, perform and create rhythms using whole, half, quarter and eighth notes in 2/4, 3/4 and 4/4 time.",["Tell beat from rhythm","Read and clap note values","Identify time signatures"],["What is the difference between beat and rhythm?","How do time signatures organize music?"],["beat","rhythm","note value","rest","time signature","bar line"],["M.1"]],
["MU7.B1","Reading melody","Read pitch on the treble staff and describe melodic shape.",["Name notes on the treble staff","Describe step, skip and leap","Play a simple melody"],["How is pitch written?","How does a melody move?"],["staff","treble clef","pitch","step","skip","leap"],["M.2"]],
["MU7.C1","Listening to music of many cultures","Listen to and describe music from many cultures, including Canadian and Indigenous musicians.",["Identify instruments by sound","Describe music using elements","Compare music from two cultures"],["What can I hear when I listen closely?","How does music reflect culture?"],["timbre","tempo","dynamics","texture","culture","genre"],["M.6","M.5"]],
["MU7.D1","Creating with rhythm","Compose and perform a short rhythm piece in a group.",["Compose a four-bar rhythm","Layer rhythms into a group piece","Perform and reflect"],["How do composers build a piece?","How do musicians stay together?"],["compose","ostinato","layer","ensemble","dynamics","performance"],["M.7","M.1"]],
["MU8.A1","Syncopation and dotted rhythms","Read and perform dotted and syncopated rhythms at different tempos.",["Read dotted rhythms","Perform syncopation","Follow tempo markings"],["What makes a rhythm feel off-beat?","How does tempo change a piece?"],["dotted note","syncopation","tempo","allegro","andante","accent"],["M.1"]],
["MU8.B1","Scales and chords","Build a major scale and play I, IV and V chords to accompany a melody.",["Build a major scale","Form I, IV and V chords","Accompany a song with chords"],["How are scales built?","How do chords support a melody?"],["major scale","whole step","half step","chord","triad","accompaniment"],["M.2","M.3"]],
["MU8.C1","Music in film and media","Analyze how music creates mood and meaning in film, games and advertising.",["Analyze how music creates mood","Identify leitmotifs","Score a short video clip"],["How does music change what we see?","Why do composers use themes?"],["soundtrack","leitmotif","mood","underscore","sound effect","tempo"],["M.6","M.5"]],
["MU8.D1","Composing a melody","Compose and notate a melody that fits a chord progression.",["Write a melody using a scale","Fit a melody to chords","Perform and revise a composition"],["What makes a melody memorable?","How do melody and chords fit together?"],["motif","phrase","cadence","notation","revision","progression"],["M.7","M.2"]],
["MU9.A1","Rhythm in world music","Perform rhythms in compound metre and from world music traditions.",["Feel compound metre","Perform rhythms from world traditions","Create a polyrhythm"],["How do different cultures organize rhythm?","What is the difference between simple and compound metre?"],["compound metre","6/8","polyrhythm","clave","drumming","pulse"],["M.1","M.6"]],
["MU9.B1","Minor keys and progressions","Compare major and minor and play common chord progressions.",["Compare major and minor","Play common chord progressions","Analyze progressions in popular songs"],["Why does minor sound different from major?","Why do so many songs share progressions?"],["minor scale","major","progression","I–V–vi–IV","key","tonic"],["M.2","M.3"]],
["MU9.C1","Form and Canadian music","Identify musical forms and explore Canadian musicians and styles.",["Identify AB, ABA and verse-chorus form","Explore Canadian musicians","Present on a Canadian artist"],["How is a song organized?","What makes music Canadian?"],["form","verse","chorus","bridge","ABA","Canadian content"],["M.4","M.6"]],
["MU9.D1","Songwriting and music technology","Write and record an original song using music technology.",["Write lyrics and a melody","Arrange a song with technology","Record and share a song"],["How do songwriters turn ideas into songs?","How has technology changed making music?"],["lyrics","hook","arrangement","digital audio workstation","loop","recording"],["M.7","M.4"]]
);
// ---------- Instrumental Music 7–9 ----------
addUnits({
  A:["Tone and Technique",["How do I make a good sound on my instrument?","How do I care for my instrument?"],"band instruments, method book, tuner, metronome, mirror"],
  B:["Rhythm and Reading",["How do I read and count music?","How do I keep a steady beat?"],"method book, rhythm sheets, metronome, sight-reading exercises"],
  C:["Ensemble Skills",["How does a band play together?","How do I listen while I play?"],"full band arrangements, tuner, recording device"],
  D:["Expression and Performance",["How do I play with expression?","How do I prepare for a concert?"],"concert repertoire, recordings of professional ensembles, concert dress"]
},{
  IM7:{A:["posture","embouchure or grip","breath support","instrument care"],B:["note values","counting","concert B♭ notes"],C:["watching the conductor","starting and stopping together"],D:["dynamics","concert etiquette"]},
  IM8:{A:["range","articulation","scales"],B:["dotted rhythms","syncopation","key signatures"],C:["balance","blend","intonation"],D:["phrasing","style"]},
  IM9:{A:["advanced technique","chromatic scale"],B:["sight-reading","complex rhythms"],C:["small ensembles","listening across sections"],D:["interpretation","solo and ensemble performance"]}
});
SO_ROWS.push(
["IM7.A1","Posture, breath and first tones","Use correct posture, breathing and embouchure or grip to produce a characteristic tone, and care for the instrument.",["Assemble, care for and hold my instrument","Use breath support to make a steady tone","Play my first notes with good tone"],["How do I make a good sound?","Why does posture matter?"],["posture","embouchure","breath support","tone","assembly","maintenance"],["I.1"]],
["IM7.B1","Reading and counting rhythms","Read, count and play quarter, half, whole and eighth notes and rests.",["Count note values aloud","Play rhythms on concert pitches","Sight-read a short line"],["How do I count music?","How do I keep a steady beat?"],["count","quarter note","half note","rest","time signature","steady beat"],["I.2"]],
["IM7.C1","Playing together","Watch the conductor, start and stop together and listen to the ensemble.",["Follow the conductor's beat pattern","Start and release together","Listen to match the band"],["How does a band stay together?","What does a conductor do?"],["conductor","downbeat","release","ensemble","listen","section"],["I.6"]],
["IM7.D1","Dynamics and the first concert","Play with basic dynamics and prepare for a concert.",["Play at different dynamic levels","Prepare a concert piece","Practise concert etiquette"],["How do dynamics make music exciting?","How do I prepare to perform?"],["dynamics","piano","forte","crescendo","concert etiquette","rehearsal"],["I.5"]],
["IM8.A1","Articulation and scales","Play scales and use different articulations with control.",["Play concert scales","Use legato and staccato articulation","Expand my range"],["How does articulation change the sound?","Why practise scales?"],["articulation","legato","staccato","tonguing","scale","range"],["I.1","I.3"]],
["IM8.B1","Dotted rhythms and key signatures","Read dotted rhythms, syncopation and key signatures.",["Count and play dotted rhythms","Play syncopated patterns","Read key signatures"],["How do dotted notes work?","Why do pieces have key signatures?"],["dotted quarter","syncopation","key signature","flat","sharp","accidental"],["I.2","I.3"]],
["IM8.C1","Balance, blend and intonation","Listen and adjust for balance, blend and intonation in the ensemble.",["Tune with a tuner and by ear","Balance with my section and the band","Blend my sound"],["How do I play in tune?","Why does balance matter?"],["intonation","tuning","balance","blend","sharp","flat"],["I.6"]],
["IM8.D1","Phrasing and style","Shape phrases and play in different styles.",["Shape a musical phrase","Play a march and a ballad in style","Mark breath points"],["How do musicians shape a phrase?","How does style change how I play?"],["phrase","breath mark","style","march","ballad","tempo"],["I.5","I.4"]],
["IM9.A1","Advanced technique","Develop technique including the chromatic scale and extended range.",["Play the chromatic scale","Improve technical passages","Use practice strategies"],["How do I practise efficiently?","How do I play difficult passages cleanly?"],["chromatic scale","technique","slow practice","chunking","metronome","range"],["I.1"]],
["IM9.B1","Sight-reading","Sight-read music using a checklist and complex rhythms.",["Use a sight-reading checklist","Read complex rhythms","Sight-read in an ensemble"],["How do I read new music quickly?","What should I check before playing?"],["sight-reading","key signature","time signature","tempo marking","repeat sign","road map"],["I.2"]],
["IM9.C1","Small ensembles","Rehearse and perform in a small ensemble with independent parts.",["Rehearse independently in a small group","Lead and follow in an ensemble","Perform a small-ensemble piece"],["How do small groups rehearse without a conductor?","How do I play my part independently?"],["chamber ensemble","cue","independence","lead","rehearsal plan","listening"],["I.6"]],
["IM9.D1","Interpretation and performance","Interpret a piece with expression and perform for an audience.",["Research a piece's style and history","Make interpretive choices","Perform and self-assess"],["How do I make a piece my own?","How do I assess my performance?"],["interpretation","rubato","expression","programme note","self-assessment","stage presence"],["I.5","I.4"]]
);
// ---------- Career and Technology Foundations (CTF) ----------
// CTF uses one set of outcomes for every challenge: explore interests, plan, create, appraise and communicate, with
// safety and career connections. Challenges here are examples; schools choose occupational areas they can offer.
addUnits({
  A:["Exploring and Planning",["What am I curious about?","How do I plan a challenge?"],"challenge briefs, planning templates, career-cluster cards"],
  B:["Creating",["How do I build a solution safely?","What skills and tools do I need?"],"area-specific tools and materials (foods lab, textiles, construction, computers), safety checklists"],
  C:["Appraising",["Does my product meet the criteria?","How can I improve it?"],"criteria checklists, peer-feedback forms, testing equipment"],
  D:["Communicating and Careers",["How do I share what I made?","What careers use these skills?"],"presentation tools, alis.alberta.ca, guest speakers"]
},{
  CTF7:{A:["interests and passions","challenge criteria","planning"],B:["foods safety and nutrition","measuring","following a recipe"],C:["criteria","testing","feedback"],D:["presenting a product","career clusters"]},
  CTF8:{A:["design brief","sketching","materials"],B:["construction tools","textiles","prototyping"],C:["testing a prototype","iteration"],D:["documentation","trades careers"]},
  CTF9:{A:["problem identification","market research"],B:["coding","media production","entrepreneurship"],C:["user testing","quality"],D:["pitching an idea","high school CTS pathways"]}
});
SO_ROWS.push(
["CTF7.A1","Exploring interests and planning a challenge","Explore personal interests and the five career clusters, and plan a challenge with clear criteria.",["Explore my interests and the career clusters","Read a challenge brief and set criteria","Make a plan with steps, materials and time"],["What am I curious about?","Why does planning matter?"],["interest","career cluster","challenge","criteria","plan","timeline"],["C.1","C.2"]],
["CTF7.B1","Foods challenge: healthy snack","Safely prepare a healthy snack using a recipe, measuring accurately and following food-safety practices.",["Follow food-safety and kitchen-safety rules","Measure ingredients accurately","Prepare and present a healthy snack"],["How do I work safely in a kitchen?","What makes a snack healthy?"],["food safety","cross-contamination","measuring","recipe","nutrition","sanitize"],["C.3","C.7"]],
["CTF7.C1","Appraising a product","Use criteria, testing and feedback to appraise a product and suggest improvements.",["Test a product against criteria","Give and use peer feedback","Plan an improvement"],["How do I know if my product works?","How can feedback help?"],["appraise","criteria","test","feedback","improve","evaluate"],["C.4"]],
["CTF7.D1","Communicating and career connections","Present a product and process, and connect skills to careers.",["Present my product and process","Connect skills to careers","Reflect on my interests"],["How do I share my work?","What careers use these skills?"],["present","process","transferable skill","career","reflection","portfolio"],["C.5","C.6"]],
["CTF8.A1","Design brief and sketching","Respond to a design brief by generating ideas and sketching solutions.",["Analyze a design brief","Brainstorm and sketch solutions","Choose materials"],["How do designers start a project?","How do sketches help?"],["design brief","constraint","brainstorm","thumbnail sketch","orthographic drawing","material"],["C.2"]],
["CTF8.B1","Building a prototype","Build a prototype safely using construction or textile tools and techniques.",["Use tools safely","Build a prototype","Use measuring and joining techniques"],["How do I use tools safely?","What is a prototype for?"],["prototype","hand tools","measuring","joining","safety glasses","tolerance"],["C.3","C.7"]],
["CTF8.C1","Testing and iteration","Test a prototype, record results and improve it through iteration.",["Plan a fair test","Record and analyze results","Improve the design"],["How do engineers improve designs?","What is a fair test?"],["iteration","fair test","variable","data","redesign","failure"],["C.4"]],
["CTF8.D1","Documenting and trades careers","Document the design process and explore careers in trades and technology.",["Document my process","Explore trades careers","Present to an audience"],["Why document a process?","What trades careers interest me?"],["documentation","apprenticeship","trade","Registered Apprenticeship Program","journeyperson","presentation"],["C.5","C.6"]],
["CTF9.A1","Identifying a problem","Identify a real problem or need and research users before designing a solution.",["Identify a need in my school or community","Research users and the market","Write a problem statement"],["What problems are worth solving?","Who am I designing for?"],["problem statement","user","need","survey","market research","empathy"],["C.1","C.2"]],
["CTF9.B1","Coding and media challenge","Create a digital solution such as an app, game, website or video.",["Plan a digital product","Build it using code or media tools","Debug and refine"],["How do digital products get made?","How do I fix errors?"],["algorithm","code","debug","storyboard","user interface","iteration"],["C.3"]],
["CTF9.C1","User testing and quality","Test a product with users and use feedback to improve quality.",["Plan user testing","Collect and analyze feedback","Make quality improvements"],["What do users really think?","What makes a product high quality?"],["user testing","feedback","quality","usability","survey","revision"],["C.4"]],
["CTF9.D1","Pitching and pathways","Pitch a product or business idea and plan high school CTS pathways.",["Develop a pitch","Present to a panel","Plan high school CTS courses"],["How do I convince an audience?","What high school courses fit my interests?"],["pitch","entrepreneur","value proposition","Career and Technology Studies","pathway","credit"],["C.5","C.6"]]
);
// ---------- Environmental and Outdoor Education 7–9 ----------
addUnits({
  A:["Outdoor Skills and Safety",["How do I stay safe and comfortable outdoors?","What skills do I need?"],"outdoor clothing examples, first-aid kit, maps and compasses, field equipment"],
  B:["Understanding the Environment",["How do ecosystems work?","What lives in our local environment?"],"field guides, hand lenses, nets and trays, local maps, data sheets"],
  C:["Environmental Ethics",["How should people treat the land?","What can we learn from Indigenous perspectives?"],"stories and teachings shared by Elders and Knowledge Keepers (with protocol), case studies"],
  D:["Stewardship and Action",["How can I help the environment?","How do I lead others outdoors?"],"project planning templates, community partners, local parks and conservation groups"]
},{
  EOE7:{A:["layering","outdoor safety","shelter basics"],B:["observing ecosystems","field journal","local plants and animals"],C:["Leave No Trace","connection to place"],D:["schoolyard stewardship"]},
  EOE8:{A:["map and compass","trip planning"],B:["watersheds","wildlife"],C:["human impact","Indigenous perspectives on the land"],D:["community clean-up and restoration"]},
  EOE9:{A:["winter skills","leading activities"],B:["sustainability","climate and ecosystems"],C:["environmental issues","multiple perspectives"],D:["stewardship project","leadership"]}
});
SO_ROWS.push(
["EOE7.A1","Staying safe and comfortable outdoors","Dress and prepare for Alberta weather and follow safety practices outdoors.",["Layer clothing for the weather","Pack the outdoor essentials","Recognize and prevent cold and heat injuries"],["How do I dress for Alberta weather?","What should I always bring outdoors?"],["layering","base layer","wind chill","hypothermia","heat exhaustion","essentials"],["O.1"]],
["EOE7.B1","Observing a local ecosystem","Observe and record living and non-living parts of a local ecosystem in a field journal.",["Keep a field journal","Identify living and non-living parts","Map a study site"],["What lives in our local environment?","How do scientists observe nature?"],["ecosystem","biotic","abiotic","habitat","field journal","observation"],["O.2"]],
["EOE7.C1","Leave No Trace and connection to place","Apply Leave No Trace principles and reflect on personal connections to the land.",["Apply the seven Leave No Trace principles","Reflect on a special place","Learn about the land we live on"],["How should we treat natural places?","What does this place mean to me?"],["Leave No Trace","durable surface","impact","sense of place","land acknowledgment","respect"],["O.3"]],
["EOE7.D1","Schoolyard stewardship","Plan and carry out a small stewardship action at school.",["Assess the schoolyard environment","Plan a stewardship action","Carry out and reflect on the action"],["How can I make a difference here?","What does stewardship mean?"],["stewardship","action plan","biodiversity","pollinator","litter","restoration"],["O.4"]],
["EOE8.A1","Navigation and trip planning","Use maps and compasses and write a safe trip plan.",["Read topographic maps","Navigate with a compass","Write a trip plan"],["How do I find my way outdoors?","Why leave a trip plan?"],["topographic map","contour line","bearing","compass","trip plan","route"],["O.1"]],
["EOE8.B1","Watersheds and wildlife","Describe Alberta's watersheds and how wildlife depends on healthy habitats.",["Map our local watershed","Test water quality","Track local wildlife"],["Where does our water come from?","How do animals depend on habitat?"],["watershed","riparian zone","water quality","indicator species","habitat","migration"],["O.2"]],
["EOE8.C1","Human impact and Indigenous perspectives","Analyze human impacts on Alberta environments and learn from Indigenous perspectives on relationship with the land.",["Analyze human impact on an Alberta environment","Learn Indigenous perspectives on land relationships","Compare perspectives on land use"],["How do people change the land?","What does it mean to be in relationship with the land?"],["impact","land use","reciprocity","traditional knowledge","development","perspective"],["O.3"]],
["EOE8.D1","Community restoration","Plan and take part in a community clean-up or restoration project.",["Partner with a community group","Plan a restoration activity","Carry out and evaluate the project"],["How can communities restore damaged areas?","How do we measure success?"],["restoration","invasive species","native plants","partnership","volunteer","evaluation"],["O.4"]],
["EOE9.A1","Winter skills and leading outdoors","Apply winter outdoor skills and lead a safe outdoor activity for peers.",["Practise winter travel and safety skills","Plan an outdoor activity for peers","Lead and debrief the activity"],["How do people thrive outdoors in winter?","What makes a good outdoor leader?"],["snowshoeing","cold injury","group management","risk","briefing","debrief"],["O.1"]],
["EOE9.B1","Sustainability and ecosystems","Explain sustainability and how climate and human choices affect ecosystems.",["Define sustainability","Analyze how climate affects local ecosystems","Calculate an ecological footprint"],["What does it mean to live sustainably?","How are ecosystems changing?"],["sustainability","ecological footprint","climate","carbon","conservation","resource"],["O.2"]],
["EOE9.C1","Environmental issues and perspectives","Investigate an Alberta environmental issue from several perspectives.",["Research an environmental issue","Compare stakeholder perspectives","Form and defend a position"],["Why do people disagree about environmental issues?","How do I make an informed decision?"],["stakeholder","perspective","trade-off","economy","ecology","evidence"],["O.3"]],
["EOE9.D1","Stewardship project","Design, lead and evaluate a stewardship project with community partners.",["Design a stewardship project","Lead the project","Evaluate and share results"],["How can I lead change?","How do I know my project worked?"],["project plan","leadership","partner","outcome","evaluation","advocacy"],["O.4"]]
);
// ---------- Ethics (Grade 7, 8 or 9) ----------
addUnits({
  A:["Values and Moral Reasoning",["What are values?","How do people decide what is right?"],"scenario cards, decision-making templates"],
  B:["Personal Responsibility",["What does it mean to be responsible?","Why does honesty matter?"],"case studies, journals"],
  C:["Relationships and Fairness",["How should we treat others?","What is fairness?"],"role-play cards, discussion guides"],
  D:["Ethics in Community and the World",["What do we owe our communities?","How do ethics apply to global issues?"],"news articles (age-appropriate), the Universal Declaration of Human Rights, the Canadian Charter of Rights and Freedoms"]
},{
  ETH:{A:["values","moral reasoning","ethical lenses","decision making"],B:["honesty","integrity","accountability"],C:["fairness","respect","empathy","bullying"],D:["human rights","digital citizenship","environmental ethics"]}
});
SO_ROWS.push(
["ETH.A1","Values and ethical decision making","Identify personal values and use a decision-making model and ethical lenses to reason about dilemmas.",["Identify my values","Use ethical lenses","Apply a decision-making model to a dilemma"],["What are my values, and where do they come from?","How do I decide what is right?"],["value","ethics","dilemma","consequence","principle","moral reasoning"],["E.1"]],
["ETH.B1","Honesty and integrity","Examine honesty, integrity and accountability in personal choices.",["Define honesty and integrity","Analyze cases about cheating and truth-telling","Practise accountability"],["Is it ever right to lie?","What does integrity look like?"],["honesty","integrity","accountability","rationalize","trust","character"],["E.2"]],
["ETH.C1","Fairness, respect and empathy","Analyze fairness and respect in relationships, including responses to bullying and exclusion.",["Distinguish equality and equity","Practise empathy and perspective-taking","Respond ethically to bullying"],["What is fair?","How should I treat people I disagree with?"],["fairness","equality","equity","empathy","bystander","upstander"],["E.3"]],
["ETH.D1","Rights, responsibilities and global ethics","Examine human rights, digital citizenship and global ethical issues.",["Explain human rights and responsibilities","Apply ethics to digital citizenship","Analyze a global ethical issue"],["What rights does every person have?","What responsibilities come with being online?"],["human rights","Charter","digital citizenship","privacy","global citizen","responsibility"],["E.4"]]
);
// ---------- Languages: French as a Second Language (nine-year), Spanish and Chinese Language and Culture ----------
// Units are themes ("fields of experience"); every outcome is tagged with program components.
const LANG_MAT = {
  FSL:"authorized FSL resources, French songs and videos from Canadian francophone creators, picture dictionaries, flashcards",
  SPA:"authorized Spanish resources, songs and videos from Spanish-speaking countries, picture dictionaries, flashcards",
  CHI:"authorized Chinese resources, pinyin and tone charts, character cards, songs and videos, a dictionary app"
};
function langUnits(code, grade, themes){
  const meta = {}, kc = {}; kc[code + grade] = {};
  Object.entries(themes).forEach(([L, [title, q, k]]) => { meta[L] = [title, q, LANG_MAT[code]]; kc[code + grade][L] = k; });
  addUnits(meta, kc);
}
langUnits("FSL", 7, {
  A:["Moi et les autres (Me and Others)",["How do I introduce myself in French?","How do I describe people?"],["greetings","être and avoir","adjective agreement"]],
  B:["L'école (School)",["How do I talk about school?","How do I tell time?"],["school subjects","telling time","likes and dislikes"]],
  C:["La nourriture (Food)",["How do I talk about food?","How do I order in a café?"],["food vocabulary","partitive articles","ordering politely"]],
  D:["Les loisirs (Leisure)",["How do I talk about what I like to do?","What do francophone youth do for fun?"],["-er verbs","faire and jouer","francophone culture in Canada"]]
});
langUnits("FSL", 8, {
  A:["Les achats et la mode (Shopping and Fashion)",["How do I shop in French?","How do I describe clothing?"],["clothing","colours and agreement","numbers and prices"]],
  B:["La santé (Health)",["How do I talk about my body and health?","How do I give advice?"],["body parts","avoir mal à","imperative"]],
  C:["Le voyage et la météo (Travel and Weather)",["How do I talk about the weather?","How do I plan a trip?"],["weather expressions","aller + infinitive","places"]],
  D:["Le monde francophone (The Francophone World)",["Where is French spoken?","How do francophone cultures celebrate?"],["la Francophonie","francophone communities in Alberta","cultural comparison"]]
});
langUnits("FSL", 9, {
  A:["Les médias et la technologie (Media and Technology)",["How do I talk about technology?","How do media shape us?"],["technology vocabulary","opinions","passé composé"]],
  B:["L'environnement (The Environment)",["How do I discuss environmental issues?","What can we do?"],["environment vocabulary","il faut","suggestions"]],
  C:["L'avenir et les carrières (Future and Careers)",["How do I talk about my future?","Why is French useful for careers?"],["professions","futur proche","goals"]],
  D:["Les fêtes francophones (Francophone Celebrations)",["How do francophones celebrate?","How do celebrations compare?"],["Festival du Voyageur","Carnaval de Québec","comparison"]]
});
langUnits("SPA", 7, {
  A:["Saludos y presentaciones (Greetings)",["How do I greet and introduce myself?","How are greetings different across cultures?"],["greetings","ser","numbers 0–20"]],
  B:["La familia (Family)",["How do I describe my family?","How are families similar and different?"],["family members","possessive adjectives","tener"]],
  C:["La escuela (School)",["How do I talk about school?","What is school like in Spanish-speaking countries?"],["classes","telling time","-ar verbs"]],
  D:["Mi rutina (My Routine)",["How do I describe my day?","How do routines differ by culture?"],["daily activities","days of the week","frequency"]]
});
langUnits("SPA", 8, {
  A:["La comida (Food)",["How do I talk about food?","How do I order in a restaurant?"],["food","gustar","ordering"]],
  B:["Mi casa y mi comunidad (Home and Community)",["How do I describe my home and town?","How do I give directions?"],["rooms","estar for location","directions"]],
  C:["Los pasatiempos (Hobbies and Sports)",["How do I talk about my free time?","Which sports are popular in the Spanish-speaking world?"],["hobbies","jugar","ir a + infinitive"]],
  D:["Las fiestas (Festivals)",["How do Spanish-speaking communities celebrate?","How do celebrations reflect culture?"],["Día de los Muertos","Las Fallas","Inti Raymi"]]
});
langUnits("SPA", 9, {
  A:["Los viajes (Travel)",["How do I plan a trip in Spanish?","What can I learn by travelling?"],["travel vocabulary","transportation","countries and capitals"]],
  B:["La salud (Health)",["How do I talk about health?","How do I describe how I feel?"],["body parts","doler","estar with feelings"]],
  C:["El medio ambiente (The Environment)",["How do I discuss environmental issues?","What are Spanish-speaking countries doing?"],["environment vocabulary","deber","opinions"]],
  D:["Mi futuro (My Future)",["How do I talk about my plans?","How do I talk about the past?"],["future plans","preterite","professions"]]
});
langUnits("CHI", 7, {
  A:["拼音和声调 Pinyin and Tones",["How does Mandarin use tones?","How do I read pinyin?"],["four tones","initials and finals","pinyin"]],
  B:["问候和介绍 Greetings and Introductions",["How do I greet and introduce myself?","How do Chinese greetings show respect?"],["你好","我叫","basic characters"]],
  C:["数字和日期 Numbers and Dates",["How do I count and say dates in Mandarin?","How are dates written?"],["numbers 1–100","日期","星期"]],
  D:["我的家 My Family",["How do I describe my family?","How are family roles named in Chinese?"],["family members","有","measure word 个"]]
});
langUnits("CHI", 8, {
  A:["学校生活 School Life",["How do I talk about school?","What is school like in China?"],["school subjects","time","schedules"]],
  B:["食物 Food",["How do I talk about food?","How do I order at a restaurant?"],["food","想要","measure words"]],
  C:["买东西 Shopping",["How do I shop in Mandarin?","How do I talk about money?"],["money (块, 毛)","多少钱","bargaining politely"]],
  D:["中国节日 Chinese Festivals",["How are Chinese festivals celebrated?","What do the traditions mean?"],["Spring Festival","Mid-Autumn Festival","Dragon Boat Festival"]]
});
langUnits("CHI", 9, {
  A:["爱好 Hobbies",["How do I talk about my hobbies?","How do I say what I can do?"],["hobbies","会 and 能","喜欢"]],
  B:["旅行和方向 Travel and Directions",["How do I ask for and give directions?","How do I talk about transportation?"],["在","directions","transportation"]],
  C:["天气和季节 Weather and Seasons",["How do I describe the weather?","How do seasons compare in Canada and China?"],["weather","seasons","comparison with 比"]],
  D:["加拿大的华人社区 Chinese Communities in Canada",["How have Chinese Canadians shaped Canada?","How is culture kept alive?"],["Chinatowns","history of Chinese Canadians","cultural heritage"]]
});
SO_ROWS.push(
// French
["FSL7.A1","Introducing myself and others","Greet people, introduce myself and describe people using être, avoir and adjectives.",["Greet and introduce myself","Describe people with adjectives","Ask and answer personal questions"],["How do I introduce myself in French?","How do adjectives change in French?"],["bonjour","je m'appelle","j'ai … ans","il/elle est","adjectif","accord"],["F.2","F.3","F.4"]],
["FSL7.B1","School life and time","Talk about school subjects, schedules and likes, and tell time.",["Name school subjects and supplies","Tell time","Say what I like and don't like about school"],["How do I talk about school?","How is school different in francophone countries?"],["les matières","l'horaire","Quelle heure est-il?","j'aime","je n'aime pas","préféré"],["F.1","F.2","F.4"]],
["FSL7.C1","Food and the café","Talk about food preferences and order politely in a café.",["Name foods and drinks","Use du, de la and des","Order politely in a café"],["How do I talk about food?","How do I order politely?"],["la nourriture","du, de la, des","je voudrais","s'il vous plaît","l'addition","au café"],["F.3","F.4","F.5"]],
["FSL7.D1","Leisure and francophone culture","Talk about leisure activities using -er verbs, faire and jouer, and explore francophone culture in Canada.",["Talk about activities with -er verbs","Use faire and jouer","Explore francophone culture in Canada"],["What do I like to do?","What do francophone youth in Canada enjoy?"],["les loisirs","jouer à","faire du","le week-end","francophone","la culture"],["F.2","F.5"]],
["FSL8.A1","Shopping and clothing","Describe clothing, ask prices and shop in French.",["Describe clothing with colours","Ask and give prices","Role-play shopping"],["How do I shop in French?","How do colours agree with nouns?"],["les vêtements","Combien coûte…?","la taille","porter","les couleurs","le magasin"],["F.3","F.4"]],
["FSL8.B1","Health and the body","Describe the body, symptoms and give health advice.",["Name parts of the body","Describe symptoms with avoir mal à","Give advice using the imperative"],["How do I explain how I feel?","How do I give advice?"],["le corps","j'ai mal à","la santé","l'impératif","il faut","le médecin"],["F.2","F.4"]],
["FSL8.C1","Weather and travel plans","Describe weather and plan a trip using aller + infinitive.",["Describe the weather","Plan a trip with aller + infinitive","Present a travel plan"],["How do I talk about the weather?","How do I talk about plans?"],["Quel temps fait-il?","il fait beau","il neige","aller + infinitif","le voyage","la destination"],["F.2","F.4"]],
["FSL8.D1","The francophone world","Explore where French is spoken and compare francophone cultures with my own.",["Locate francophone countries and communities","Explore francophone communities in Alberta","Compare a francophone tradition with my own"],["Where is French spoken?","How do francophone cultures connect to Alberta?"],["la Francophonie","francophone","Alberta francophone","la tradition","comparer","la communauté"],["F.1","F.5"]],
["FSL9.A1","Media and technology","Talk about technology and media habits and give opinions, including events in the past.",["Describe how I use technology","Give and justify opinions","Describe past events with the passé composé"],["How does technology affect my life?","How do I talk about the past?"],["la technologie","les médias","à mon avis","passé composé","j'ai regardé","les réseaux sociaux"],["F.2","F.3","F.4"]],
["FSL9.B1","The environment","Discuss environmental problems and suggest solutions.",["Name environmental problems","Suggest solutions with il faut","Create an awareness poster"],["What environmental problems matter to me?","What can we do?"],["l'environnement","recycler","la pollution","il faut","protéger","le changement climatique"],["F.2","F.4"]],
["FSL9.C1","Future plans and careers","Talk about future plans and careers that use French.",["Name professions","Talk about the future with futur proche","Explain why French is useful"],["What do I want to do in the future?","How can French help my career?"],["les métiers","je vais devenir","l'avenir","bilingue","le travail","le but"],["F.2","F.5"]],
["FSL9.D1","Francophone celebrations","Explore and compare francophone celebrations in Canada and the world.",["Explore Festival du Voyageur and Carnaval de Québec","Compare celebrations","Present a francophone celebration"],["How do francophones celebrate?","What do celebrations tell us about a culture?"],["la fête","le carnaval","le festival","la tradition","célébrer","comparer"],["F.1","F.5"]],
// Spanish
["SPA7.A1","Greetings and introductions","Greet, introduce myself and use numbers 0–20, and compare greetings across cultures.",["Greet and say goodbye","Introduce myself with ser","Use numbers 0–20"],["How do I greet people in Spanish?","How are greetings different across cultures?"],["hola","me llamo","¿Cómo estás?","soy","tengo … años","adiós"],["S.1","S.2","S.3"]],
["SPA7.B1","My family","Describe my family using tener and possessive adjectives.",["Name family members","Use tener and possessive adjectives","Describe my family"],["How do I describe my family?","How are families similar and different?"],["la familia","mi, tu, su","tener","el hermano","la madre","los abuelos"],["S.1","S.2"]],
["SPA7.C1","School and time","Talk about classes and schedules, tell time and use regular -ar verbs.",["Name classes and school items","Tell time","Use -ar verbs to describe school"],["How do I talk about school?","What is school like in Spanish-speaking countries?"],["las clases","¿Qué hora es?","estudiar","hablar","el horario","la escuela"],["S.1","S.2","S.3"]],
["SPA7.D1","My daily routine","Describe daily routines, days of the week and how often I do things.",["Name days and daily activities","Describe my routine","Compare routines across cultures"],["What do I do every day?","How do routines differ by culture?"],["la rutina","los días","siempre","a veces","nunca","por la mañana"],["S.1","S.3"]],
["SPA8.A1","Food and restaurants","Talk about food preferences using gustar and order in a restaurant.",["Name foods and drinks","Use gustar","Order in a restaurant"],["How do I say what I like to eat?","How do I order politely?"],["la comida","me gusta","quisiera","la cuenta","el camarero","delicioso"],["S.1","S.2"]],
["SPA8.B1","Home and community","Describe my home and community and give directions using estar.",["Describe rooms in my home","Use estar for location","Give directions"],["How do I describe where I live?","How do I give directions?"],["la casa","el barrio","estar","a la derecha","a la izquierda","todo recto"],["S.1","S.2"]],
["SPA8.C1","Hobbies and sports","Talk about hobbies and sports and future plans with ir a + infinitive.",["Name hobbies and sports","Use jugar and ir a + infinitive","Invite a friend to do an activity"],["What do I do for fun?","Which sports are popular in the Spanish-speaking world?"],["los pasatiempos","jugar al fútbol","ir a + infinitivo","¿Quieres…?","el fin de semana","el deporte"],["S.1","S.2","S.3"]],
["SPA8.D1","Festivals of the Spanish-speaking world","Explore and compare festivals such as Día de los Muertos, Las Fallas and Inti Raymi.",["Explore Día de los Muertos","Compare festivals in different countries","Present a festival"],["How do Spanish-speaking communities celebrate?","What do festivals reveal about culture?"],["la fiesta","la tradición","celebrar","el desfile","la ofrenda","la cultura"],["S.3"]],
["SPA9.A1","Travel","Plan a trip, talk about transportation and countries, and handle travel situations.",["Name countries, capitals and transport","Plan a trip","Role-play travel situations"],["Where would I like to travel?","How do I get around?"],["el viaje","el avión","el hotel","el pasaporte","la capital","viajar"],["S.1","S.2","S.3"]],
["SPA9.B1","Health","Talk about health, symptoms and feelings using doler and estar.",["Name body parts","Describe symptoms with doler","Talk about feelings with estar"],["How do I describe how I feel?","How do I get help when I'm sick?"],["el cuerpo","me duele","estoy cansado","enfermo","el médico","la salud"],["S.1","S.2"]],
["SPA9.C1","The environment","Discuss environmental problems and give opinions and suggestions.",["Name environmental problems","Give opinions and suggestions","Explore environmental efforts in Spanish-speaking countries"],["What environmental problems matter to me?","What are other countries doing?"],["el medio ambiente","reciclar","la contaminación","debemos","en mi opinión","proteger"],["S.1","S.3"]],
["SPA9.D1","My future and my past","Talk about future plans and careers, and narrate past events using the preterite.",["Talk about future plans and careers","Narrate past events with the preterite","Compare past and future"],["What do I want to do in the future?","How do I talk about what happened?"],["el futuro","voy a ser","la profesión","el pretérito","ayer","el año pasado"],["S.1","S.2"]],
// Mandarin
["CHI7.A1","Pinyin and the four tones","Recognize and produce the four tones and read pinyin.",["Hear and say the four tones","Read pinyin syllables","Use tone marks"],["Why do tones matter in Mandarin?","How does pinyin help me read?"],["拼音 pīnyīn","声调 shēngdiào","一声 yī shēng","四声 sì shēng","妈 mā","马 mǎ"],["Z.2","Z.4"]],
["CHI7.B1","Greetings and introductions","Greet people, introduce myself and recognize basic characters.",["Greet and say goodbye","Introduce my name and age","Read and write basic characters"],["How do I greet people in Mandarin?","How do greetings show respect?"],["你好 nǐ hǎo","我叫 wǒ jiào","谢谢 xièxie","再见 zàijiàn","老师 lǎoshī","岁 suì"],["Z.1","Z.2","Z.3"]],
["CHI7.C1","Numbers and dates","Use numbers to 100 and say dates and days of the week.",["Count to 100","Say the date","Say days of the week"],["How do Chinese numbers work?","How are dates said and written?"],["数字 shùzì","年 nián","月 yuè","日 rì","星期 xīngqī","今天 jīntiān"],["Z.1","Z.2"]],
["CHI7.D1","My family","Describe family members using 有 and the measure word 个.",["Name family members","Use 有 and 个","Describe my family"],["How do I describe my family?","How do family titles show relationships?"],["家 jiā","爸爸 bàba","妈妈 māma","哥哥 gēge","有 yǒu","个 gè"],["Z.1","Z.2","Z.3"]],
["CHI8.A1","School life","Talk about school subjects, time and daily schedules.",["Name school subjects","Tell time","Describe my school day"],["How do I talk about my school day?","What is school like in China?"],["学校 xuéxiào","中文 Zhōngwén","数学 shùxué","点 diǎn","上课 shàngkè","下课 xiàkè"],["Z.1","Z.2","Z.3"]],
["CHI8.B1","Food and ordering","Talk about food and order at a restaurant using 想要 and measure words.",["Name foods and drinks","Use 想要 and measure words","Order at a restaurant"],["How do I order food in Mandarin?","What do Chinese meals look like?"],["米饭 mǐfàn","面条 miàntiáo","饺子 jiǎozi","茶 chá","想要 xiǎng yào","碗 wǎn"],["Z.1","Z.2","Z.3"]],
["CHI8.C1","Shopping with money","Ask prices and shop using Chinese money terms.",["Use money terms 块 and 毛","Ask 多少钱","Role-play shopping"],["How do I shop in Mandarin?","How is money counted?"],["钱 qián","块 kuài","毛 máo","多少钱 duōshao qián","太贵了 tài guì le","买 mǎi"],["Z.1","Z.2"]],
["CHI8.D1","Chinese festivals","Explore the Spring Festival, Mid-Autumn Festival and Dragon Boat Festival.",["Explore the Spring Festival","Explore Mid-Autumn and Dragon Boat festivals","Compare festivals with my own"],["How are Chinese festivals celebrated?","What do the traditions mean?"],["春节 Chūnjié","中秋节 Zhōngqiū Jié","端午节 Duānwǔ Jié","红包 hóngbāo","月饼 yuèbing","新年快乐 xīnnián kuàilè"],["Z.3"]],
["CHI9.A1","Hobbies and abilities","Talk about hobbies and abilities using 喜欢, 会 and 能.",["Name hobbies","Use 会 and 能","Interview a classmate about hobbies"],["What do I like to do?","How do I say what I can do?"],["爱好 àihào","喜欢 xǐhuan","会 huì","能 néng","打篮球 dǎ lánqiú","唱歌 chàng gē"],["Z.1","Z.2"]],
["CHI9.B1","Travel and directions","Ask for and give directions and talk about transportation.",["Ask where places are with 在","Give directions","Talk about transportation"],["How do I find my way?","How do people get around in Chinese cities?"],["在 zài","哪儿 nǎr","左 zuǒ","右 yòu","坐 zuò","地铁 dìtiě"],["Z.1","Z.2"]],
["CHI9.C1","Weather and seasons","Describe weather and seasons and compare using 比.",["Describe the weather","Name the seasons","Compare with 比"],["How do I describe the weather?","How do Canadian and Chinese seasons compare?"],["天气 tiānqì","冷 lěng","热 rè","下雪 xià xuě","季节 jìjié","比 bǐ"],["Z.1","Z.2","Z.3"]],
["CHI9.D1","Chinese communities in Canada","Explore the history and contributions of Chinese Canadians and how culture is kept alive.",["Explore the history of Chinese Canadians","Explore Chinatowns and community life","Present on cultural heritage"],["How have Chinese Canadians shaped Canada?","How do communities keep culture alive?"],["华人 Huárén","唐人街 Tángrénjiē","历史 lìshǐ","文化 wénhuà","社区 shèqū","铁路 tiělù"],["Z.3"]]
);
