export type SubjectKey = "english" | "hindi" | "urdu";
export type LetterCount = 2 | 3 | 4;

export type WordItem = {
  id: string;
  word: string;
  meaning: string;
  rhyme: string;
  hindiPron: string;
  subject: SubjectKey;
  letters: LetterCount;
};

type Syllable = { hi: string; ur: string; pron: string };

const BLOCKED = new Set(["ass", "sex", "die", "gun", "hell", "damn", "piss", "shit", "fuck", "kill"]);

const ENGLISH_MEANINGS: Record<string, string> = {
  am: "I am",
  an: "one",
  as: "while",
  at: "place",
  be: "exist",
  by: "near",
  do: "act",
  go: "move",
  he: "boy",
  if: "condition",
  in: "inside",
  is: "exists",
  it: "thing",
  me: "myself",
  my: "mine",
  no: "not",
  of: "belonging",
  on: "above",
  or: "choice",
  so: "therefore",
  to: "toward",
  up: "higher",
  us: "we",
  we: "us",
  cat: "billi",
  bat: "balla",
  hat: "topi",
  mat: "chatai",
  sat: "baitha",
  rat: "chuha",
  fat: "mota",
  pat: "thapthapana",
  map: "naksha",
  cap: "topi",
  nap: "jhapki",
  tap: "nal",
  pen: "kalam",
  hen: "murgi",
  ten: "das",
  men: "aadmi",
  den: "gufa",
  sun: "suraj",
  run: "daudna",
  fun: "maza",
  bun: "pav",
  hop: "kudna",
  mop: "pocha",
  top: "upar",
  cop: "police",
  pop: "awaaz",
  cake: "kek",
  lake: "jheel",
  make: "banana",
  bake: "sekna",
  rake: "panja",
  take: "lena",
  wake: "jagna",
  sake: "khushi",
  name: "naam",
  game: "khel",
  same: "ek jaisa",
  date: "tareekh",
  gate: "darwaza",
  late: "der",
  rate: "dar",
  bell: "ghanti",
  well: "kuaan",
  tell: "batana",
  nest: "ghonsla",
  best: "sabse accha",
  rest: "aaram",
  test: "pariksha",
  west: "paschim",
  pink: "gulabi",
  sink: "chowk",
  wink: "aankh maarna",
  bank: "kinara",
  tank: "tanki",
  rank: "darja",
  jump: "kood",
  bump: "thokar",
  dump: "phenkna",
  pump: "pamp",
  lock: "tala",
  rock: "chattan",
  sock: "moza",
  dock: "ghat",
  mail: "daak",
  nail: "keel",
  sail: "pal",
  tail: "poochh",
  rain: "baarish",
  pain: "dard",
  main: "mukhya",
  boat: "nav",
  coat: "coat",
  goat: "bakri",
};

const HINDI_MEANINGS: Record<string, string> = {
  अब: "now",
  कब: "when",
  जब: "when",
  तब: "then",
  सब: "all",
  कल: "tomorrow / yesterday",
  जल: "water",
  नल: "tap",
  पल: "moment",
  बल: "strength",
  कर: "do / hand",
  डर: "fear",
  नर: "human",
  पर: "on / but",
  मर: "die (root)",
  सर: "head",
  धन: "wealth",
  मन: "mind",
  तन: "body",
  वन: "forest",
  जन: "people",
  दिन: "day",
  गिन: "count",
  बिन: "without",
  सुन: "listen",
  चुन: "choose",
  अगर: "if",
  मगर: "but",
  नगर: "town",
  डगर: "path",
  सफर: "journey",
  कमल: "lotus",
  अमल: "deed",
  नमक: "salt",
  चमक: "shine",
  दमक: "glow",
  पहल: "initiative",
  टहल: "stroll",
  महल: "palace",
  चहल: "bustle",
  कहर: "wrath",
  पवन: "wind",
  हवन: "havan",
  भवन: "building",
  नयन: "eye",
  शयन: "rest",
  कगार: "edge",
  आगार: "home",
  दरबार: "court",
  परिवार: "family",
  बाजार: "market",
  इंतजार: "wait",
};

