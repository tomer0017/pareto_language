/**
 * French pilot realizations — the first production French Core subset (~200 highest-value concepts).
 *
 * Keyed by the language-INDEPENDENT concept slug (see the English corpus rows). The pilot pack build
 * (`build-core.ts`) merges `w` onto the matching corpus row as its `fr` realization and emits
 * `core-fr.v1.json`; nothing here touches the English data files, so the English pack is unaffected.
 *
 * Register: neutral-polite traveler French (**vous**). Surface forms are the bare citation form (no
 * article), matching how the English pack stores words — clean for TTS and for the emoji games. The
 * grammatical `g` (gender / number) is carried for the review report and future article display; it
 * is NOT emitted into the pack yet (the pack schema has no gender field).
 *
 * HONESTY: every form below is AI-drafted / research-plausible and **pending native review**. The
 * pack marks the language a `pilot` (curated subset), never a completed 500-concept language.
 */

/** Gender / number for the review report. m/f nouns; pl-suffixed = plural-dominant. */
export type FrGender = 'm' | 'f' | 'mpl' | 'fpl';

export interface FrEntry {
  /** French surface (citation form, no article). */
  w: string;
  /** Grammatical gender/number (nouns only). */
  g?: FrGender;
  /** Review note: ambiguity, elision, register, or a chosen-among-variants decision. */
  note?: string;
}

