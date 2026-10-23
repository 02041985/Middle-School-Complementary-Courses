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
