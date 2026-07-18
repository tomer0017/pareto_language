import type { ReadingCollection, ReadingLevel, Story, StorySentence, QuizQuestion } from '../types.js';
import { s, title, mc, tf, T } from '../authoring.js';

/**
 * Collection 1 — "Beginner Stories" (A1 / early A2). Code-split (lazy-loaded on open). Every story
 * exists in all three learning languages (`en` canonical · `fr` · `es`) with a Hebrew native gloss,
 * and deliberately RECYCLES beginner vocabulary — animals, colors, food, fruit, vegetables, numbers,
 * family, daily routines, clothing, house, weather, transport, market/shopping and common verbs — so
 * words repeat naturally across stories. Folk tales are ORIGINAL simplified adaptations (public-domain
 * tales; no copyrighted wording copied).
 */

const CID = 'beginner-stories';

function story(id: string, level: ReadingLevel, topics: string[], ttl: Story['title'], sentences: StorySentence[], quiz: QuizQuestion[]): Story {
  return { id, collectionId: CID, level, topics, title: ttl, sentences, quiz };
}

const STORIES: Story[] = [
  // ── Level 1 (A1, 5–10 sentences) ──────────────────────────────────────────
  story('bs-little-apple', 1, ['fruit', 'colors', 'food'],
    title('The Little Apple', 'התפוח הקטן', 'La petite pomme', 'La manzanita'),
    [
      s('The apple is small.', 'התפוח קטן.', 'La pomme est petite.', 'La manzana es pequeña.'),
      s('The apple is red.', 'התפוח אדום.', 'La pomme est rouge.', 'La manzana es roja.'),
      s('The apple is on the tree.', 'התפוח על העץ.', 'La pomme est sur l’arbre.', 'La manzana está en el árbol.'),
      s('A girl sees the apple.', 'ילדה רואה את התפוח.', 'Une fille voit la pomme.', 'Una niña ve la manzana.'),
      s('She takes the apple.', 'היא לוקחת את התפוח.', 'Elle prend la pomme.', 'Ella toma la manzana.'),
      s('The apple is sweet.', 'התפוח מתוק.', 'La pomme est sucrée.', 'La manzana es dulce.'),
      s('The girl is happy.', 'הילדה מרוצה.', 'La fille est contente.', 'La niña está contenta.'),
    ],
    [
      mc(T('What color is the apple?', 'באיזה צבע התפוח?'), [T('Red', 'אדום'), T('Green', 'ירוק'), T('Blue', 'כחול')], 0),
      tf(T('The apple is big.', 'התפוח גדול.'), false),
      mc(T('Who takes the apple?', 'מי לוקח את התפוח?'), [T('A boy', 'ילד'), T('A girl', 'ילדה'), T('A man', 'איש')], 1),
    ]),

  story('bs-my-family', 1, ['family', 'animals'],
    title('My Family', 'המשפחה שלי', 'Ma famille', 'Mi familia'),
    [
      s('I have a big family.', 'יש לי משפחה גדולה.', 'J’ai une grande famille.', 'Tengo una familia grande.'),
      s('My father is tall.', 'אבא שלי גבוה.', 'Mon père est grand.', 'Mi papá es alto.'),
      s('My mother is kind.', 'אמא שלי נחמדה.', 'Ma mère est gentille.', 'Mi mamá es amable.'),
      s('I have a brother and a sister.', 'יש לי אח ואחות.', 'J’ai un frère et une sœur.', 'Tengo un hermano y una hermana.'),
      s('My brother is small.', 'אח שלי קטן.', 'Mon frère est petit.', 'Mi hermano es pequeño.'),
      s('We have a dog.', 'יש לנו כלב.', 'Nous avons un chien.', 'Tenemos un perro.'),
      s('I love my family.', 'אני אוהב את המשפחה שלי.', 'J’aime ma famille.', 'Amo a mi familia.'),
    ],
    [
      mc(T('How many brothers does the child have?', 'כמה אחים יש לילד?'), [T('One', 'אחד'), T('Two', 'שניים'), T('Three', 'שלושה')], 0),
      tf(T('The family has a cat.', 'למשפחה יש חתול.'), false),
      mc(T('Who is tall?', 'מי גבוה?'), [T('The mother', 'אמא'), T('The father', 'אבא'), T('The brother', 'האח')], 1),
    ]),

  story('bs-dog-and-cat', 1, ['animals', 'colors', 'house'],
    title('The Dog and the Cat', 'הכלב והחתול', 'Le chien et le chat', 'El perro y el gato'),
    [
      s('The dog is big.', 'הכלב גדול.', 'Le chien est grand.', 'El perro es grande.'),
      s('The cat is small.', 'החתול קטן.', 'Le chat est petit.', 'El gato es pequeño.'),
      s('The dog is brown.', 'הכלב חום.', 'Le chien est marron.', 'El perro es marrón.'),
      s('The cat is white.', 'החתול לבן.', 'Le chat est blanc.', 'El gato es blanco.'),
      s('The dog runs in the garden.', 'הכלב רץ בגינה.', 'Le chien court dans le jardin.', 'El perro corre en el jardín.'),
      s('The cat sleeps on the chair.', 'החתול ישן על הכיסא.', 'Le chat dort sur la chaise.', 'El gato duerme en la silla.'),
      s('The dog and the cat are friends.', 'הכלב והחתול חברים.', 'Le chien et le chat sont amis.', 'El perro y el gato son amigos.'),
    ],
    [
      mc(T('What color is the cat?', 'באיזה צבע החתול?'), [T('Brown', 'חום'), T('White', 'לבן'), T('Black', 'שחור')], 1),
      tf(T('The dog sleeps on the chair.', 'הכלב ישן על הכיסא.'), false),
      mc(T('Who runs in the garden?', 'מי רץ בגינה?'), [T('The dog', 'הכלב'), T('The cat', 'החתול'), T('The girl', 'הילדה')], 0),
    ]),

  story('bs-lost-ball', 1, ['colors', 'verbs', 'park', 'animals'],
    title('The Lost Ball', 'הכדור האבוד', 'Le ballon perdu', 'La pelota perdida'),
    [
      s('Tom has a ball.', 'לטום יש כדור.', 'Tom a un ballon.', 'Tom tiene una pelota.'),
      s('The ball is blue.', 'הכדור כחול.', 'Le ballon est bleu.', 'La pelota es azul.'),
      s('Tom plays in the park.', 'טום משחק בפארק.', 'Tom joue dans le parc.', 'Tom juega en el parque.'),
      s('The ball goes under a tree.', 'הכדור הולך מתחת לעץ.', 'Le ballon va sous un arbre.', 'La pelota va debajo de un árbol.'),
      s('Tom cannot find the ball.', 'טום לא מוצא את הכדור.', 'Tom ne trouve pas le ballon.', 'Tom no encuentra la pelota.'),
      s('A dog finds the ball.', 'כלב מוצא את הכדור.', 'Un chien trouve le ballon.', 'Un perro encuentra la pelota.'),
      s('Tom is happy again.', 'טום שוב שמח.', 'Tom est content de nouveau.', 'Tom está contento otra vez.'),
    ],
    [
      mc(T('What color is the ball?', 'באיזה צבע הכדור?'), [T('Blue', 'כחול'), T('Red', 'אדום'), T('Green', 'ירוק')], 0),
      mc(T('Who finds the ball?', 'מי מוצא את הכדור?'), [T('Tom', 'טום'), T('A dog', 'כלב'), T('A cat', 'חתול')], 1),
      tf(T('Tom plays at home.', 'טום משחק בבית.'), false),
    ]),

  story('bs-little-bird', 1, ['animals', 'colors', 'numbers', 'food'],
    title('The Little Bird', 'הציפור הקטנה', 'Le petit oiseau', 'El pajarito'),
    [
      s('The bird is small.', 'הציפור קטנה.', 'L’oiseau est petit.', 'El pájaro es pequeño.'),
      s('The bird is yellow.', 'הציפור צהובה.', 'L’oiseau est jaune.', 'El pájaro es amarillo.'),
      s('The bird lives in a tree.', 'הציפור גרה בעץ.', 'L’oiseau vit dans un arbre.', 'El pájaro vive en un árbol.'),
      s('The bird has three babies.', 'לציפור יש שלושה גוזלים.', 'L’oiseau a trois petits.', 'El pájaro tiene tres crías.'),
      s('The mother bird brings food.', 'אמא ציפור מביאה אוכל.', 'La maman oiseau apporte à manger.', 'La mamá pájaro trae comida.'),
      s('The babies eat and grow.', 'הגוזלים אוכלים וגדלים.', 'Les petits mangent et grandissent.', 'Las crías comen y crecen.'),
      s('The birds sing every morning.', 'הציפורים שרות כל בוקר.', 'Les oiseaux chantent chaque matin.', 'Los pájaros cantan cada mañana.'),
    ],
    [
      mc(T('How many babies does the bird have?', 'כמה גוזלים יש לציפור?'), [T('Two', 'שניים'), T('Three', 'שלושה'), T('Four', 'ארבעה')], 1),
      mc(T('What color is the bird?', 'באיזה צבע הציפור?'), [T('Yellow', 'צהוב'), T('Red', 'אדום'), T('White', 'לבן')], 0),
      tf(T('The birds sing every night.', 'הציפורים שרות כל לילה.'), false),
    ]),

  story('bs-red-balloon', 1, ['colors', 'park', 'weather', 'family'],
    title('The Red Balloon', 'הבלון האדום', 'Le ballon rouge', 'El globo rojo'),
    [
      s('Mia has a red balloon.', 'למיה יש בלון אדום.', 'Mia a un ballon rouge.', 'Mía tiene un globo rojo.'),
      s('The balloon is very big.', 'הבלון גדול מאוד.', 'Le ballon est très grand.', 'El globo es muy grande.'),
      s('Mia walks in the park.', 'מיה מטיילת בפארק.', 'Mia se promène dans le parc.', 'Mía camina en el parque.'),
      s('The wind is strong.', 'הרוח חזקה.', 'Le vent est fort.', 'El viento es fuerte.'),
      s('The balloon flies away.', 'הבלון עף.', 'Le ballon s’envole.', 'El globo se va volando.'),
      s('Mia is sad.', 'מיה עצובה.', 'Mia est triste.', 'Mía está triste.'),
      s('Her father buys a new balloon.', 'אבא שלה קונה בלון חדש.', 'Son père achète un nouveau ballon.', 'Su papá compra un globo nuevo.'),
    ],
    [
      mc(T('What color is the balloon?', 'באיזה צבע הבלון?'), [T('Red', 'אדום'), T('Blue', 'כחול'), T('Yellow', 'צהוב')], 0),
      mc(T('Why does the balloon fly away?', 'למה הבלון עף?'), [T('The wind', 'הרוח'), T('A dog', 'כלב'), T('The rain', 'הגשם')], 0),
      tf(T('Her father buys a new balloon.', 'אבא שלה קונה בלון חדש.'), true),
    ]),

  story('bs-rabbit-garden', 1, ['animals', 'vegetables', 'house', 'verbs'],
    title('The Rabbit in the Garden', 'הארנב בגינה', 'Le lapin dans le jardin', 'El conejo en el jardín'),
    [
      s('There is a rabbit in the garden.', 'יש ארנב בגינה.', 'Il y a un lapin dans le jardin.', 'Hay un conejo en el jardín.'),
      s('The rabbit is white and small.', 'הארנב לבן וקטן.', 'Le lapin est blanc et petit.', 'El conejo es blanco y pequeño.'),
      s('The rabbit likes carrots.', 'הארנב אוהב גזר.', 'Le lapin aime les carottes.', 'Al conejo le gustan las zanahorias.'),
      s('The garden has many vegetables.', 'בגינה יש הרבה ירקות.', 'Le jardin a beaucoup de légumes.', 'El jardín tiene muchas verduras.'),
      s('The rabbit eats a carrot.', 'הארנב אוכל גזר.', 'Le lapin mange une carotte.', 'El conejo come una zanahoria.'),
      s('The farmer sees the rabbit.', 'החקלאי רואה את הארנב.', 'Le fermier voit le lapin.', 'El granjero ve al conejo.'),
      s('The rabbit runs away fast.', 'הארנב בורח מהר.', 'Le lapin s’enfuit vite.', 'El conejo se escapa rápido.'),
    ],
    [
      mc(T('What does the rabbit like?', 'מה הארנב אוהב?'), [T('Carrots', 'גזר'), T('Apples', 'תפוחים'), T('Bread', 'לחם')], 0),
      mc(T('What color is the rabbit?', 'באיזה צבע הארנב?'), [T('Brown', 'חום'), T('White', 'לבן'), T('Black', 'שחור')], 1),
      tf(T('The rabbit is big.', 'הארנב גדול.'), false),
    ]),

  story('bs-the-park', 1, ['park', 'family', 'weather', 'animals'],
    title('The Park', 'הפארק', 'Le parc', 'El parque'),
    [
      s('Today it is sunny.', 'היום שמשי.', 'Aujourd’hui il fait soleil.', 'Hoy hace sol.'),
      s('The family goes to the park.', 'המשפחה הולכת לפארק.', 'La famille va au parc.', 'La familia va al parque.'),
      s('The children play with a ball.', 'הילדים משחקים בכדור.', 'Les enfants jouent avec un ballon.', 'Los niños juegan con una pelota.'),
      s('The mother reads a book.', 'אמא קוראת ספר.', 'La mère lit un livre.', 'La mamá lee un libro.'),
      s('The father eats an apple.', 'אבא אוכל תפוח.', 'Le père mange une pomme.', 'El papá come una manzana.'),
      s('They see a dog and a bird.', 'הם רואים כלב וציפור.', 'Ils voient un chien et un oiseau.', 'Ven un perro y un pájaro.'),
      s('The day is beautiful.', 'היום יפה.', 'La journée est belle.', 'El día es hermoso.'),
    ],
    [
      mc(T('What is the weather?', 'מה מזג האוויר?'), [T('Rainy', 'גשום'), T('Sunny', 'שמשי'), T('Cold', 'קר')], 1),
      tf(T('The mother reads a book.', 'אמא קוראת ספר.'), true),
      mc(T('What does the father eat?', 'מה אבא אוכל?'), [T('An apple', 'תפוח'), T('Bread', 'לחם'), T('A banana', 'בננה')], 0),
    ]),

  // ── Level 2 (A1+, 10–20 sentences) ────────────────────────────────────────
  story('bs-the-market', 2, ['market', 'fruit', 'vegetables', 'numbers', 'shopping', 'food'],
    title('The Market', 'השוק', 'Le marché', 'El mercado'),
    [
      s('On Saturday, Ana goes to the market.', 'בשבת, אנה הולכת לשוק.', 'Le samedi, Ana va au marché.', 'El sábado, Ana va al mercado.'),
      s('The market is big and full of people.', 'השוק גדול ומלא אנשים.', 'Le marché est grand et plein de monde.', 'El mercado es grande y está lleno de gente.'),
      s('Ana wants fruit and vegetables.', 'אנה רוצה פירות וירקות.', 'Ana veut des fruits et des légumes.', 'Ana quiere frutas y verduras.'),
      s('She buys three apples.', 'היא קונה שלושה תפוחים.', 'Elle achète trois pommes.', 'Ella compra tres manzanas.'),
      s('She buys two bananas.', 'היא קונה שתי בננות.', 'Elle achète deux bananes.', 'Ella compra dos plátanos.'),
      s('The tomatoes are red and fresh.', 'העגבניות אדומות וטריות.', 'Les tomates sont rouges et fraîches.', 'Los tomates están rojos y frescos.'),
      s('Ana buys some bread too.', 'אנה קונה גם לחם.', 'Ana achète aussi du pain.', 'Ana compra pan también.'),
      s('"How much is it?" she asks.', '"כמה זה עולה?" היא שואלת.', '« C’est combien ? » demande-t-elle.', '"¿Cuánto es?", pregunta ella.'),
      s('"Ten euros," says the man.', '"עשרה יורו," אומר האיש.', '« Dix euros », dit l’homme.', '"Diez euros", dice el hombre.'),
      s('Ana pays with money.', 'אנה משלמת בכסף.', 'Ana paie avec de l’argent.', 'Ana paga con dinero.'),
      s('She puts everything in a bag.', 'היא שמה הכל בשקית.', 'Elle met tout dans un sac.', 'Ella pone todo en una bolsa.'),
      s('Ana goes home happy.', 'אנה חוזרת הביתה מרוצה.', 'Ana rentre à la maison contente.', 'Ana regresa a casa contenta.'),
    ],
    [
      mc(T('How many apples does Ana buy?', 'כמה תפוחים אנה קונה?'), [T('Two', 'שניים'), T('Three', 'שלושה'), T('Ten', 'עשרה')], 1),
      tf(T('Ana buys fish.', 'אנה קונה דגים.'), false),
      mc(T('Where does Ana go?', 'לאן אנה הולכת?'), [T('The market', 'השוק'), T('The park', 'הפארק'), T('The farm', 'החווה')], 0),
      mc(T('How much does Ana pay?', 'כמה אנה משלמת?'), [T('Ten euros', 'עשרה יורו'), T('Two euros', 'שני יורו'), T('Three euros', 'שלושה יורו')], 0),
    ]),

  story('bs-the-farm', 2, ['animals', 'numbers', 'colors', 'family', 'food'],
    title('The Farm', 'החווה', 'La ferme', 'La granja'),
    [
      s('Grandfather has a farm.', 'לסבא יש חווה.', 'Grand-père a une ferme.', 'El abuelo tiene una granja.'),
      s('The farm is in the country.', 'החווה בכפר.', 'La ferme est à la campagne.', 'La granja está en el campo.'),
      s('There are many animals.', 'יש הרבה חיות.', 'Il y a beaucoup d’animaux.', 'Hay muchos animales.'),
      s('There are four cows.', 'יש ארבע פרות.', 'Il y a quatre vaches.', 'Hay cuatro vacas.'),
      s('The cows are big and brown.', 'הפרות גדולות וחומות.', 'Les vaches sont grandes et marron.', 'Las vacas son grandes y marrones.'),
      s('There are six chickens.', 'יש שש תרנגולות.', 'Il y a six poules.', 'Hay seis gallinas.'),
      s('The chickens give eggs.', 'התרנגולות נותנות ביצים.', 'Les poules donnent des œufs.', 'Las gallinas dan huevos.'),
      s('There is a horse too.', 'יש גם סוס.', 'Il y a aussi un cheval.', 'Hay también un caballo.'),
      s('The horse is black and fast.', 'הסוס שחור ומהיר.', 'Le cheval est noir et rapide.', 'El caballo es negro y rápido.'),
      s('In the morning, grandfather feeds the animals.', 'בבוקר, סבא מאכיל את החיות.', 'Le matin, grand-père nourrit les animaux.', 'En la mañana, el abuelo alimenta a los animales.'),
      s('The children help him.', 'הילדים עוזרים לו.', 'Les enfants l’aident.', 'Los niños lo ayudan.'),
      s('Everyone likes the farm.', 'כולם אוהבים את החווה.', 'Tout le monde aime la ferme.', 'A todos les gusta la granja.'),
    ],
    [
      mc(T('How many cows are there?', 'כמה פרות יש?'), [T('Four', 'ארבע'), T('Six', 'שש'), T('Two', 'שתיים')], 0),
      tf(T('The horse is white.', 'הסוס לבן.'), false),
      mc(T('What do the chickens give?', 'מה התרנגולות נותנות?'), [T('Milk', 'חלב'), T('Eggs', 'ביצים'), T('Bread', 'לחם')], 1),
      mc(T('Who has a farm?', 'למי יש חווה?'), [T('The grandfather', 'סבא'), T('The father', 'אבא'), T('The girl', 'הילדה')], 0),
    ]),

  story('bs-rainy-day', 2, ['weather', 'house', 'clothing', 'food', 'verbs'],
    title('The Rainy Day', 'יום גשום', 'Le jour de pluie', 'El día de lluvia'),
    [
      s('Today it rains a lot.', 'היום יורד הרבה גשם.', 'Aujourd’hui il pleut beaucoup.', 'Hoy llueve mucho.'),
      s('The sky is grey.', 'השמיים אפורים.', 'Le ciel est gris.', 'El cielo está gris.'),
      s('Leo cannot play outside.', 'ליאו לא יכול לשחק בחוץ.', 'Leo ne peut pas jouer dehors.', 'Leo no puede jugar afuera.'),
      s('He stays at home.', 'הוא נשאר בבית.', 'Il reste à la maison.', 'Él se queda en casa.'),
      s('Leo wears a warm sweater.', 'ליאו לובש סוודר חם.', 'Leo porte un pull chaud.', 'Leo lleva un suéter caliente.'),
      s('He reads a book in his room.', 'הוא קורא ספר בחדר שלו.', 'Il lit un livre dans sa chambre.', 'Él lee un libro en su cuarto.'),
      s('His mother makes hot soup.', 'אמא שלו מכינה מרק חם.', 'Sa mère prépare une soupe chaude.', 'Su mamá prepara una sopa caliente.'),
      s('The soup is very good.', 'המרק טעים מאוד.', 'La soupe est très bonne.', 'La sopa está muy buena.'),
      s('In the afternoon, the rain stops.', 'אחר הצהריים, הגשם נפסק.', 'L’après-midi, la pluie s’arrête.', 'En la tarde, la lluvia para.'),
      s('The sun comes out.', 'השמש יוצאת.', 'Le soleil sort.', 'Sale el sol.'),
      s('Leo goes outside to play.', 'ליאו יוצא לשחק בחוץ.', 'Leo sort jouer dehors.', 'Leo sale a jugar afuera.'),
    ],
    [
      mc(T('What is the weather at the start?', 'מה מזג האוויר בהתחלה?'), [T('Sunny', 'שמשי'), T('Rainy', 'גשום'), T('Snowy', 'מושלג')], 1),
      tf(T('Leo plays outside in the morning.', 'ליאו משחק בחוץ בבוקר.'), false),
      mc(T('What does his mother make?', 'מה אמא שלו מכינה?'), [T('Soup', 'מרק'), T('Cake', 'עוגה'), T('Juice', 'מיץ')], 0),
      mc(T('What happens in the afternoon?', 'מה קורה אחר הצהריים?'), [T('It snows', 'יורד שלג'), T('The sun comes out', 'השמש יוצאת'), T('The wind is strong', 'הרוח חזקה')], 1),
    ]),

  story('bs-the-seasons', 2, ['weather', 'nature', 'colors', 'clothing', 'numbers'],
    title('The Seasons', 'העונות', 'Les saisons', 'Las estaciones'),
    [
      s('There are four seasons in the year.', 'יש ארבע עונות בשנה.', 'Il y a quatre saisons dans l’année.', 'Hay cuatro estaciones en el año.'),
      s('In spring, the flowers grow.', 'באביב, הפרחים גדלים.', 'Au printemps, les fleurs poussent.', 'En primavera, crecen las flores.'),
      s('The trees are green.', 'העצים ירוקים.', 'Les arbres sont verts.', 'Los árboles están verdes.'),
      s('In summer, it is hot.', 'בקיץ, חם.', 'En été, il fait chaud.', 'En verano, hace calor.'),
      s('The children go to the beach.', 'הילדים הולכים לחוף.', 'Les enfants vont à la plage.', 'Los niños van a la playa.'),
      s('In autumn, the leaves are yellow and brown.', 'בסתיו, העלים צהובים וחומים.', 'En automne, les feuilles sont jaunes et marron.', 'En otoño, las hojas están amarillas y marrones.'),
      s('The wind is cold.', 'הרוח קרה.', 'Le vent est froid.', 'El viento está frío.'),
      s('In winter, it is very cold.', 'בחורף, קר מאוד.', 'En hiver, il fait très froid.', 'En invierno, hace mucho frío.'),
      s('Sometimes it snows.', 'לפעמים יורד שלג.', 'Parfois il neige.', 'A veces nieva.'),
      s('The children wear warm clothes.', 'הילדים לובשים בגדים חמים.', 'Les enfants portent des vêtements chauds.', 'Los niños llevan ropa caliente.'),
      s('Every season is different.', 'כל עונה שונה.', 'Chaque saison est différente.', 'Cada estación es diferente.'),
      s('I like all the seasons.', 'אני אוהב את כל העונות.', 'J’aime toutes les saisons.', 'Me gustan todas las estaciones.'),
    ],
    [
      mc(T('How many seasons are there?', 'כמה עונות יש?'), [T('Four', 'ארבע'), T('Two', 'שתיים'), T('Three', 'שלוש')], 0),
      tf(T('In summer it is cold.', 'בקיץ קר.'), false),
      mc(T('What color are the leaves in autumn?', 'באיזה צבע העלים בסתיו?'), [T('Green', 'ירוק'), T('Yellow and brown', 'צהוב וחום'), T('Blue', 'כחול')], 1),
      mc(T('When does it snow?', 'מתי יורד שלג?'), [T('In summer', 'בקיץ'), T('In spring', 'באביב'), T('In winter', 'בחורף')], 2),
    ]),

  story('bs-my-day', 2, ['daily routines', 'verbs', 'food', 'clothing', 'transport', 'numbers'],
    title('My Day', 'היום שלי', 'Ma journée', 'Mi día'),
    [
      s('I wake up at seven.', 'אני מתעורר בשבע.', 'Je me réveille à sept heures.', 'Me despierto a las siete.'),
      s('I wash my face.', 'אני שוטף את הפנים.', 'Je me lave le visage.', 'Me lavo la cara.'),
      s('I eat breakfast with my family.', 'אני אוכל ארוחת בוקר עם המשפחה.', 'Je prends le petit-déjeuner avec ma famille.', 'Desayuno con mi familia.'),
      s('I drink milk and eat bread.', 'אני שותה חלב ואוכל לחם.', 'Je bois du lait et je mange du pain.', 'Tomo leche y como pan.'),
      s('I put on my clothes.', 'אני לובש בגדים.', 'Je mets mes vêtements.', 'Me pongo la ropa.'),
      s('I go to school by bus.', 'אני הולך לבית ספר באוטובוס.', 'Je vais à l’école en bus.', 'Voy a la escuela en autobús.'),
      s('At school I read and write.', 'בבית ספר אני קורא וכותב.', 'À l’école je lis et j’écris.', 'En la escuela leo y escribo.'),
      s('At noon I eat lunch.', 'בצהריים אני אוכל ארוחת צהריים.', 'À midi je déjeune.', 'Al mediodía almuerzo.'),
      s('In the afternoon I play with my friends.', 'אחר הצהריים אני משחק עם החברים.', 'L’après-midi je joue avec mes amis.', 'En la tarde juego con mis amigos.'),
      s('In the evening I do my homework.', 'בערב אני עושה שיעורי בית.', 'Le soir je fais mes devoirs.', 'En la noche hago mi tarea.'),
      s('I eat dinner and I am tired.', 'אני אוכל ארוחת ערב ואני עייף.', 'Je dîne et je suis fatigué.', 'Ceno y estoy cansado.'),
      s('At nine I go to sleep.', 'בתשע אני הולך לישון.', 'À neuf heures je vais dormir.', 'A las nueve me voy a dormir.'),
    ],
    [
      mc(T('What time does the child wake up?', 'באיזו שעה הילד מתעורר?'), [T('Seven', 'שבע'), T('Nine', 'תשע'), T('Noon', 'צהריים')], 0),
      tf(T('The child goes to school by car.', 'הילד נוסע לבית ספר במכונית.'), false),
      mc(T('What does the child drink?', 'מה הילד שותה?'), [T('Water', 'מים'), T('Milk', 'חלב'), T('Juice', 'מיץ')], 1),
      mc(T('When does the child go to sleep?', 'מתי הילד הולך לישון?'), [T('At seven', 'בשבע'), T('At nine', 'בתשע'), T('At noon', 'בצהריים')], 1),
    ]),

  // ── Level 3 (early A2, 20–35 sentences) — original public-domain adaptations ─
  story('bs-three-little-pigs', 3, ['animals', 'house', 'verbs', 'numbers'],
    title('The Three Little Pigs', 'שלושת החזירונים', 'Les trois petits cochons', 'Los tres cerditos'),
    [
      s('There are three little pigs.', 'יש שלושה חזירונים.', 'Il y a trois petits cochons.', 'Hay tres cerditos.'),
      s('They want to build a house.', 'הם רוצים לבנות בית.', 'Ils veulent construire une maison.', 'Quieren construir una casa.'),
      s('The first pig builds a house of straw.', 'החזירון הראשון בונה בית מקש.', 'Le premier cochon construit une maison de paille.', 'El primer cerdito construye una casa de paja.'),
      s('The straw house is fast and easy.', 'בית הקש מהיר וקל.', 'La maison de paille est rapide et facile.', 'La casa de paja es rápida y fácil.'),
      s('The second pig builds a house of wood.', 'החזירון השני בונה בית מעץ.', 'Le deuxième cochon construit une maison de bois.', 'El segundo cerdito construye una casa de madera.'),
      s('The third pig builds a house of bricks.', 'החזירון השלישי בונה בית מלבנים.', 'Le troisième cochon construit une maison de briques.', 'El tercer cerdito construye una casa de ladrillos.'),
      s('The brick house is strong.', 'בית הלבנים חזק.', 'La maison de briques est solide.', 'La casa de ladrillos es fuerte.'),
      s('A big wolf comes.', 'מגיע זאב גדול.', 'Un grand loup arrive.', 'Llega un lobo grande.'),
      s('The wolf is hungry.', 'הזאב רעב.', 'Le loup a faim.', 'El lobo tiene hambre.'),
      s('He goes to the straw house.', 'הוא הולך לבית הקש.', 'Il va à la maison de paille.', 'Va a la casa de paja.'),
      s('The wolf blows, and the house falls.', 'הזאב נושף, והבית נופל.', 'Le loup souffle, et la maison tombe.', 'El lobo sopla, y la casa se cae.'),
      s('The first pig runs to his brother.', 'החזירון הראשון רץ לאחיו.', 'Le premier cochon court chez son frère.', 'El primer cerdito corre a la casa de su hermano.'),
      s('The wolf goes to the wood house.', 'הזאב הולך לבית העץ.', 'Le loup va à la maison de bois.', 'El lobo va a la casa de madera.'),
      s('He blows again, and the house falls.', 'הוא נושף שוב, והבית נופל.', 'Il souffle encore, et la maison tombe.', 'Sopla otra vez, y la casa se cae.'),
      s('The two pigs run to the brick house.', 'שני החזירונים רצים לבית הלבנים.', 'Les deux cochons courent à la maison de briques.', 'Los dos cerditos corren a la casa de ladrillos.'),
      s('The wolf blows and blows.', 'הזאב נושף ונושף.', 'Le loup souffle et souffle.', 'El lobo sopla y sopla.'),
      s('But the brick house does not fall.', 'אבל בית הלבנים לא נופל.', 'Mais la maison de briques ne tombe pas.', 'Pero la casa de ladrillos no se cae.'),
      s('The wolf is tired and goes away.', 'הזאב עייף והולך.', 'Le loup est fatigué et s’en va.', 'El lobo está cansado y se va.'),
      s('The three pigs are safe.', 'שלושת החזירונים בטוחים.', 'Les trois cochons sont en sécurité.', 'Los tres cerditos están a salvo.'),
      s('They are happy in the strong house.', 'הם שמחים בבית החזק.', 'Ils sont contents dans la maison solide.', 'Están contentos en la casa fuerte.'),
    ],
    [
      mc(T('How many pigs are there?', 'כמה חזירונים יש?'), [T('Two', 'שניים'), T('Three', 'שלושה'), T('Four', 'ארבעה')], 1),
      tf(T('The straw house is strong.', 'בית הקש חזק.'), false),
      mc(T('Which house does not fall?', 'איזה בית לא נופל?'), [T('The straw house', 'בית הקש'), T('The wood house', 'בית העץ'), T('The brick house', 'בית הלבנים')], 2),
      mc(T('What does the wolf do to the houses?', 'מה הזאב עושה לבתים?'), [T('He blows', 'הוא נושף'), T('He eats them', 'הוא אוכל אותם'), T('He sleeps', 'הוא ישן')], 0),
    ]),

  story('bs-goldilocks', 3, ['animals', 'house', 'food', 'colors', 'numbers'],
    title('Goldilocks and the Three Bears', 'זהבה ושלושת הדובים', 'Boucle d’or et les trois ours', 'Ricitos de oro y los tres osos'),
    [
      s('A girl walks in the forest.', 'ילדה מטיילת ביער.', 'Une fille se promène dans la forêt.', 'Una niña camina en el bosque.'),
      s('She has golden hair.', 'יש לה שיער זהוב.', 'Elle a les cheveux dorés.', 'Ella tiene el pelo dorado.'),
      s('She sees a small house.', 'היא רואה בית קטן.', 'Elle voit une petite maison.', 'Ella ve una casa pequeña.'),
      s('She opens the door and goes in.', 'היא פותחת את הדלת ונכנסת.', 'Elle ouvre la porte et entre.', 'Abre la puerta y entra.'),
      s('On the table there are three bowls of soup.', 'על השולחן יש שלוש קערות מרק.', 'Sur la table il y a trois bols de soupe.', 'En la mesa hay tres tazones de sopa.'),
      s('The first soup is too hot.', 'המרק הראשון חם מדי.', 'La première soupe est trop chaude.', 'La primera sopa está muy caliente.'),
      s('The second soup is too cold.', 'המרק השני קר מדי.', 'La deuxième soupe est trop froide.', 'La segunda sopa está muy fría.'),
      s('The third soup is good, and she eats it.', 'המרק השלישי טעים, והיא אוכלת אותו.', 'La troisième soupe est bonne, et elle la mange.', 'La tercera sopa está buena, y ella se la come.'),
      s('Then she sees three chairs.', 'אחר כך היא רואה שלושה כיסאות.', 'Puis elle voit trois chaises.', 'Luego ve tres sillas.'),
      s('She sits on the small chair, and it breaks.', 'היא יושבת על הכיסא הקטן, והוא נשבר.', 'Elle s’assoit sur la petite chaise, et elle casse.', 'Se sienta en la silla pequeña, y se rompe.'),
      s('The girl is tired.', 'הילדה עייפה.', 'La fille est fatiguée.', 'La niña está cansada.'),
      s('She goes to the bedroom.', 'היא הולכת לחדר השינה.', 'Elle va à la chambre.', 'Va al dormitorio.'),
      s('There are three beds.', 'יש שלוש מיטות.', 'Il y a trois lits.', 'Hay tres camas.'),
      s('She sleeps in the small bed.', 'היא ישנה במיטה הקטנה.', 'Elle dort dans le petit lit.', 'Duerme en la cama pequeña.'),
      s('The house is the home of three bears.', 'הבית הוא ביתם של שלושה דובים.', 'La maison est la maison de trois ours.', 'La casa es el hogar de tres osos.'),
      s('The bears come home.', 'הדובים חוזרים הביתה.', 'Les ours rentrent à la maison.', 'Los osos regresan a casa.'),
      s('"Someone ate my soup!" says the baby bear.', '"מישהו אכל את המרק שלי!" אומר הדוב הקטן.', '« Quelqu’un a mangé ma soupe ! » dit le petit ours.', '"¡Alguien se comió mi sopa!", dice el osito.'),
      s('They find the girl in the bed.', 'הם מוצאים את הילדה במיטה.', 'Ils trouvent la fille dans le lit.', 'Encuentran a la niña en la cama.'),
      s('The girl wakes up and is afraid.', 'הילדה מתעוררת ומפחדת.', 'La fille se réveille et a peur.', 'La niña se despierta y tiene miedo.'),
      s('She runs out of the house and goes home.', 'היא בורחת מהבית וחוזרת הביתה.', 'Elle sort de la maison en courant et rentre chez elle.', 'Sale corriendo de la casa y regresa a su casa.'),
    ],
    [
      mc(T('What color is the girl’s hair?', 'באיזה צבע השיער של הילדה?'), [T('Golden', 'זהוב'), T('Black', 'שחור'), T('Red', 'אדום')], 0),
      tf(T('The first soup is too cold.', 'המרק הראשון קר מדי.'), false),
      mc(T('How many bears live in the house?', 'כמה דובים גרים בבית?'), [T('Two', 'שניים'), T('Three', 'שלושה'), T('Four', 'ארבעה')], 1),
      mc(T('What does the girl do at the end?', 'מה הילדה עושה בסוף?'), [T('She sleeps', 'היא ישנה'), T('She runs home', 'היא בורחת הביתה'), T('She eats', 'היא אוכלת')], 1),
    ]),
];

export const BEGINNER_STORIES: ReadingCollection = {
  id: CID,
  title: T('Beginner Stories', 'סיפורים למתחילים'),
  description: T('Short A1–A2 stories that recycle everyday words in context.', 'סיפורים קצרים ברמת A1–A2 שחוזרים על מילים יומיומיות בהקשר.'),
  emoji: '📖',
  stories: STORIES,
};