const ONSETS: Syllable[] = [
  { hi: "अ", ur: "ا", pron: "अ" },
  { hi: "क", ur: "ک", pron: "क" },
  { hi: "ख", ur: "خ", pron: "ख" },
  { hi: "ग", ur: "گ", pron: "ग" },
  { hi: "च", ur: "چ", pron: "च" },
  { hi: "ज", ur: "ج", pron: "ज" },
  { hi: "ट", ur: "ٹ", pron: "ट" },
  { hi: "त", ur: "ت", pron: "त" },
  { hi: "द", ur: "د", pron: "द" },
  { hi: "न", ur: "ن", pron: "न" },
  { hi: "प", ur: "پ", pron: "प" },
  { hi: "फ", ur: "ف", pron: "फ" },
  { hi: "ब", ur: "ب", pron: "ब" },
  { hi: "भ", ur: "بھ", pron: "भ" },
  { hi: "म", ur: "م", pron: "म" },
  { hi: "य", ur: "ی", pron: "य" },
  { hi: "र", ur: "ر", pron: "र" },
  { hi: "ल", ur: "ل", pron: "ल" },
  { hi: "व", ur: "و", pron: "व" },
  { hi: "स", ur: "س", pron: "स" },
  { hi: "ह", ur: "ہ", pron: "ह" },
  { hi: "श", ur: "ش", pron: "श" },
];

const RIMES_2: Syllable[] = [
  { hi: "ब", ur: "ب", pron: "ब" },
  { hi: "ल", ur: "ل", pron: "ल" },
  { hi: "र", ur: "ر", pron: "र" },
  { hi: "न", ur: "ن", pron: "न" },
  { hi: "म", ur: "م", pron: "म" },
  { hi: "स", ur: "س", pron: "स" },
  { hi: "ट", ur: "ٹ", pron: "ट" },
  { hi: "प", ur: "پ", pron: "प" },
  { hi: "क", ur: "ک", pron: "क" },
  { hi: "ज", ur: "ج", pron: "ज" },
  { hi: "ग", ur: "گ", pron: "ग" },
  { hi: "द", ur: "د", pron: "द" },
];

const RIMES_3: Syllable[] = [
  { hi: "गर", ur: "گر", pron: "गर" },
  { hi: "मल", ur: "مل", pron: "मल" },
  { hi: "लक", ur: "لک", pron: "लक" },
  { hi: "हल", ur: "ہل", pron: "हल" },
  { hi: "वन", ur: "ون", pron: "वन" },
  { hi: "हर", ur: "ہر", pron: "हर" },
  { hi: "मन", ur: "من", pron: "मन" },
  { hi: "दल", ur: "دل", pron: "दल" },
  { hi: "सर", ur: "سر", pron: "सर" },
  { hi: "तल", ur: "تل", pron: "तल" },
  { hi: "नर", ur: "نر", pron: "नर" },
  { hi: "फल", ur: "پھل", pron: "फल" },
];

const RIMES_4: Syllable[] = [
  { hi: "गार", ur: "گار", pron: "गार" },
  { hi: "मार", ur: "مار", pron: "मार" },
  { hi: "सार", ur: "سار", pron: "सार" },
  { hi: "दार", ur: "دار", pron: "दार" },
  { hi: "तार", ur: "تار", pron: "तार" },
  { hi: "नार", ur: "نار", pron: "नार" },
  { hi: "पार", ur: "پار", pron: "पार" },
  { hi: "बार", ur: "بار", pron: "बार" },
  { hi: "लार", ur: "لار", pron: "लार" },
  { hi: "हार", ur: "ہار", pron: "हार" },
  { hi: "कार", ur: "کار", pron: "कार" },
  { hi: "चार", ur: "چار", pron: "चार" },
];

const VOWELS = ["a", "e", "i", "o", "u"];
const CONSONANTS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "y", "z"];

