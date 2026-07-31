export const CBC_LOWER_PRIMARY = [
  { id: "literacy", name: "Literacy", icon: "📖" },
  { id: "indigenous-language", name: "Indigenous Language", icon: "🗣️" },
  { id: "kiswahili", name: "Kiswahili / KSL", icon: "🇰🇪" },
  { id: "english", name: "English", icon: "🔤" },
  { id: "mathematics", name: "Mathematical Activities", icon: "🔢" },
  { id: "environmental", name: "Environmental Activities", icon: "🌍" },
  { id: "religious-education", name: "Religious Education", icon: "✝️" },
  { id: "creative-activities", name: "Movement & Creative Activities", icon: "🎨" },
];

export const CBC_UPPER_PRIMARY = [
  { id: "english", name: "English", icon: "🔤" },
  { id: "kiswahili", name: "Kiswahili / KSL", icon: "🇰🇪" },
  { id: "mathematics", name: "Mathematics", icon: "🔢" },
  { id: "science-technology", name: "Science & Technology", icon: "🔬" },
  { id: "social-studies", name: "Social Studies", icon: "📜" },
  { id: "agriculture-nutrition", name: "Agriculture & Nutrition", icon: "🌱" },
  { id: "religious-education", name: "Religious Education", icon: "✝️" },
  { id: "creative-arts", name: "Creative Arts", icon: "🎨" },
  { id: "physical-health", name: "Physical & Health Education", icon: "🏃" },
  { id: "home-science", name: "Home Science", icon: "🏠" },
];

export const CBC_JUNIOR_SECONDARY = [
  { id: "english", name: "English", icon: "🔤" },
  { id: "kiswahili", name: "Kiswahili", icon: "🇰🇪" },
  { id: "mathematics", name: "Mathematics", icon: "🔢" },
  { id: "integrated-science", name: "Integrated Science", icon: "🔬" },
  { id: "social-studies", name: "Social Studies", icon: "📜" },
  { id: "agriculture", name: "Agriculture & Nutrition", icon: "🌱" },
  { id: "religious-education", name: "Religious Education", icon: "✝️" },
  { id: "creative-arts", name: "Creative Arts", icon: "🎨" },
  { id: "physical-health", name: "Physical & Health Education", icon: "🏃" },
  { id: "computer-science", name: "Computer Studies", icon: "💻" },
  { id: "pre-technical", name: "Pre-Technical Education", icon: "⚙️" },
  { id: "foreign-languages", name: "Foreign Languages", icon: "🌍" },
];

export const CBC_SENIOR_SECONDARY = [
  { id: "english", name: "English", icon: "🔤" },
  { id: "kiswahili", name: "Kiswahili", icon: "🇰🇪" },
  { id: "mathematics", name: "Mathematics", icon: "🔢" },
  { id: "physics", name: "Physics", icon: "⚛️" },
  { id: "chemistry", name: "Chemistry", icon: "🧪" },
  { id: "biology", name: "Biology", icon: "🧬" },
  { id: "geography", name: "Geography", icon: "🗺️" },
  { id: "history", name: "History & Government", icon: "📜" },
  { id: "agriculture", name: "Agriculture", icon: "🌱" },
  { id: "computer-science", name: "Computer Studies", icon: "💻" },
  { id: "business-studies", name: "Business Studies", icon: "📊" },
  { id: "home-science", name: "Home Science", icon: "🏠" },
];

export function getCbcSubjects(grade: number) {
  if (grade <= 3) return CBC_LOWER_PRIMARY;
  if (grade <= 6) return CBC_UPPER_PRIMARY;
  if (grade <= 9) return CBC_JUNIOR_SECONDARY;
  return CBC_SENIOR_SECONDARY;
}

export const GRADE_NAMES: Record<number, string> = {
  1: "Grade 1 (Lower Primary)",
  2: "Grade 2 (Lower Primary)",
  3: "Grade 3 (Lower Primary)",
  4: "Grade 4 (Upper Primary)",
  5: "Grade 5 (Upper Primary)",
  6: "Grade 6 (Upper Primary — KPSEA)",
  7: "Grade 7 (Junior Secondary)",
  8: "Grade 8 (Junior Secondary)",
  9: "Grade 9 (Junior Secondary — National Assessment)",
  10: "Grade 10 (Senior Secondary)",
  11: "Grade 11 (Senior Secondary)",
  12: "Grade 12 (Senior Secondary — KCSE)",
};

export const GRADE_LEVELS: Record<number, string> = {
  1: "Lower Primary", 2: "Lower Primary", 3: "Lower Primary",
  4: "Upper Primary", 5: "Upper Primary", 6: "Upper Primary",
  7: "Junior Secondary", 8: "Junior Secondary", 9: "Junior Secondary",
  10: "Senior Secondary", 11: "Senior Secondary", 12: "Senior Secondary",
};