export const FR_PILOT: Record<string, FrEntry> = {
  // ── Survival: emergency · health · safety ───────────────────────────────────
  help: { w: 'aider', note: 'verb "to help"; the cry "Help!" is the separate reply help.call.' },
  'help.call': { w: 'Au secours !', note: 'fixed emergency cry; softer variant "À l’aide !".' },
  toilet: { w: 'toilettes', g: 'fpl', note: 'almost always plural: "les toilettes"; sign "WC".' },
  passport: { w: 'passeport', g: 'm' },
  lost: { w: 'perdu', note: 'state: "je suis perdu" (I am lost); agrees perdue (f).' },
  doctor: { w: 'médecin', g: 'm', note: 'grammatically m even for a woman; address form "docteur".' },
  police: { w: 'police', g: 'f' },
  allergy: { w: 'allergie', g: 'f', note: 'elides: "l’allergie".' },
  hospital: { w: 'hôpital', g: 'm', note: 'elides: "l’hôpital".' },
  pharmacy: { w: 'pharmacie', g: 'f' },
  careful: { w: 'attention', note: 'warning "Attention !" (heard/said); adj sense = "prudent".' },
  emergency: { w: 'urgence', g: 'f', note: 'hospital ER = "les urgences".' },
  ambulance: { w: 'ambulance', g: 'f' },
  danger: { w: 'danger', g: 'm' },
  dangerous: { w: 'dangereux', note: 'f: dangereuse.' },
  fire: { w: 'feu', g: 'm', note: 'the cry is "Au feu !".' },
  safe: { w: 'en sécurité', note: 'feeling safe; "sûr" = safe/reliable of a thing.' },
  stolen: { w: 'volé', note: '"On m’a volé…" = my … was stolen.' },
  accident: { w: 'accident', g: 'm' },
  embassy: { w: 'ambassade', g: 'f' },
  fever: { w: 'fièvre', g: 'f', note: '"j’ai de la fièvre".' },
  medicine: { w: 'médicament', g: 'm' },
  pain: { w: 'douleur', g: 'f', note: '"j’ai mal" is the more common spoken frame.' },
  sick: { w: 'malade', note: 'invariable in gender.' },
  blood: { w: 'sang', g: 'm' },
  heart: { w: 'cœur', g: 'm' },
  broken: { w: 'cassé', note: 'f: cassée; "en panne" for a machine that stopped working.' },

  // ── Never-freeze glue + replies ─────────────────────────────────────────────
  yes: { w: 'oui' },
  no: { w: 'non' },
  please: { w: 's’il vous plaît', note: 'vous default; informal "s’il te plaît".' },
  okay: { w: 'd’accord' },
  hello: { w: 'bonjour', note: 'evening "bonsoir".' },
  goodbye: { w: 'au revoir' },
  maybe: { w: 'peut-être' },
  enough: { w: 'assez', note: '"ça suffit" to say "that’s enough".' },
  'here-you-go': { w: 'Voilà.' },
  'excuse-me': { w: 'Excusez-moi.' },
  'i-dont-know': { w: 'Je ne sais pas.' },
  'sounds-good': { w: 'Ça marche.', note: 'natural agreement; also "Ça me va."' },
  'no-worries': { w: 'Pas de souci.' },
  'thats-fine': { w: 'C’est bon.' },
  'no-problem': { w: 'Pas de problème.' },
  'never-mind': { w: 'Laissez tomber.', note: '"Ce n’est pas grave" = it’s not serious.' },
  'im-not-sure': { w: 'Je ne suis pas sûr.', note: 'f: sûre.' },
  'thats-all': { w: 'C’est tout.' },
  'one-more': { w: 'Encore un, s’il vous plaît.' },
  'just-looking': { w: 'Je regarde seulement.', note: 'shop; also "Je regarde, merci."' },
  'to-go': { w: 'À emporter, s’il vous plaît.' },

  // ── Pronouns ────────────────────────────────────────────────────────────────
  this: { w: 'ça', note: 'spoken pointing form; formal "ceci".' },
  i: { w: 'je' },
  you: { w: 'vous', note: 'polite default; informal singular "tu".' },
  we: { w: 'nous', note: 'spoken "on" is very common.' },
  my: { w: 'mon', note: 'mon/ma/mes by gender+number: "ma", "mes".' },

  // ── Questions ───────────────────────────────────────────────────────────────
  how: { w: 'comment' },
  where: { w: 'où' },
  when: { w: 'quand' },
  what: { w: 'quoi', note: '"quoi ?" spoken; "qu’est-ce que" in full questions.' },
  which: { w: 'quel', note: 'quel/quelle/quels/quelles by agreement.' },
  'what-time': { w: 'Quelle heure ?', note: '"Il est quelle heure ?" in full.' },
  'how-many': { w: 'Combien ?' },
  'how-long': { w: 'Combien de temps ?' },

  // ── Numbers ─────────────────────────────────────────────────────────────────
  one: { w: 'un' }, two: { w: 'deux' }, three: { w: 'trois' }, four: { w: 'quatre' },
  five: { w: 'cinq' }, six: { w: 'six' }, seven: { w: 'sept' }, eight: { w: 'huit' },
  nine: { w: 'neuf' }, ten: { w: 'dix' }, eleven: { w: 'onze' }, twelve: { w: 'douze' },
  twenty: { w: 'vingt' }, fifty: { w: 'cinquante' }, hundred: { w: 'cent' },
  half: { w: 'demi', note: 'noun "moitié"; "une demi-heure" = half an hour.' },

  // ── Time ────────────────────────────────────────────────────────────────────
  now: { w: 'maintenant' },
  today: { w: 'aujourd’hui' },
  tomorrow: { w: 'demain' },
  later: { w: 'plus tard' },
  night: { w: 'nuit', g: 'f' },
  day: { w: 'jour', g: 'm' },
  hour: { w: 'heure', g: 'f' },
  minute: { w: 'minute', g: 'f' },
  time: { w: 'temps', g: 'm', note: 'clock time = "l’heure".' },
  morning: { w: 'matin', g: 'm' },
  evening: { w: 'soir', g: 'm' },
  late: { w: 'en retard', note: 'delayed; "il est tard" = it is late (hour).' },

  // ── Food & drink ────────────────────────────────────────────────────────────
  water: { w: 'eau', g: 'f', note: 'elides: "l’eau"; ordering "de l’eau".' },
  coffee: { w: 'café', g: 'm' },
  bill: { w: 'addition', g: 'f', note: 'restaurant bill = "l’addition".' },
  menu: { w: 'menu', g: 'm', note: '"la carte" = the à-la-carte list; "le menu" = set menu.' },
  breakfast: { w: 'petit-déjeuner', g: 'm' },
  meat: { w: 'viande', g: 'f' },
  milk: { w: 'lait', g: 'm' },
  chicken: { w: 'poulet', g: 'm' },
  fish: { w: 'poisson', g: 'm' },

  // ── Places ──────────────────────────────────────────────────────────────────
  hotel: { w: 'hôtel', g: 'm', note: 'elides: "l’hôtel".' },
  exit: { w: 'sortie', g: 'f' },
  entrance: { w: 'entrée', g: 'f' },
  airport: { w: 'aéroport', g: 'm' },
  reception: { w: 'réception', g: 'f' },
  center: { w: 'centre', g: 'm', note: 'city centre = "le centre-ville".' },
  street: { w: 'rue', g: 'f' },
  station: { w: 'gare', g: 'f', note: 'train station = "gare"; metro stop = "station".' },

  // ── Transport ───────────────────────────────────────────────────────────────
  bus: { w: 'bus', g: 'm' },
  train: { w: 'train', g: 'm' },
  taxi: { w: 'taxi', g: 'm' },
  gate: { w: 'porte', g: 'f', note: 'boarding gate = "porte" (d’embarquement).' },
  plane: { w: 'avion', g: 'm', note: 'elides: "l’avion".' },
  car: { w: 'voiture', g: 'f' },
  metro: { w: 'métro', g: 'm' },
  flight: { w: 'vol', g: 'm' },
  seat: { w: 'place', g: 'f', note: 'reserved seat; "siège" = the physical seat.' },
  'bus-stop': { w: 'arrêt de bus', g: 'm' },
  platform: { w: 'quai', g: 'm' },
  luggage: { w: 'bagages', g: 'mpl' },
  arrival: { w: 'arrivée', g: 'f' },
  departure: { w: 'départ', g: 'm' },
  suitcase: { w: 'valise', g: 'f' },

  // ── Money & shopping ────────────────────────────────────────────────────────
  price: { w: 'prix', g: 'm' },
  cash: { w: 'espèces', g: 'fpl', note: 'also "en liquide".' },
  atm: { w: 'distributeur', g: 'm', note: '"distributeur (automatique)".' },
  euro: { w: 'euro', g: 'm' },
  dollar: { w: 'dollar', g: 'm' },
  receipt: { w: 'reçu', g: 'm' },
  size: { w: 'taille', g: 'f', note: 'shoe size = "pointure".' },

  // ── Objects ─────────────────────────────────────────────────────────────────
  card: { w: 'carte', g: 'f', note: 'bank card = "carte bancaire".' },
  money: { w: 'argent', g: 'm', note: 'elides: "l’argent".' },
  ticket: { w: 'billet', g: 'm', note: 'metro/bus paper ticket also "ticket".' },
  phone: { w: 'téléphone', g: 'm', note: 'mobile = "portable".' },
  map: { w: 'plan', g: 'm', note: 'city map = "un plan"; road map/menu-card = "carte".' },
  bag: { w: 'sac', g: 'm' },
  key: { w: 'clé', g: 'f' },

  // ── Home / room ─────────────────────────────────────────────────────────────
  room: { w: 'chambre', g: 'f', note: 'hotel room; "salle" = a room/hall generally.' },
  table: { w: 'table', g: 'f' },
  bed: { w: 'lit', g: 'm' },
  shower: { w: 'douche', g: 'f' },
  bathroom: { w: 'salle de bain', g: 'f' },
  floor: { w: 'étage', g: 'm', note: 'storey; ground floor = "rez-de-chaussée".' },

  // ── Technology ──────────────────────────────────────────────────────────────
  wifi: { w: 'wifi', g: 'm' },
  password: { w: 'mot de passe', g: 'm' },
  internet: { w: 'internet', g: 'm' },

  // ── People ──────────────────────────────────────────────────────────────────
  name: { w: 'nom', g: 'm', note: 'first name = "prénom".' },

  // ── Directions ──────────────────────────────────────────────────────────────
  left: { w: 'gauche', note: 'travel usage "à gauche".' },
  right: { w: 'droite', note: 'travel usage "à droite".' },
  near: { w: 'près', note: '"près d’ici" = near here.' },
  far: { w: 'loin' },

  // ── Descriptions ────────────────────────────────────────────────────────────
  next: { w: 'prochain', note: 'f: prochaine.' },
  open: { w: 'ouvert', note: 'f: ouverte.' },
  closed: { w: 'fermé', note: 'f: fermée.' },
  good: { w: 'bon', note: 'f: bonne.' },
  hot: { w: 'chaud', note: 'f: chaude.' },
  cold: { w: 'froid', note: 'f: froide.' },
  cheap: { w: 'pas cher', note: 'literary "bon marché".' },
  free: { w: 'gratuit', note: 'free of charge; f: gratuite.' },
  last: { w: 'dernier', note: 'f: dernière.' },
  expensive: { w: 'cher', note: 'f: chère.' },
  bad: { w: 'mauvais', note: 'f: mauvaise.' },
  slow: { w: 'lent', note: 'f: lente; "lentement" = slowly.' },
  full: { w: 'plein', note: 'restaurant/hotel full = "complet".' },
  ready: { w: 'prêt', note: 'f: prête.' },
  dirty: { w: 'sale' },
  spicy: { w: 'épicé', note: 'also "piquant".' },
  important: { w: 'important', note: 'f: importante.' },
  together: { w: 'ensemble' },
  hungry: { w: 'faim', note: 'used as "avoir faim": "j’ai faim".' },

  // ── Actions (verbs, infinitive) ─────────────────────────────────────────────
  stop: { w: 'arrêter', note: 'command "Arrêtez !".' },
  lose: { w: 'perdre' },
  want: { w: 'vouloir', note: 'polite request "je voudrais" = I would like.' },
  need: { w: 'avoir besoin', note: '"j’ai besoin de…".' },
  have: { w: 'avoir' },
  go: { w: 'aller' },
  speak: { w: 'parler' },
  pay: { w: 'payer' },
  understand: { w: 'comprendre', note: '"je ne comprends pas" = I don’t understand.' },
  eat: { w: 'manger' },
  order: { w: 'commander' },
  wait: { w: 'attendre' },
  show: { w: 'montrer' },
  turn: { w: 'tourner' },
  take: { w: 'prendre' },
  buy: { w: 'acheter' },
  come: { w: 'venir' },
  call: { w: 'appeler' },
  find: { w: 'trouver' },
  leave: { w: 'partir', note: 'depart; "laisser" = leave something behind.' },
  book: { w: 'réserver' },
  arrive: { w: 'arriver' },
  drink: { w: 'boire' },
  know: { w: 'savoir', note: 'know a fact; "connaître" = know a person/place.' },
  give: { w: 'donner' },
  work: { w: 'marcher', note: 'to function ("ça marche"); job = "travailler".' },
  cancel: { w: 'annuler' },
  fly: { w: 'voler', note: 'also "prendre l’avion".' },
  rent: { w: 'louer' },
  exchange: { w: 'changer', note: 'change money = "changer de l’argent".' },
  forget: { w: 'oublier' },
  break: { w: 'casser' },
};
