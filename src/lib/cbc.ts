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

export function getCbcSubjects(grade: number) {
  return grade <= 3 ? CBC_LOWER_PRIMARY : CBC_UPPER_PRIMARY;
}

export const GRADE_NAMES: Record<number, string> = {
  1: "Grade 1",
  2: "Grade 2",
  3: "Grade 3",
  4: "Grade 4",
  5: "Grade 5",
  6: "Grade 6",
};
