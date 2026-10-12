import type { MathTopic } from "@/lib/data/math";

export type ClassPlan = {
  classLevel: number;
  title: string;
  stage: string;
  board: string;
  outcomes: string[];
  topics: MathTopic[];
};

export const CLASS_PLANS: ClassPlan[] = [
  {
    classLevel: 1,
    title: "First steps with numbers",
    stage: "Primary",
    board: "Balbharati Class 1 · numbers to 99, comparison, addition and subtraction within a small range, shapes.",
    outcomes: ["Count and compare", "Add within 20", "Subtract without borrowing stress", "Name simple shapes"],
    topics: ["basics", "addition", "subtraction"],
  },
  {
    classLevel: 2,
    title: "Bigger counts, same operations",
    stage: "Primary",
    board: "Balbharati Class 2 · numbers to 999, addition and subtraction, introduction to multiplication.",
    outcomes: ["Add and subtract 2-digit numbers", "Hear the first tables", "Read time and money language"],
    topics: ["addition", "subtraction", "tables", "multiplication"],
  },
  {
    classLevel: 3,
    title: "Tables and sharing",
    stage: "Primary",
    board: "Balbharati Class 3 · multiplication tables, division, and the first idea of a fraction.",
    outcomes: ["Recall tables 2–10", "Divide exactly", "See half and quarter"],
    topics: ["multiplication", "tables", "division", "fractions"],
  },
  {
    classLevel: 4,
    title: "All four operations",
    stage: "Primary",
    board: "Balbharati Class 4 · larger numbers, four operations, fractions, and geometry introduction.",
    outcomes: ["Multiply by a 1-digit number", "Divide exactly", "Use a fraction of a whole"],
    topics: ["multiplication", "division", "fractions", "geometry"],
  },
  {
    classLevel: 5,
    title: "Parts and tenths",
    stage: "Upper primary",
    board: "Balbharati Class 5 · factors and multiples, fractions, decimals, perimeter and area language.",
    outcomes: ["Add like fractions", "Add tenths", "Spot factors"],
    topics: ["fractions", "decimals", "multiplication", "division"],
  },
  {
    classLevel: 6,
    title: "HCF, LCM, and decimals",
    stage: "Upper primary",
    board: "Balbharati Class 6 · integers, HCF and LCM, fractions and decimals, introduction to variables.",
    outcomes: ["Find HCF and LCM", "Operate on decimals", "Read a simple variable"],
    topics: ["lcm-hcf", "fractions", "decimals", "algebra"],
  },
  {
    classLevel: 7,
    title: "Rational numbers in motion",
    stage: "Upper primary",
    board: "Balbharati Class 7 · rational numbers, fraction operations, algebraic expressions, triangles.",
    outcomes: ["Simplify fractions", "Add decimals", "Find a missing triangle angle"],
    topics: ["fractions", "decimals", "lcm-hcf", "geometry"],
  },
  {
    classLevel: 8,
    title: "Expressions and equations",
    stage: "Secondary",
    board: "Balbharati Class 8 · algebraic identities, linear equations, quadrilaterals and mensuration.",
    outcomes: ["Solve a linear equation", "Use angle sums", "Keep expressions balanced"],
    topics: ["algebra", "geometry", "multiplication"],
  },
  {
    classLevel: 9,
    title: "Polynomials and figures",
    stage: "SSC foundation",
    board: "Maharashtra Class 9 · polynomials, linear equations, triangles, and coordinate ideas.",
    outcomes: ["Solve linear equations", "Use Pythagoras", "Read a geometric statement"],
    topics: ["algebra", "geometry", "lcm-hcf"],
  },
  {
    classLevel: 10,
    title: "SSC board algebra and geometry",
    stage: "SSC",
    board: "Maharashtra Class 10 · quadratic equations, arithmetic progressions context, circles, and trigonometry ratios.",
    outcomes: ["Find a quadratic root", "Use circumference", "Recall sin 30°"],
    topics: ["quadratic", "algebra", "geometry"],
  },
];

export function planFor(classLevel: number) {
  return CLASS_PLANS.find((plan) => plan.classLevel === classLevel);
}