const ENGLISH_FAMILIES: Record<LetterCount, { rime: string; onsets: string[] }[]> = {
  2: [
    ...CONSONANTS.map((rime) => ({ rime, onsets: VOWELS })),
    ...VOWELS.map((rime) => ({ rime, onsets: CONSONANTS })),
  ],
  3: [
    { rime: "at", onsets: ["b", "c", "f", "h", "m", "p", "r", "s", "v", "b", "n", "t"] },
    { rime: "an", onsets: ["c", "f", "m", "p", "r", "t", "v", "b", "d", "n"] },
    { rime: "ap", onsets: ["c", "g", "l", "m", "n", "t", "z", "s"] },
    { rime: "ag", onsets: ["b", "g", "l", "r", "s", "t", "w", "z"] },
    { rime: "am", onsets: ["h", "j", "r", "y", "d", "p"] },
    { rime: "et", onsets: ["b", "g", "j", "l", "m", "n", "p", "s", "v", "w"] },
    { rime: "en", onsets: ["d", "h", "m", "p", "t", "b", "k"] },
    { rime: "ed", onsets: ["b", "f", "l", "r", "w", "n"] },
    { rime: "it", onsets: ["b", "f", "h", "k", "l", "p", "s", "w"] },
    { rime: "in", onsets: ["b", "f", "p", "s", "t", "w", "d"] },
    { rime: "ip", onsets: ["d", "h", "l", "n", "r", "s", "t", "z"] },
    { rime: "ot", onsets: ["c", "d", "g", "h", "l", "n", "p", "r"] },
    { rime: "op", onsets: ["c", "h", "m", "p", "t", "b"] },
    { rime: "og", onsets: ["d", "f", "h", "j", "l", "b"] },
    { rime: "un", onsets: ["b", "f", "g", "n", "p", "r", "s"] },
    { rime: "ut", onsets: ["b", "c", "g", "h", "n", "r"] },
    { rime: "ug", onsets: ["b", "d", "h", "j", "m", "r", "t"] },
  ],
  4: [
    { rime: "ake", onsets: ["b", "c", "f", "l", "m", "r", "t", "w", "s", "d", "h", "n", "p", "j"] },
    { rime: "ame", onsets: ["c", "d", "f", "g", "l", "n", "s", "t", "b", "p"] },
    { rime: "ate", onsets: ["d", "f", "g", "h", "l", "m", "r", "s", "b", "p"] },
    { rime: "ell", onsets: ["b", "c", "d", "f", "s", "t", "w", "y"] },
    { rime: "est", onsets: ["b", "n", "r", "t", "w", "z", "p", "v"] },
    { rime: "ink", onsets: ["l", "m", "p", "r", "s", "w", "d", "f"] },
    { rime: "ank", onsets: ["b", "r", "s", "t", "d", "l", "p", "y"] },
    { rime: "ump", onsets: ["b", "d", "j", "l", "p", "h", "c"] },
    { rime: "ock", onsets: ["d", "l", "r", "s", "m", "c", "b"] },
    { rime: "ail", onsets: ["m", "n", "p", "r", "s", "t", "b", "f"] },
    { rime: "ain", onsets: ["m", "p", "r", "g", "b", "l", "v"] },
    { rime: "oat", onsets: ["b", "c", "g", "m"] },
    { rime: "ent", onsets: ["b", "d", "l", "r", "s", "t", "w"] },
    { rime: "old", onsets: ["b", "c", "f", "g", "h", "m", "s", "t"] },
    { rime: "ing", onsets: ["k", "r", "s", "w", "d", "p"] },
  ],
};

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function buildEnglish(letters: LetterCount): WordItem[] {
  const seen = new Set<string>();
  const items: WordItem[] = [];
  for (const family of ENGLISH_FAMILIES[letters]) {
    for (const onset of family.onsets) {
      const raw = `${onset}${family.rime}`.toLowerCase();
      if (raw.length !== letters || seen.has(raw) || BLOCKED.has(raw)) continue;
      seen.add(raw);
      items.push({
        id: `english-${letters}-${raw}`,
        word: titleCase(raw),
        meaning: ENGLISH_MEANINGS[raw] ?? `Rhyme family “-${family.rime}”`,
        rhyme: `-${family.rime}`,
        hindiPron: titleCase(raw),
        subject: "english",
        letters,
      });
    }
  }
  return items.slice(0, 120);
}

