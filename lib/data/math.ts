export type MathTopic =
  | "basics"
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "tables"
  | "fractions"
  | "decimals"
  | "lcm-hcf"
  | "algebra"
  | "quadratic"
  | "geometry"
  | "videos";

export type QuizMode = "practice" | "test";

export type MathQuestion = {
  id: string;
  topic: MathTopic;
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
};

export type CustomQuestion = {
  id: string;
  topic: MathTopic;
  prompt: string;
  answer: string;
};

const TOPICS: MathTopic[] = [
  "basics",
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "tables",
  "fractions",
  "decimals",
  "lcm-hcf",
  "algebra",
  "quadratic",
  "geometry",
  "videos",
];

export function isMathTopic(value: string): value is MathTopic {
  return TOPICS.includes(value as MathTopic);
}

export function isQuizMode(value: string): value is QuizMode {
  return value === "practice" || value === "test";
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function lcm(a: number, b: number) {
  return Math.abs(a * b) / gcd(a, b);
}

function intOptions(answer: number, floor = 0) {
  const values = new Set<string>([String(answer)]);
  const deltas = [1, -1, 2, -2, 3, -3, 4, 5, -4, 10, -5, 6];
  for (const delta of deltas) {
    const next = answer + delta;
    if (next >= floor && next !== answer) values.add(String(next));
    if (values.size === 4) break;
  }
  let extra = 1;
  while (values.size < 4) {
    values.add(String(answer + 7 + extra));
    extra += 1;
  }
  return shuffle([...values]);
}

function decimalOptions(answer: string) {
  const value = Number(answer);
  const values = new Set<string>([answer]);
  for (const delta of [0.1, -0.1, 0.2, 0.3, -0.2, 0.4]) {
    const next = (value + delta).toFixed(1);
    if (next !== answer && Number(next) >= 0) values.add(next);
    if (values.size === 4) break;
  }
  return shuffle([...values]);
}

function fractionOptions(answer: string) {
  const [num, den] = answer.split("/").map(Number);
  const values = new Set<string>([answer]);
  for (const delta of [1, -1, 2, -2, 3]) {
    const nextNum = num + delta;
    if (nextNum > 0) values.add(`${nextNum}/${den}`);
    if (values.size === 4) break;
  }
  return shuffle([...values]);
}

function makeQuestion(
  topic: MathTopic,
  prompt: string,
  answer: string,
  options: string[],
  explanation: string,
): MathQuestion {
  return {
    id: `${topic}-${prompt}-${answer}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    prompt,
    answer,
    options,
    explanation,
  };
}

function basicsQuestion(classLevel: number): MathQuestion {
  if (classLevel <= 1 && Math.random() > 0.45) {
    const left = rand(1, 20);
    const right = rand(1, 20);
    const greater = Math.max(left, right);
    return makeQuestion(
      "basics",
      `Which number is greater: ${left} or ${right}?`,
      String(greater),
      intOptions(greater),
      `${greater} is greater.`,
    );
  }
  const base = rand(classLevel <= 2 ? 1 : 10, classLevel <= 2 ? 50 : 200);
  const after = base + 1;
  return makeQuestion(
    "basics",
    `What number comes just after ${base}?`,
    String(after),
    intOptions(after),
    `The next counting number is ${after}.`,
  );
}

function additionQuestion(classLevel: number): MathQuestion {
  const span = classLevel <= 1 ? 9 : classLevel <= 3 ? 40 : 200;
  const a = rand(1, span);
  const b = rand(1, span);
  const answer = a + b;
  return makeQuestion(
    "addition",
    `${a} + ${b} = ?`,
    String(answer),
    intOptions(answer),
    `${a} + ${b} = ${answer}.`,
  );
}

function subtractionQuestion(classLevel: number): MathQuestion {
  const span = classLevel <= 1 ? 12 : classLevel <= 3 ? 60 : 300;
  let a = rand(2, span);
  let b = rand(1, span);
  if (b > a) [a, b] = [b, a];
  const answer = a - b;
  return makeQuestion(
    "subtraction",
    `${a} − ${b} = ?`,
    String(answer),
    intOptions(answer),
    `${a} − ${b} = ${answer}.`,
  );
}

function multiplicationQuestion(classLevel: number): MathQuestion {
  const a = rand(2, classLevel >= 4 ? 12 : 10);
  const b = classLevel >= 4 ? rand(2, 20) : rand(2, 10);
  const answer = a * b;
  return makeQuestion(
    "multiplication",
    `${a} × ${b} = ?`,
    String(answer),
    intOptions(answer),
    `${a} × ${b} = ${answer}.`,
  );
}

function divisionQuestion(): MathQuestion {
  const divisor = rand(2, 12);
  const quotient = rand(2, 12);
  const dividend = divisor * quotient;
  return makeQuestion(
    "division",
    `${dividend} ÷ ${divisor} = ?`,
    String(quotient),
    intOptions(quotient),
    `${divisor} × ${quotient} = ${dividend}, so the quotient is ${quotient}.`,
  );
}

function fractionQuestion(classLevel: number): MathQuestion {
  if (classLevel >= 7 && Math.random() > 0.55) {
    const den = rand(2, 8);
    const factor = rand(2, 4);
    const num = den * factor;
    const answer = `${factor}/1`;
    const simplified = factor === 1 ? "1/1" : `${factor}/1`;
    return makeQuestion(
      "fractions",
      `Simplify ${num}/${den}.`,
      simplified,
      shuffle([answer, `${num}/${den}`, `${factor + 1}/1`, `${Math.max(1, factor - 1)}/1`]),
      `${num}/${den} = ${factor}.`,
    );
  }
  const den = rand(2, 9);
  const n1 = rand(1, den - 1);
  const n2 = rand(1, den - 1);
  const answer = `${n1 + n2}/${den}`;
  return makeQuestion(
    "fractions",
    `${n1}/${den} + ${n2}/${den} = ?`,
    answer,
    fractionOptions(answer),
    `Same denominator: add the numerators. ${n1} + ${n2} = ${n1 + n2}.`,
  );
}

function decimalQuestion(classLevel: number): MathQuestion {
  const a = (rand(1, classLevel >= 6 ? 90 : 40) / 10).toFixed(1);
  const b = (rand(1, 30) / 10).toFixed(1);
  if (classLevel >= 6 && Math.random() > 0.5) {
    const whole = rand(2, 9);
    const answer = (Number(a) * whole).toFixed(1);
    return makeQuestion(
      "decimals",
      `${a} × ${whole} = ?`,
      answer,
      decimalOptions(answer),
      `${a} × ${whole} = ${answer}.`,
    );
  }
  const answer = (Number(a) + Number(b)).toFixed(1);
  return makeQuestion(
    "decimals",
    `${a} + ${b} = ?`,
    answer,
    decimalOptions(answer),
    `Line up the decimal points. ${a} + ${b} = ${answer}.`,
  );
}

function lcmHcfQuestion(): MathQuestion {
  const a = rand(4, 18);
  const b = rand(4, 18);
  if (Math.random() > 0.5) {
    const answer = lcm(a, b);
    return makeQuestion(
      "lcm-hcf",
      `LCM of ${a} and ${b} = ?`,
      String(answer),
      intOptions(answer),
      `The least common multiple of ${a} and ${b} is ${answer}.`,
    );
  }
  const answer = gcd(a, b);
  return makeQuestion(
    "lcm-hcf",
    `HCF of ${a} and ${b} = ?`,
    String(answer),
    intOptions(answer, 1),
    `The highest common factor of ${a} and ${b} is ${answer}.`,
  );
}

function algebraQuestion(classLevel: number): MathQuestion {
  const x = rand(2, classLevel >= 9 ? 12 : 9);
  const coeff = rand(2, 6);
  const constant = rand(1, 12);
  const total = coeff * x + constant;
  return makeQuestion(
    "algebra",
    `${coeff}x + ${constant} = ${total}. x = ?`,
    String(x),
    intOptions(x),
    `Subtract ${constant}, then divide by ${coeff}. x = ${x}.`,
  );
}

function quadraticQuestion(): MathQuestion {
  const r1 = rand(1, 6);
  const r2 = rand(r1, 8);
  const sum = r1 + r2;
  const product = r1 * r2;
  return makeQuestion(
    "quadratic",
    `Smaller root of x² − ${sum}x + ${product} = 0`,
    String(r1),
    intOptions(r1),
    `The roots are ${r1} and ${r2}. The smaller root is ${r1}.`,
  );
}

function geometryQuestion(classLevel: number): MathQuestion {
  if (classLevel >= 10 && Math.random() > 0.66) {
    return makeQuestion(
      "geometry",
      "sin 30° equals ?",
      "1/2",
      shuffle(["1/2", "√3/2", "1", "0"]),
      "In the standard trigonometric ratios, sin 30° = 1/2.",
    );
  }
  if (classLevel >= 10 && Math.random() > 0.45) {
    const radius = 7;
    return makeQuestion(
      "geometry",
      "A circle has radius 7 cm. Circumference using π = 22/7 is ? cm",
      "44",
      intOptions(44),
      "C = 2πr = 2 × 22/7 × 7 = 44 cm.",
    );
  }
  if (classLevel >= 9 && Math.random() > 0.5) {
    return makeQuestion(
      "geometry",
      "A right triangle has legs 6 cm and 8 cm. Hypotenuse = ? cm",
      "10",
      intOptions(10),
      "By Pythagoras, √(6² + 8²) = √100 = 10.",
    );
  }
  const a = rand(30, 70);
  const b = rand(30, 80);
  const third = 180 - a - b;
  if (third <= 10) return geometryQuestion(classLevel);
  return makeQuestion(
    "geometry",
    `Two angles of a triangle are ${a}° and ${b}°. The third angle is ?°`,
    String(third),
    intOptions(third),
    `Angles of a triangle sum to 180°. 180 − ${a} − ${b} = ${third}.`,
  );
}

function generateOne(topic: MathTopic, classLevel: number): MathQuestion {
  switch (topic) {
    case "basics":
      return basicsQuestion(classLevel);
    case "addition":
      return additionQuestion(classLevel);
    case "subtraction":
      return subtractionQuestion(classLevel);
    case "multiplication":
    case "tables":
      return multiplicationQuestion(classLevel);
    case "division":
      return divisionQuestion();
    case "fractions":
      return fractionQuestion(classLevel);
    case "decimals":
      return decimalQuestion(classLevel);
    case "lcm-hcf":
      return lcmHcfQuestion();
    case "algebra":
      return algebraQuestion(classLevel);
    case "quadratic":
      return quadraticQuestion();
    case "geometry":
      return geometryQuestion(classLevel);
    default:
      return additionQuestion(classLevel);
  }
}

function fromCustom(item: CustomQuestion): MathQuestion {
  const numeric = Number(item.answer);
  const options = Number.isFinite(numeric)
    ? intOptions(numeric)
    : shuffle([item.answer, `${item.answer} ·`, "0", "1"]);
  if (!options.includes(item.answer)) options[0] = item.answer;
  return {
    id: item.id,
    topic: item.topic,
    prompt: item.prompt,
    answer: item.answer,
    options: shuffle(options),
    explanation: `The answer is ${item.answer}.`,
  };
}

export function buildQuiz(
  topic: MathTopic,
  classLevel: number,
  count = 10,
  custom: CustomQuestion[] = [],
) {
  const safeClass = Math.min(10, Math.max(1, classLevel));
  const extras = custom.filter((item) => item.topic === topic).slice(0, 3).map(fromCustom);
  const generated: MathQuestion[] = [];
  const guard = count * 6;
  let spins = 0;
  while (generated.length + extras.length < count && spins < guard) {
    generated.push(generateOne(topic, safeClass));
    spins += 1;
  }
  return shuffle([...extras, ...generated]).slice(0, count);
}

export type TopicMeta = {
  key: MathTopic;
  title: string;
  hindi: string;
  summary: string;
  classes: string;
  accent: string;
};

export const TOPIC_META: Record<MathTopic, TopicMeta> = {
  basics: {
    key: "basics",
    title: "Number Sense",
    hindi: "संख्या ज्ञान",
    summary: "Counting, comparison, and the number that comes next. Balbharati Class 1–2 foundation.",
    classes: "Classes 1–2",
    accent: "from-cyan-400 to-sky-500",
  },
  addition: {
    key: "addition",
    title: "Addition",
    hindi: "जोड",
    summary: "Joining quantities, from single digits to larger whole numbers.",
    classes: "Classes 1–4",
    accent: "from-emerald-400 to-teal-500",
  },
  subtraction: {
    key: "subtraction",
    title: "Subtraction",
    hindi: "वजाबाकी",
    summary: "Finding what remains, without negative answers in the primary years.",
    classes: "Classes 1–4",
    accent: "from-amber-400 to-orange-500",
  },
  multiplication: {
    key: "multiplication",
    title: "Multiplication",
    hindi: "गुणाकार",
    summary: "Repeated addition and table facts used across the primary syllabus.",
    classes: "Classes 3–5",
    accent: "from-fuchsia-400 to-pink-500",
  },
  division: {
    key: "division",
    title: "Division",
    hindi: "भागाकार",
    summary: "Exact division as the inverse of multiplication.",
    classes: "Classes 3–5",
    accent: "from-violet-400 to-indigo-500",
  },
  tables: {
    key: "tables",
    title: "Tables (पहाड़े)",
    hindi: "पहाड़े",
    summary: "Multiplication tables from 2 to 20, read aloud in Hindi.",
    classes: "Classes 2–5",
    accent: "from-lime-400 to-emerald-500",
  },
  fractions: {
    key: "fractions",
    title: "Fractions",
    hindi: "अपूर्णांक",
    summary: "Equal parts, like fractions, and simplification aligned with Classes 5–7.",
    classes: "Classes 5–7",
    accent: "from-pink-400 to-rose-500",
  },
  decimals: {
    key: "decimals",
    title: "Decimals",
    hindi: "दशांश",
    summary: "Tenths, addition, and decimal multiplication from the upper primary syllabus.",
    classes: "Classes 5–7",
    accent: "from-sky-400 to-cyan-500",
  },
  "lcm-hcf": {
    key: "lcm-hcf",
    title: "LCM & HCF",
    hindi: "ल.सा.वि. व म.सा.वि.",
    summary: "Lowest common multiple and highest common factor for Classes 6–7.",
    classes: "Classes 6–7",
    accent: "from-yellow-300 to-amber-500",
  },
  algebra: {
    key: "algebra",
    title: "Algebra",
    hindi: "बीजगणित",
    summary: "Linear equations in one variable, as introduced from Class 8 and strengthened in Class 9.",
    classes: "Classes 8–9",
    accent: "from-purple-400 to-fuchsia-500",
  },
  quadratic: {
    key: "quadratic",
    title: "Quadratic Equations",
    hindi: "वर्गसमीकरणे",
    summary: "Roots of monic quadratics from the Maharashtra SSC Class 10 algebra paper.",
    classes: "Class 10",
    accent: "from-rose-400 to-orange-400",
  },
  geometry: {
    key: "geometry",
    title: "Geometry",
    hindi: "भूमिती",
    summary: "Triangle angles, Pythagoras, circles, and the Class 10 sine ratio.",
    classes: "Classes 8–10",
    accent: "from-teal-300 to-emerald-500",
  },
  videos: {
    key: "videos",
    title: "Video Lessons",
    hindi: "धडे",
    summary: "Short lessons for fractions and decimals.",
    classes: "Classes 5–7",
    accent: "from-red-400 to-pink-500",
  },
};

export function defaultTopicForClass(classLevel: number): MathTopic {
  if (classLevel <= 1) return "addition";
  if (classLevel === 2) return "subtraction";
  if (classLevel === 3) return "multiplication";
  if (classLevel === 4) return "division";
  if (classLevel === 5) return "decimals";
  if (classLevel === 6) return "lcm-hcf";
  if (classLevel === 7) return "fractions";
  if (classLevel === 8) return "algebra";
  if (classLevel === 9) return "geometry";
  return "quadratic";
}

export const VIDEOS = [
  {
    id: "fractions",
    title: "Fractions & Decimals",
    caption: "Class 7 style visual lesson",
    embed: "https://www.youtube.com/embed/UPAJc7xypjE",
  },
  {
    id: "decimals",
    title: "Decimals for Kids",
    caption: "Place value and tenths",
    embed: "https://www.youtube.com/embed/LFO07qWWtrs",
  },
];