function rimesFor(letters: LetterCount) {
  if (letters === 2) return RIMES_2;
  if (letters === 3) return RIMES_3;
  return RIMES_4;
}

function buildIndic(subject: "hindi" | "urdu", letters: LetterCount): WordItem[] {
  const items: WordItem[] = [];
  const seen = new Set<string>();
  for (const rime of rimesFor(letters)) {
    for (const onset of ONSETS) {
      if (onset.hi === rime.hi) continue;
      const hi = onset.hi + rime.hi;
      const ur = onset.ur + rime.ur;
      const pron = onset.pron + rime.pron;
      const word = subject === "hindi" ? hi : ur;
      if (seen.has(word)) continue;
      seen.add(word);
      const known = HINDI_MEANINGS[hi];
      items.push({
        id: `${subject}-${letters}-${pron}`,
        word,
        meaning: known ?? `Rhyme · ${rime.pron}`,
        rhyme: `-${rime.pron}`,
        hindiPron: pron,
        subject,
        letters,
      });
    }
  }
  const featuredOrder = Object.keys(HINDI_MEANINGS);
  items.sort((a, b) => {
    const aRank = featuredOrder.indexOf(a.hindiPron);
    const bRank = featuredOrder.indexOf(b.hindiPron);
    if (aRank === -1 && bRank === -1) return 0;
    if (aRank === -1) return 1;
    if (bRank === -1) return -1;
    return aRank - bRank;
  });
  return items.slice(0, 120);
}

const CACHE = new Map<string, WordItem[]>();

export function catalog(subject: SubjectKey, letters: LetterCount) {
  const key = `${subject}-${letters}`;
  const cached = CACHE.get(key);
  if (cached) return cached;
  const built = subject === "english" ? buildEnglish(letters) : buildIndic(subject, letters);
  CACHE.set(key, built);
  return built;
}

export function wordsFor(
  subject: SubjectKey,
  letters: LetterCount,
  custom: { id: string; subject: SubjectKey; letters: LetterCount; word: string; meaning: string; hindiPron: string }[] = [],
) {
  const extras: WordItem[] = custom
    .filter((item) => item.subject === subject && item.letters === letters)
    .map((item) => ({
      id: item.id,
      word: item.word,
      meaning: item.meaning,
      rhyme: "Custom",
      hindiPron: item.hindiPron || item.word,
      subject,
      letters,
    }));
  const seen = new Set(extras.map((item) => item.word));
  return [...extras, ...catalog(subject, letters).filter((item) => !seen.has(item.word))];
}

export function catalogSize() {
  const subjects: SubjectKey[] = ["english", "hindi", "urdu"];
  const lengths: LetterCount[] = [2, 3, 4];
  return subjects.flatMap((subject) =>
    lengths.map((letters) => ({ subject, letters, count: catalog(subject, letters).length })),
  );
}

export const SUBJECTS: { key: SubjectKey; label: string; native: string; blurb: string; tint: string }[] = [
  {
    key: "english",
    label: "English",
    native: "A",
    blurb: "Phonics, rhyme families, and spoken vocabulary.",
    tint: "from-sky-400/30 to-blue-600/10",
  },
  {
    key: "hindi",
    label: "Hindi",
    native: "अ",
    blurb: "शब्द, तुकबंदी, और स्पष्ट उच्चारण।",
    tint: "from-orange-400/30 to-amber-600/10",
  },
  {
    key: "urdu",
    label: "Urdu",
    native: "ا",
    blurb: "الفاظ، قافیہ، اور ہندی آواز سے درست تلفظ۔",
    tint: "from-emerald-400/30 to-teal-600/10",
  },
];

export function isSubject(value: string): value is SubjectKey {
  return value === "english" || value === "hindi" || value === "urdu";
}
