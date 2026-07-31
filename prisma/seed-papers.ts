import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

interface Question {
  number: number;
  question: string;
  options?: string[];
  answer: string;
  marks: number;
}

interface Section {
  name: string;
  marks: number;
  questions: Question[];
}

interface PaperContent {
  title: string;
  grade: string;
  subject: string;
  term: string;
  assessmentType: string;
  totalMarks: number;
  sections: Section[];
}

// MCQ format: [question, correctAnswer, distractor1, distractor2, distractor3]
// Options will be shuffled during generation so correct answer lands on random A/B/C/D
const QUESTIONS: Record<string, { mcq: string[][]; short: string[]; long: string[]; shortAnswers: string[]; longAnswers: string[] }> = {
  "Literacy Activities": {
    mcq: [
      ["Which word starts with the letter M?", "Mat", "Cat", "Dog", "Sun"],
      ["What is the opposite of big?", "Small", "Tall", "Fast", "Hot"],
      ["Which sentence is correct?", "I go to school.", "I goes to school.", "I go school to.", "Go I to school."],
      ["Pick the noun: The boy kicked the ball.", "boy", "kicked", "the", "quickly"],
      ["What sound does 'ch' make in 'chair'?", "ch", "sh", "th", "ph"],
      ["Which is a vowel?", "A", "B", "C", "D"],
      ["What comes after 'tree' in: one, two, tree, ...", "four", "five", "three", "six"],
      ["Which word rhymes with 'cat'?", "bat", "cup", "dog", "pen"],
      ["What is the plural of 'box'?", "boxes", "boxs", "boxies", "boxen"],
      ["Pick the correct spelling:", "beautiful", "beutiful", "beautful", "beautifull"],
    ],
    short: [
      "Write three words that start with the letter B.",
      "What did you do yesterday? Write two sentences.",
      "Name four things you can find in a classroom.",
    ],
    shortAnswers: [
      "Any three words starting with B (e.g. boy, book, bag)",
      "Any two correct sentences about past activities",
      "Four classroom items (e.g. desk, chair, board, book)",
    ],
    long: [
      "Draw and label three types of weather you know. Explain when each type happens in Kenya.",
    ],
    longAnswers: [
      "Any three types of weather correctly drawn, labeled, and explained (sunny, rainy, windy, cloudy, etc.)",
    ],
  },
  "Environmental Activities": {
    mcq: [
      ["Which animal gives us milk?", "Cow", "Cat", "Dog", "Bird"],
      ["What do plants need to grow?", "Sunlight", "Rocks", "Sand", "Paper"],
      ["Which season has the most rain in Kenya?", "Rainy season", "Dry season", "Cold season", "Hot season"],
      ["Where do fish live?", "Water", "Land", "Sky", "Cave"],
      ["What is the color of fresh leaves?", "Green", "Red", "Blue", "Brown"],
      ["Which of these is a fruit?", "Mango", "Potato", "Onion", "Carrot"],
      ["What do we breathe in?", "Oxygen", "Carbon dioxide", "Smoke", "Dust"],
      ["Which is the largest ocean in the world?", "Pacific", "Atlantic", "Indian", "Arctic"],
      ["What is the home of a bird called?", "Nest", "Den", "Cave", "Hole"],
      ["Which body part do we use to see?", "Eyes", "Ears", "Nose", "Mouth"],
    ],
    short: [
      "Name four things that are good for our environment.",
      "Why should we not throw litter on the ground?",
      "List three jobs that people do in your community.",
    ],
    shortAnswers: [
      "Four environmentally friendly things (e.g. planting trees, recycling, cleaning, composting)",
      "Explanation about pollution, health, and keeping Kenya clean",
      "Three community jobs (e.g. teacher, doctor, farmer, shopkeeper)",
    ],
    long: [
      "Describe the life cycle of a butterfly. Include at least four stages in your answer.",
    ],
    longAnswers: [
      "Four stages: egg, caterpillar (larva), pupa (chrysalis), butterfly (adult)",
    ],
  },
  "English": {
    mcq: [
      ["Choose the correct form: She ___ to school every day.", "goes", "go", "going", "gone"],
      ["Which word is an adjective? The tall man walked slowly.", "tall", "man", "walked", "slowly"],
      ["What is the past tense of 'run'?", "ran", "runned", "running", "runs"],
      ["Pick the synonym of 'happy':", "joyful", "sad", "angry", "tired"],
      ["Which sentence is in passive voice?", "The cake was eaten by the boy.", "The boy ate the cake.", "The boy eats cake.", "The cake is delicious."],
      ["What does the prefix 'un-' mean?", "not", "again", "before", "under"],
      ["Which is a proper noun?", "Nairobi", "city", "school", "country"],
      ["Choose: The children ___ playing outside.", "are", "is", "am", "be"],
      ["What is the plural of 'child'?", "children", "childs", "childen", "childes"],
      ["Which word means the opposite of 'ancient'?", "modern", "old", "huge", "slow"],
    ],
    short: [
      "Define the following: noun, verb, adjective. Give one example of each.",
      "Write a short paragraph (4-5 sentences) about your best friend.",
      "What is the difference between 'there', 'their', and 'they're'? Give one sentence for each.",
    ],
    shortAnswers: [
      "Noun = naming word (e.g. table), Verb = action word (e.g. run), Adjective = describing word (e.g. beautiful)",
      "Any well-structured paragraph about a friend with proper grammar",
      "There = place, Their = possession, They're = they are. One correct sentence each.",
    ],
    long: [
      "Write a composition of at least 8 sentences about 'A Day I Will Never Forget'. Use proper paragraphs.",
    ],
    longAnswers: [
      "Well-structured composition with introduction, body, and conclusion. Correct grammar, punctuation, and coherent storytelling.",
    ],
  },
  "Mathematics": {
    mcq: [
      ["What is 25 + 37?", "62", "61", "63", "64"],
      ["Which number is even?", "8", "3", "7", "5"],
      ["What is half of 48?", "24", "25", "26", "12"],
      ["How many sides does a triangle have?", "3", "4", "5", "6"],
      ["What is 9 × 6?", "54", "45", "56", "48"],
      ["Which fraction is larger: 1/2 or 1/4?", "1/2", "1/4", "They are equal", "Neither"],
      ["What is 100 - 37?", "63", "67", "73", "53"],
      ["What shape is a stop sign?", "Octagon", "Hexagon", "Pentagon", "Square"],
      ["What is 15 × 4?", "60", "55", "64", "45"],
      ["What time is it if the clock hand is on 12?", "12:00", "6:00", "3:00", "9:00"],
    ],
    short: [
      "A farmer has 156 chickens. He sells 78. How many chickens does he have left? Show your working.",
      "Calculate the area of a rectangle with length 8cm and width 5cm.",
      "Write 3/4 as a decimal and as a percentage.",
    ],
    shortAnswers: [
      "156 - 78 = 78 chickens",
      "Area = 8 × 5 = 40 cm²",
      "0.75 and 75%",
    ],
    long: [
      "A school bus carries 48 students. Each student pays KES 200 for a trip to the museum. The bus costs KES 4,500. How much profit does the school make? Show all working.",
    ],
    longAnswers: [
      "Total collected = 48 × 200 = KES 9,600. Profit = 9,600 - 4,500 = KES 5,100",
    ],
  },
  "Social Studies": {
    mcq: [
      ["What is the capital of Kenya?", "Nairobi", "Mombasa", "Kisumu", "Nakuru"],
      ["Which river forms the border between Kenya and Tanzania?", "Nile", "Nzoia", "Tana", "Mara"],
      ["How many counties does Kenya have?", "47", "48", "46", "50"],
      ["Which county is Mombasa in?", "Mombasa", "Kilifi", "Kwale", "Taita Taveta"],
      ["What is the main economic activity in northern Kenya?", "Pastoralism", "Fishing", "Manufacturing", "Mining"],
      ["Who is the head of a county government?", "Governor", "President", "Senator", "MCA"],
      ["Which lake is the largest in Kenya?", "Victoria", "Turkana", "Baringo", "Naivasha"],
      ["What is the official language of Kenya?", "English and Swahili", "English only", "Kiswahili only", "Kalenjin"],
      ["Which mineral is mined in Kenyan coast?", "Salt", "Gold", "Diamond", "Copper"],
      ["What does devolution mean?", "Sharing power to counties", "Centralizing power", "Building roads", "Collecting taxes"],
    ],
    short: [
      "Name three natural resources found in Kenya.",
      "Explain why Kenya's location near the equator is beneficial.",
      "What are three roles of a Member of County Assembly (MCA)?",
    ],
    shortAnswers: [
      "Three resources (e.g. water, minerals, wildlife, forests, geothermal energy)",
      "Benefits of equatorial location (e.g. climate for agriculture, tourism, diverse ecosystems)",
      "Three MCA roles (e.g. making county laws, representing people, oversight of county executive)",
    ],
    long: [
      "Explain the importance of the Great Rift Valley to Kenya. Include at least four points in your answer.",
    ],
    longAnswers: [
      "Points include: tourism attraction, geothermal energy, fertile soils, lakes for fishing, cultural heritage, unique wildlife habitats",
    ],
  },
  "Science & Technology": {
    mcq: [
      ["What gas do plants absorb from the air?", "Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
      ["What is the boiling point of water in degrees Celsius?", "100°C", "90°C", "110°C", "80°C"],
      ["Which organ pumps blood in the body?", "Heart", "Liver", "Brain", "Lungs"],
      ["What type of energy does the sun provide?", "Light and heat", "Sound", "Chemical", "Nuclear"],
      ["Which material is a conductor of electricity?", "Copper", "Rubber", "Plastic", "Wood"],
      ["What is the process by which plants make food?", "Photosynthesis", "Respiration", "Digestion", "Fermentation"],
      ["What force keeps us on the ground?", "Gravity", "Friction", "Magnetism", "Electricity"],
      ["How many bones does an adult human have?", "206", "300", "150", "250"],
      ["Which planet is closest to the sun?", "Mercury", "Venus", "Earth", "Mars"],
      ["What is the function of roots?", "Absorb water and nutrients", "Make food", "Produce seeds", "Attract insects"],
    ],
    short: [
      "Explain the difference between renewable and non-renewable energy sources. Give two examples of each.",
      "Describe the water cycle in four steps.",
      "Why do we need to recycle materials? Give three reasons.",
    ],
    shortAnswers: [
      "Renewable = can be replaced (solar, wind); Non-renewable = will run out (coal, oil). Three reasons for recycling.",
      "Evaporation, condensation, precipitation, collection",
      "Three reasons (e.g. saves resources, reduces pollution, saves energy, reduces landfill)",
    ],
    long: [
      "Design an experiment to test whether plants need sunlight to grow. Include your hypothesis, materials, procedure, and expected results.",
    ],
    longAnswers: [
      "Hypothesis, materials list, step-by-step procedure with control and variable groups, expected results showing sunlit plant grows better",
    ],
  },
  "Integrated Science": {
    mcq: [
      ["What is the SI unit of force?", "Newton", "Joule", "Watt", "Pascal"],
      ["Which blood group is the universal donor?", "O negative", "AB positive", "A positive", "B negative"],
      ["What is the pH of pure water?", "7", "0", "14", "1"],
      ["Which gas is essential for combustion?", "Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      ["What is the main function of white blood cells?", "Fight infection", "Carry oxygen", "Clot blood", "Transport nutrients"],
      ["Which mineral is important for strong bones?", "Calcium", "Iron", "Sodium", "Potassium"],
      ["What type of wave is sound?", "Longitudinal", "Transverse", "Electromagnetic", "Mechanical"],
      ["What is the chemical formula for water?", "H2O", "CO2", "NaCl", "O2"],
      ["Which organ filters blood in the body?", "Kidneys", "Heart", "Lungs", "Brain"],
      ["What is the SI unit of electric current?", "Ampere", "Volt", "Ohm", "Watt"],
    ],
    short: [
      "Explain the difference between mass and weight. Include their units of measurement.",
      "What are the three states of matter? Give one example of each.",
      "Describe the process of human digestion from mouth to stomach.",
    ],
    shortAnswers: [
      "Mass = amount of matter (kg); Weight = force of gravity on mass (N). Three states: solid, liquid, gas with examples.",
      "Solid (ice), Liquid (water), Gas (steam)",
      "Mouth (chewing/saliva), oesophagus, stomach (acid digestion)",
    ],
    long: [
      "Explain the structure and function of the human heart. Include at least four parts and their roles.",
    ],
    longAnswers: [
      "Four parts: right atrium, right ventricle, left atrium, left ventricle. Roles of each in pumping deoxygenated and oxygenated blood.",
    ],
  },
  "Computer Studies": {
    mcq: [
      ["What does CPU stand for?", "Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"],
      ["Which device is used to input text?", "Keyboard", "Monitor", "Speaker", "Printer"],
      ["What is an example of an operating system?", "Windows", "Microsoft Word", "Google Chrome", "Excel"],
      ["Which of these is a storage device?", "Hard disk", "Monitor", "Keyboard", "Mouse"],
      ["What does RAM stand for?", "Random Access Memory", "Read Access Memory", "Run All Memory", "Random Apply Memory"],
      ["Which generation of computers uses ICs?", "Third", "First", "Second", "Fourth"],
      ["What is malware?", "Malicious software", "Male software", "Main software", "Manual software"],
      ["Which is an output device?", "Printer", "Keyboard", "Scanner", "Mouse"],
      ["What does URL stand for?", "Uniform Resource Locator", "Universal Resource Link", "Uniform Reference Locator", "Universal Resource Locator"],
      ["Which company created Windows?", "Microsoft", "Apple", "Google", "Samsung"],
    ],
    short: [
      "Explain the difference between hardware and software. Give three examples of each.",
      "What are the four main operations of a computer? Describe each.",
      "Why is it important to back up data? Give two methods of backing up data.",
    ],
    shortAnswers: [
      "Hardware = physical parts (keyboard, mouse, monitor); Software = programs (Word, Chrome, Windows). Four operations: input, process, output, storage.",
      "Input, Processing, Output, Storage with descriptions",
      "Two backup methods (USB drive, cloud storage, external hard disk) and reasons (data protection, recovery from failure)",
    ],
    long: [
      "Describe the evolution of computers from first generation to fifth generation. Include the key technology used in each generation.",
    ],
    longAnswers: [
      "1st: Vacuum tubes, 2nd: Transistors, 3rd: Integrated circuits, 4th: Microprocessors, 5th: AI and parallel processing",
    ],
  },
  "Physics": {
    mcq: [
      ["What is the SI unit of distance?", "Metre", "Kilometre", "Centimetre", "Mile"],
      ["Which law states F = ma?", "Newton's second law", "Newton's first law", "Newton's third law", "Ohm's law"],
      ["What is the speed of light approximately?", "3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
      ["What is the unit of power?", "Watt", "Joule", "Newton", "Ampere"],
      ["Which lens is used to correct short-sightedness?", "Concave", "Convex", "Biconvex", "Plano"],
      ["What is the resistance if V=12V and I=4A?", "3Ω", "48Ω", "8Ω", "16Ω"],
      ["What type of mirror is used in vehicles?", "Convex", "Concave", "Plane", "Parabolic"],
      ["What is the frequency of sound that humans can hear?", "20Hz - 20kHz", "0Hz - 10kHz", "100Hz - 100kHz", "1kHz - 1MHz"],
      ["What is the unit of electric charge?", "Coulomb", "Volt", "Ampere", "Ohm"],
      ["Which quantity is a vector?", "Force", "Speed", "Mass", "Energy"],
    ],
    short: [
      "A car accelerates from rest to 30 m/s in 6 seconds. Calculate its acceleration.",
      "Explain the difference between distance and displacement.",
      "A 60W bulb is on for 5 hours. Calculate the energy consumed in kWh.",
    ],
    shortAnswers: [
      "a = (v-u)/t = (30-0)/6 = 5 m/s²",
      "Distance = total path covered (scalar); Displacement = shortest distance from start to end (vector)",
      "E = P × t = 60/1000 × 5 = 0.3 kWh",
    ],
    long: [
      "A body of mass 10kg is pulled along a rough horizontal surface with a force of 40N at an angle of 30° to the horizontal. If the coefficient of friction is 0.3, calculate: (a) the normal reaction (b) the frictional force (c) the acceleration of the body. (Take g = 10 m/s²)",
    ],
    longAnswers: [
      "(a) N = mg - Fsin30° = 100 - 20 = 80N, (b) f = μN = 0.3 × 80 = 24N, (c) Fcos30° - f = ma → 34.64 - 24 = 10a → a = 1.064 m/s²",
    ],
  },
  "Chemistry": {
    mcq: [
      ["What is the atomic number of carbon?", "6", "12", "8", "14"],
      ["Which gas is produced when an acid reacts with a metal?", "Hydrogen", "Oxygen", "Carbon dioxide", "Nitrogen"],
      ["What is the chemical formula for sodium chloride?", "NaCl", "NaCl2", "Na2Cl", "NaOH"],
      ["Which element has the symbol Fe?", "Iron", "Fluorine", "Francium", "Fermium"],
      ["What is the pH of an acid?", "Less than 7", "Equal to 7", "Greater than 7", "Equal to 14"],
      ["Which type of bond is in NaCl?", "Ionic", "Covalent", "Metallic", "Hydrogen"],
      ["What is the molecular mass of water (H2O)?", "18", "16", "20", "12"],
      ["Which gas does a burning candle produce?", "Carbon dioxide", "Oxygen", "Hydrogen", "Nitrogen"],
      ["What is the common name for iron(III)oxide?", "Rust", "Sand", "Salt", "Sugar"],
      ["Which acid is found in vinegar?", "Acetic acid", "Citric acid", "Hydrochloric acid", "Sulphuric acid"],
    ],
    short: [
      "Write the balanced equation for the reaction between hydrochloric acid and sodium hydroxide.",
      "Explain the difference between a mixture and a compound.",
      "Describe how to test for the presence of carbon dioxide gas.",
    ],
    shortAnswers: [
      "HCl + NaOH → NaCl + H2O",
      "Mixture = can be separated physically, components retain properties; Compound = chemically combined, new properties",
      "Pass gas through limewater; if it turns milky/cloudy, it is CO2",
    ],
    long: [
      "Describe the extraction of iron from its ore in the blast furnace. Include the reactions that take place at each stage.",
    ],
    longAnswers: [
      "Iron ore + coke + limestone heated. C + O2 → CO2; CO2 + C → 2CO; Fe2O3 + 3CO → 2Fe + 3CO2; CaCO3 removes impurities as slag.",
    ],
  },
  "Biology": {
    mcq: [
      ["What is the basic unit of life?", "Cell", "Tissue", "Organ", "Atom"],
      ["Which organelle is the powerhouse of the cell?", "Mitochondria", "Nucleus", "Ribosome", "Vacuole"],
      ["What is the process of cell division called?", "Mitosis", "Osmosis", "Diffusion", "Filtration"],
      ["Which blood vessel carries blood away from the heart?", "Artery", "Vein", "Capillary", "Venules"],
      ["What is the green pigment in plants?", "Chlorophyll", "Hemoglobin", "Melanin", "Carotene"],
      ["How many chromosomes do humans have?", "46", "23", "48", "44"],
      ["Which enzyme breaks down starch?", "Amylase", "Pepsin", "Lipase", "Trypsin"],
      ["What is the function of the small intestine?", "Digestion and absorption", "Filtration", "Breathing", "Pumping blood"],
      ["Which kingdom does a mushroom belong to?", "Fungi", "Plantae", "Animalia", "Protista"],
      ["What type of reproduction involves two parents?", "Sexual", "Asexual", "Binary fission", "Budding"],
    ],
    short: [
      "Explain the difference between homologous chromosomes and sex chromosomes.",
      "Describe three adaptations of the camel for desert life.",
      "What are the differences between plant and animal cells? Give three points.",
    ],
    shortAnswers: [
      "Homologous = matching pairs carrying same genes; Sex chromosomes = determine gender (XX/XY)",
      "Three adaptations (e.g. hump stores fat, wide feet for sand, efficient water conservation)",
      "Three differences (e.g. plant cells have cell wall/chloroplasts/large vacuole)",
    ],
    long: [
      "Describe the process of photosynthesis in detail. Include the role of sunlight, water, and carbon dioxide.",
    ],
    longAnswers: [
      "6CO2 + 6H2O → C6H12O6 + 6O2. Sunlight provides energy, water from roots, CO2 from air through stomata. Chlorophyll absorbs light energy. Glucose used for growth, oxygen released.",
    ],
  },
  "Geography": {
    mcq: [
      ["What percentage of Earth's surface is covered by water?", "71%", "60%", "80%", "50%"],
      ["Which line of latitude passes through Kenya?", "Equator", "Tropic of Cancer", "Tropic of Capricorn", "Arctic Circle"],
      ["What is the study of earthquakes called?", "Seismology", "Geology", "Meteorology", "Volcanology"],
      ["Which type of rainfall is common in Kenya?", "Convectional", "Orographic", "Frontal", "Cyclonic"],
      ["What is the largest continent by area?", "Asia", "Africa", "Europe", "North America"],
      ["Which scale measures the magnitude of earthquakes?", "Richter scale", "Beaufort scale", "Mohs scale", "Celsius scale"],
      ["What is the main type of rock formed from cooled lava?", "Igneous", "Sedimentary", "Metamorphic", "Composite"],
      ["Which ocean current affects Kenya's coast?", "Somali current", "Gulf Stream", "Humboldt current", "Benguela current"],
      ["What is deforestation?", "Cutting down forests", "Planting trees", "Forest fire", "Flooding"],
      ["What is the approximate population of Kenya?", "55 million", "30 million", "70 million", "100 million"],
    ],
    short: [
      "Explain three factors that influence climate in Kenya.",
      "What are the effects of deforestation? Give three points.",
      "Describe the formation of rift valleys.",
    ],
    shortAnswers: [
      "Three factors (e.g. altitude, latitude, proximity to water, ocean currents, vegetation)",
      "Three effects (e.g. soil erosion, loss of biodiversity, climate change, flooding)",
      "Tectonic plates diverge, land subsides creating a valley with steep sides",
    ],
    long: [
      "Discuss the causes and effects of flooding in Kenya. Suggest four measures to control flooding.",
    ],
    longAnswers: [
      "Causes: heavy rainfall, deforestation, poor drainage, farming on river banks. Effects: displacement, disease, crop destruction. Measures: terracing, reforestation, drainage systems, public education.",
    ],
  },
  "History & Government": {
    mcq: [
      ["In what year did Kenya gain independence?", "1963", "1960", "1965", "1970"],
      ["Who was Kenya's first president?", "Jomo Kenyatta", "Daniel Moi", "Mwai Kibaki", "Uhuru Kenyatta"],
      ["What was the Scramble for Africa?", "European colonization", "African migration", "Gold rush", "Slave trade"],
      ["Which event led to the formation of the United Nations?", "World War II", "World War I", "Cold War", "Korean War"],
      ["What is a constitution?", "Supreme law of the land", "Government building", "Presidential speech", "Court ruling"],
      ["Which community built the Great Zimbabwe walls?", "Shona", "Zulu", "Maasai", "Kikuyu"],
      ["When was the African Union established?", "2002", "1963", "1990", "2010"],
      ["What was the Mau Mau uprising about?", "Fight for independence", "Civil war", "Religious movement", "Trade dispute"],
      ["Which Kenyan court case established rights of minorities?", "Njoya case", "Nyayo case", "Wanjiku case", "Kenyatta case"],
      ["What does devolution mean in Kenya?", "Power to counties", "Power to president", "Power to courts", "Power to parliament"],
    ],
    short: [
      "Explain three causes of the Mau Mau uprising in Kenya.",
      "What are the branches of the Kenyan government? Describe the role of each.",
      "Why is the constitution important in a democratic country?",
    ],
    shortAnswers: [
      "Three causes (e.g. land dispossession, forced labor, lack of political representation, colonial oppression)",
      "Three branches: Executive (implements laws), Legislature (makes laws), Judiciary (interprets laws)",
      "Protects rights, limits government power, provides framework for governance, ensures rule of law",
    ],
    long: [
      "Discuss the contributions of the following leaders to Kenya's independence: Jomo Kenyatta, Dedan Kimathi, and Oginga Odinga.",
    ],
    longAnswers: [
      "Kenyatta: political leadership, KANU, first president. Kimathi: Mau Mau military leadership, martyrdom. Odinga: pan-Africanism, opposition politics, fight for social justice.",
    ],
  },
  "Business Studies": {
    mcq: [
      ["What is the main goal of a business?", "Make profit", "Hire people", "Build offices", "Pay taxes"],
      ["Which document is used to record daily sales?", "Sales journal", "Balance sheet", "Income statement", "Cash flow"],
      ["What does ROI stand for?", "Return on Investment", "Rate of Income", "Revenue on Investment", "Return on Income"],
      ["Which type of business is owned by one person?", "Sole proprietorship", "Partnership", "Corporation", "Cooperative"],
      ["What is the formula for profit?", "Revenue - Costs", "Revenue + Costs", "Revenue × Costs", "Revenue / Costs"],
      ["Which bank service helps businesses pay employees?", "Salary remittance", "Overdraft", "Loan", "Mortgage"],
      ["What is a market?", "Place where buyers and sellers meet", "Shopping mall", "Supermarket", "Warehouse"],
      ["Which tax is charged on goods and services?", "VAT", "Income tax", "Payroll tax", "Property tax"],
      ["What is depreciation?", "Decrease in asset value", "Increase in value", "Same value", "Zero value"],
      ["Which document is issued when goods are returned?", "Credit note", "Debit note", "Invoice", "Receipt"],
    ],
    short: [
      "Explain the difference between fixed costs and variable costs. Give two examples of each.",
      "What are the four functions of management?",
      "Why is record keeping important for a business?",
    ],
    shortAnswers: [
      "Fixed = don't change with output (rent, insurance); Variable = change with output (raw materials, wages). Four functions: planning, organizing, leading, controlling.",
      "Planning, organizing, staffing, directing, controlling",
      "Legal requirement, track profit/loss, decision making, tax purposes, financial records",
    ],
    long: [
      "A small business in Nairobi sells handmade jewelry. They buy materials for KES 200 per piece and sell each for KES 500. Monthly rent is KES 15,000 and they employ 2 people at KES 10,000 each. How many pieces must they sell per month to break even? Show all calculations.",
    ],
    longAnswers: [
      "Fixed costs = 15,000 + 20,000 = 35,000. Contribution per unit = 500 - 200 = 300. Break-even = 35,000/300 = 116.67, so 117 pieces.",
    ],
  },
  "Agriculture": {
    mcq: [
      ["What is the meaning of 'irrigation'?", "Artificial watering of crops", "Natural rainfall", "Flooding farmland", "Draining fields"],
      ["Which crop is the main export of Kenya?", "Tea", "Wheat", "Rice", "Barley"],
      ["What is crop rotation?", "Growing different crops in sequence", "Growing same crop every season", "Planting in rows", "Using fertilizers"],
      ["Which animal is the most kept in Kenya?", "Cattle", "Sheep", "Goats", "Pigs"],
      ["What is the process of milking by machine called?", "Mechanical milking", "Hand milking", "Auto milking", "Vacuum milking"],
      ["Which pest attacks maize in Kenya?", "Fall armyworm", "Locust", "Aphid", "Tsetse fly"],
      ["What is hybridization?", "Crossing two varieties", "Planting seeds", "Harvesting crops", "Irrigating land"],
      ["Which type of farming uses minimal land?", "Intensive", "Extensive", "Subsistence", "Nomadic"],
      ["What is compost manure made from?", "Decomposed organic waste", "Chemical powder", "Animal blood", "Rock dust"],
      ["What is the main purpose of fencing a farm?", "Keep out animals", "Decoration", "Shade crops", "Mark water lines"],
    ],
    short: [
      "Explain three methods of soil conservation.",
      "What are the benefits of mixed farming?",
      "Describe the steps involved in preparing land for planting.",
    ],
    shortAnswers: [
      "Three methods (e.g. terracing, mulching, crop rotation, contour ploughing, afforestation)",
      "Benefits (e.g. income diversification, better soil fertility, risk reduction, efficient land use)",
      "Clearing, ploughing, harrowing, ridging, manuring",
    ],
    long: [
      "Discuss the challenges facing dairy farming in Kenya and suggest four ways to improve dairy production.",
    ],
    longAnswers: [
      "Challenges: disease, poor breeds, lack of feed, water shortage, poor markets. Solutions: artificial insemination, improved feeds, disease control, better marketing, cooperative societies.",
    ],
  },
  "Pre-Technical Education": {
    mcq: [
      ["Which tool is used to measure length accurately?", "Vernier caliper", "Hammer", "Pliers", "Saw"],
      ["What does ICT stand for?", "Information and Communication Technology", "Internal Computer Technology", "Integrated Circuit Technology", "Input Control Technology"],
      ["Which material is a good insulator?", "Rubber", "Copper", "Aluminium", "Iron"],
      ["What is the process of joining two pieces of metal called?", "Welding", "Cutting", "Bending", "Drilling"],
      ["Which safety device protects against electric shock?", "Fuse", "Switch", "Bulb", "Wire"],
      ["What does CAD stand for?", "Computer-Aided Design", "Computer-Aided Drawing", "Central Auto Design", "Computer Active Design"],
      ["Which geometric shape has equal sides and angles?", "Regular polygon", "Irregular shape", "Circle", "Triangle"],
      ["What is the correct way to carry a sharp tool?", "Pointing away from body", "Pointing towards body", "Upside down", "Loosely in hand"],
      ["Which process removes material from a workpiece?", "Cutting", "Joining", "Bending", "Measuring"],
      ["What is the purpose of a technical drawing?", "To communicate design ideas", "To decorate", "To calculate costs", "To paint"],
    ],
    short: [
      "List five safety rules in a workshop.",
      "Explain the difference between a first angle and third angle projection in technical drawing.",
      "What are the properties of a good design?",
    ],
    shortAnswers: [
      "Five rules (e.g. wear protective gear, no loose clothing, handle tools carefully, keep workspace clean, report accidents)",
      "First angle = object between observer and plane; Third angle = plane between observer and object",
      "Properties (e.g. functionality, aesthetics, cost-effectiveness, durability, safety, ease of maintenance)",
    ],
    long: [
      "Describe the process of creating a simple wooden joint (mortise and tenon). Include the tools needed and safety precautions.",
    ],
    longAnswers: [
      "Tools: saw, chisel, mallet, measuring tape, pencil. Steps: measure, mark, cut mortise, cut tenon, test fit, glue/screw. Safety: eye protection, secure wood, cut away from body.",
    ],
  },
  "Kiswahili": {
    mcq: [
      ["Maneno yote yanayoanza na herufi 'M' ni...", "Miti", "Nyumba", "Simu", "Kitabu"],
      ["Ung'alisha sentensi: 'Mtoto ainasoma kitabu'", "Mtoto anasoma kitabu", "Mtoto ainasoma kitabu", "Mtoto inasoma kitabu", "Mtoto anasomia kitabu"],
      ["Dhana ya 'furaha' ni nini?", "Kuwa na raha", "Kuwa na huzuni", "Kuwa na hasira", "Kuwa na uchovu"],
      ["Kiini cha sentensi hii: 'Walikuja shuleni asubuhi' ni...", "Walikuja", "Shuleni", "Asubuhi", "Wote"],
      ["Taja aina ya maneno: 'Red' ni...", "Kiatu", "Kisema", "Kihisi", "Kiitikio"],
      ["Jina la kawaida la 'Nairobi' ni...", "Jiji", "Mji", "Kijiji", "Mkoa"],
      ["Tumia neno sahihi: 'Niliona ____ yako'", "Mwenzako", "Rafiki", "Mwenzi", "Mwenyewe"],
      ["Gawanya: 24 ÷ 6 =", "4", "5", "3", "6"],
      ["Taja wingi wa 'mtoto'...", "Watoto", "Mitoto", "Vitoto", "Matoto"],
      ["Maana ya methali 'Haraka haraka haina baraka' ni...", "Subira ni ufalme", "Kazi ni furaha", "Mcheza mcheza hujikunja", "Mgeni njia"],
    ],
    short: [
      "Andika sentensi tano kwa kutumia maneno ya mwongozo: 'mtoto', 'shule', 'soma'.",
      "Taja aina tatu za maneno katika Kiswahili na toa mfano kwa kila moja.",
      "Eleza tofauti kati ya nomino na vitenzi kwa misemo miwili.",
    ],
    shortAnswers: [
      "Tano sentensi sahihi zinazotumia maneno yote matatu",
      "Nomino (mtu, vitu), Vitenzi (kusoma, kula), Viwasilishi (na, kwa, ya)",
      "Nomino = jina la mtu au kitu; Vitenzi = kitendo"
    ],
    long: [
      "Andika insha fupi ya maneno 100 kuhusu 'Siku yangu shuleni'. Taja shughuli unazofanya kila siku.",
    ],
    longAnswers: [
      "Insha iliyo na mada, maandishi sahihi, alama za ufinyu, na maneno ya kutosha."
    ],
  },
  "Religious Education": {
    mcq: [
      ["Mtu wa kwanza aliyeuwa katika Biblia ni...", "Cain", "Abel", "Adam", "Seth"],
      ["Dini kuu za Kenya ni...", "Uislamu na Ukristu", "Budha na Hindu", "Shinto na Tao", "Sikh na Jain"],
      ["Neno 'Bwana' katika Biblia linamaanisha...", "Mungu", "Mtu", "Malaika", "Shetani"],
      ["Siku ya Sabato inahusu...", "Kuabudu", "Kufanya kazi", "Kucheza", "Kulala"],
      ["Njia nyembamba katika Injili inamaanisha...", "Kufuata Mungu", "Kufuata watu", "Kufuata mali", "Kufuata anasa"],
      ["Mtume aliyefufuka baada ya kufa ni...", "Yusufu", "Daudi", "Sulaiman", "Ibrahimu"],
      ["Siri kumi za Mungu ni...", "Misingi ya imani", "Kanuni za shule", "Sheria za nchi", "Desturi za jamii"],
      ["Neno 'Injili' linamaanisha...", "Habari njema", "Habari mbaya", "Hadithi", "Uongozi"],
      ["Mtu aliyetembea na Mungu katika Biblia ni...", "Enocki", "Nuhu", "Lutu", "Abrahamu"],
      ["Kanisa ni...", "Kundi la waumini", "Jengo", "Shule", "Hospitali"],
    ],
    short: [
      "Eleza umuhimu wa Kanuni Kumi za Mungu katika maisha ya kila siku.",
      "Taja majina ya Mitume kumi na mwili wa Yesu.",
      "Andika Hadithi fupi moja kutoka Biblia na uifanyie kazi.",
    ],
    shortAnswers: [
      "Kanuni kumi ni mwongozo wa maisha: kumpenda Mungu, kumpenda jirani, n.k.",
      "Petro, Paulo, Andreas, Yakobo, Yohane, Filipo, Bartolomu, Tomasi, Mateo, Simoni, Tadeo, Yakobo wa Alphaeus",
      "Hadithi sahihi na ufunuo wa maana"
    ],
    long: [
      "Eleza umuhimu wa kusali katika maisha ya Mkristu. Taja aina tatu za kusali na mfano kwa kila moja.",
    ],
    longAnswers: [
      "Kusali ni mawasiliano na Mungu. Aina: shukrani, ombi, tambu. Mfano: kusali kabla ya kula, kusali asubuhi."
    ],
  },
  "Home Science": {
    mcq: [
      ["Nyumba nzuri ina...", "Vyumba vya kutosha", "Vioo vingi", "Mapazia mengi", "Samani za gharama"],
      ["Chakula chenye virutubishsi vingi ni...", "Mboga na matunda", "Soda", "Vitafunio", "Chips"],
      ["Njia bora ya kuhifadhi chakula ni...", "Kufungia kwenye kiozi", "Kuachilia mezani", "Kuweka jua", "Kuweka kwenye maji"],
      ["Nguo inayofaa kwa joto ni...", "Pamba", "Sweta", "Jasi", "Bezi"],
      ["Usafi wa jikoni ni muhimu kwa...", "Kuzuia ugonjwa", "Kupendeza", "Kupunguza gharama", "Kuongeza chakula"],
      ["Mavazi ya kufaa shuleni ni...", "Safi na nadhifu", "Rangi yoyote", "Ya gharama", "Mapya kila siku"],
      ["Chakula kinachopaswa kuliwa asubuhi ni...", "Wali, mboga, protein", "Soda na vitafunio", "Kahawa peke yake", "Ice cream"],
      ["Njia ya kusafisha nguo ni...", "Kufulia kwa sabuni", "Kuachilia chini", "Kuchoma", "Kutupa"],
      ["Mlango wa nyumba unafaa kuwa...", "Usalama", "Rangi nzuri", "Kubwa", "Ndogo"],
      ["Vitu muhimu kwenye jikoni ni...", "Jiko, meza, vifaa", "TV, sofa, samani", "Picha, mapazia", "Vioo, michezo"],
    ],
    short: [
      "Orodhesha vyakula vitano vinavyopaswa kuliwa kila siku kwa afya njema.",
      "Eleza hatua tatu za kusafisha jikoni baada ya kupika.",
      "Taja aina tatu za mavazi na matumizi yake.",
    ],
    shortAnswers: [
      "Wali, mboga, matunda, protini (nyama/mboga kavu), maziwa",
      "Osha vifaa, futa meza, osha sakafu",
      "Mavazi ya kila siku, mavazi ya sherehe, mavazi ya Michezo"
    ],
    long: [
      "Eleza umuhimu wa usafi wa nyumba katika kuzuia magonjwa. Taja hatua tano za kuhakikisha nyumba ni safi.",
    ],
    longAnswers: [
      "Usafi hubadilisha mazingira, huua vijidudu, huongeza afya. Hatua: osha sakafu, vifaa, tumia sabuni, pua mara kwa mara, tupa takataka."
    ],
  },
  "Physical & Health Education": {
    mcq: [
      ["Mazoezi ya mwili yanafaa kwa...", "Kuimarisha afya", "Kupunguza uzito peke yake", "Kupendeza", "Kuonyesha nguvu"],
      ["Mchezo wa kuendesha baiskeli unaimarisha...", "Miguu na moyo", "Mikono peke yake", "Kichwa", "Kutambaa"],
      ["Chakula chenye protini nyingi ni...", "Nyama na mboga kavu", "Soda", "Vitafunio", "Maji"],
      ["Vidonda vya mdomo vinaweza kuzuiwa na...", "Kunawa mdomo baada ya kula", "Kula suguri", "Kunywa soda", "Kula usiku"],
      ["Mchezo wa kikapu unaimarisha...", "Mikono na macho", "Miguu peke yake", "Kichwa", "Kutambaa"],
      ["Afya njema inahusu...", "Mwili, akili, na roho", "Mwili peke yake", "Akili peke yake", "Mali peke yake"],
      ["Maji ni muhimu kwa mwili kwa sababu...", "Huuondoa uchungu", "Huongeza uzito", "Hupunguza afya", "Husababisha magonjwa"],
      ["Mchezo wa kubeba beba unaimarisha...", "Mgongo na miguu", "Mikono peke yake", "Kichwa", "Macho"],
      ["Lengo la mazoezi ni...", "Kuimarisha afya", "Kupunguza uzito peke yake", "Kupendeza", "Kuonyesha nguvu"],
      ["Mchezaji mzuri anajali...", "Usalama na kanuni", "Kushinda peke yake", "Kuonyesha", "Kuchokoza"],
    ],
    short: [
      "Taja faida tatu za mazoezi ya mwili kwa mtoto.",
      "Eleza kanuni tano za usalama katika michezo.",
      "Andika ratiba ya mazoezi ya mwili kwa wiki moja.",
    ],
    shortAnswers: [
      "Kuimarisha afya, kupunguza magonjwa, kuboresha michezo",
      "Kuvaliwa vizuri, kutumia vifaa sahihi, kufanya mazoezi ya kuwasha, kuepuka maeneo hatari, kusikiliza mwalimu",
      "Ratiba inayoonyesha aina za mazoezi kwa siku tofauti"
    ],
    long: [
      "Eleza umuhimu wa usafi binafsi katika afya ya mtoto. Taja hatua tano za usafi binafsi.",
    ],
    longAnswers: [
      "Usafi huboresha afya, huongeza ujasiri, huondoa vijidudu. Hatua: kunawa mikono, kunawa mdomo, kusafisha mwili, kuvaa nguo safi, kusafisha nywele."
    ],
  },
  "Creative Arts": {
    mcq: [
      ["Rangi ya bluu ni moja ya...", "Rangi za baridi", "Rangi za joto", "Rangi nyeupe", "Rangi nyeusi"],
      ["Sanaa ya uchoraji inatumia...", "Brashi na rangi", "Jiwe na chuma", "Mti na mbao", "Chuma na shaba"],
      ["Muziki wa taarab una asili ya...", "Afrika Mashariki", "Ulaya", "Marekani", "Asia"],
      ["Michezo ya jadi inafanywa na...", "Watoto na watu wazima", "Watu wazima peke yake", "Watoto peke yake", "Wageni"],
      ["Sanamu ya kielelezo inaweza kuwa ya...", "Mti, jiwe, chuma", "Maji peke yake", "Hewa peke yake", "Rangi peke yake"],
      ["Ugumu wa sanaa ni...", "Kujieleza", "Kuchora", "Kupaka rangi", "Kuchagua rangi"],
      ["Ngoma ya Kitikiti ina asili ya...", "Kenya", "Tanzania", "Uganda", "Rwanda"],
      ["Sanaa ya upigaji picha inahusu...", "Kuchukua picha", "Kuchora", "Kupaka rangi", "Kusuka"],
      ["Muziki wa benga una asili ya...", "Kenya", "Nigeria", "Ghana", "Afrika Kusini"],
      ["Ufundishaji wa sanaa shuleni unaimarisha...", "Ujasiri na utambuzi", "Nafsi peke yake", "Mali peke yake", "Umasikini"],
    ],
    short: [
      "Taja aina tatu za sanaa za kuonekana na mfano kwa kila moja.",
      "Eleza umuhimu wa sanaa katika elimu ya mtoto.",
      "Andika nyimbo moja ya taifa la Kenya na uieleze umuhimu wake.",
    ],
    shortAnswers: [
      "Uchoraji (picha), Sanamu (vitu), Upigaji picha (picha halisi)",
      "Kuimarisha ujasiri, ubunifu, na utambuzi wa rangi na mifumo",
      "Nyimbo ya taifa na umuhimu wake katika umoja"
    ],
    long: [
      "Eleza jinsi sanaa zinavyoweza kutumika kuboresha elimu ya mtoto shuleni. Taja mifano minne.",
    ],
    longAnswers: [
      "Sanaa zinaboresha ubunifu, ujasiri, utambuzi, na uwezo wa kujieleza. Mifano: uchoraji, ngoma, muziki, sanamu."
    ],
  },
};

const PAPERS: { grade: number; subject: string; term: string; assessmentType: string }[] = [
  { grade: 1, subject: "Literacy Activities", term: "Term 1", assessmentType: "End-Term" },
  { grade: 1, subject: "Environmental Activities", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 3, subject: "Literacy Activities", term: "Term 3", assessmentType: "End-Term" },
  { grade: 3, subject: "Environmental Activities", term: "Term 1", assessmentType: "Opener" },
  { grade: 4, subject: "English", term: "Term 1", assessmentType: "End-Term" },
  { grade: 4, subject: "Mathematics", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 4, subject: "Social Studies", term: "Term 1", assessmentType: "End-Term" },
  { grade: 6, subject: "Science & Technology", term: "Term 3", assessmentType: "KPSEA" },
  { grade: 6, subject: "Mathematics", term: "Term 1", assessmentType: "Opener" },
  { grade: 6, subject: "English", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 7, subject: "Integrated Science", term: "Term 1", assessmentType: "End-Term" },
  { grade: 7, subject: "Mathematics", term: "Term 2", assessmentType: "End-Term" },
  { grade: 9, subject: "Computer Studies", term: "Term 3", assessmentType: "KJSEA" },
  { grade: 9, subject: "Mathematics", term: "Term 1", assessmentType: "End-Term" },
  { grade: 10, subject: "Physics", term: "Term 1", assessmentType: "End-Term" },
  { grade: 10, subject: "Mathematics", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 12, subject: "Mathematics", term: "Term 3", assessmentType: "KCSE" },
  // === 30 NEW PAPERS ===
  // Grade 1 (Lower Primary)
  { grade: 1, subject: "Kiswahili", term: "Term 2", assessmentType: "End-Term" },
  { grade: 1, subject: "Religious Education", term: "Term 3", assessmentType: "End-Term" },
  // Grade 2 (Lower Primary)
  { grade: 2, subject: "English", term: "Term 1", assessmentType: "Opener" },
  { grade: 2, subject: "Mathematics", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 2, subject: "Environmental Activities", term: "Term 3", assessmentType: "End-Term" },
  { grade: 2, subject: "Kiswahili", term: "Term 1", assessmentType: "End-Term" },
  // Grade 3 (Lower Primary)
  { grade: 3, subject: "Kiswahili", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 3, subject: "Religious Education", term: "Term 1", assessmentType: "End-Term" },
  // Grade 4 (Upper Primary)
  { grade: 4, subject: "Kiswahili", term: "Term 3", assessmentType: "End-Term" },
  { grade: 4, subject: "Science & Technology", term: "Term 1", assessmentType: "Opener" },
  { grade: 4, subject: "Home Science", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 4, subject: "Religious Education", term: "Term 1", assessmentType: "End-Term" },
  // Grade 5 (Upper Primary)
  { grade: 5, subject: "English", term: "Term 1", assessmentType: "Opener" },
  { grade: 5, subject: "Mathematics", term: "Term 2", assessmentType: "End-Term" },
  { grade: 5, subject: "Science & Technology", term: "Term 3", assessmentType: "Mid-Term" },
  { grade: 5, subject: "Social Studies", term: "Term 1", assessmentType: "End-Term" },
  // Grade 6 (Upper Primary)
  { grade: 6, subject: "Kiswahili", term: "Term 1", assessmentType: "Opener" },
  { grade: 6, subject: "Social Studies", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 6, subject: "Home Science", term: "Term 3", assessmentType: "End-Term" },
  // Grade 7 (Junior Secondary)
  { grade: 7, subject: "Kiswahili", term: "Term 3", assessmentType: "End-Term" },
  { grade: 7, subject: "Social Studies", term: "Term 1", assessmentType: "Opener" },
  { grade: 7, subject: "Computer Studies", term: "Term 2", assessmentType: "Mid-Term" },
  // Grade 8 (Junior Secondary)
  { grade: 8, subject: "English", term: "Term 1", assessmentType: "End-Term" },
  { grade: 8, subject: "Mathematics", term: "Term 2", assessmentType: "End-Term" },
  { grade: 8, subject: "Integrated Science", term: "Term 3", assessmentType: "KJSEA" },
  // Grade 9 (Junior Secondary)
  { grade: 9, subject: "Kiswahili", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 9, subject: "Social Studies", term: "Term 1", assessmentType: "End-Term" },
  // Grade 10 (Senior Secondary)
  { grade: 10, subject: "Chemistry", term: "Term 3", assessmentType: "End-Term" },
  { grade: 10, subject: "Biology", term: "Term 1", assessmentType: "Opener" },
  { grade: 10, subject: "Business Studies", term: "Term 2", assessmentType: "Mid-Term" },
  // Grade 11 (Senior Secondary)
  { grade: 11, subject: "Mathematics", term: "Term 1", assessmentType: "End-Term" },
  { grade: 11, subject: "Physics", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 11, subject: "Chemistry", term: "Term 3", assessmentType: "End-Term" },
  { grade: 11, subject: "Biology", term: "Term 1", assessmentType: "Opener" },
  // Grade 12 (Senior Secondary)
  { grade: 12, subject: "Physics", term: "Term 1", assessmentType: "End-Term" },
  { grade: 12, subject: "Chemistry", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 12, subject: "Biology", term: "Term 3", assessmentType: "KCSE" },
  { grade: 12, subject: "Geography", term: "Term 1", assessmentType: "End-Term" },
  { grade: 12, subject: "Business Studies", term: "Term 2", assessmentType: "Mid-Term" },
  { grade: 12, subject: "History & Government", term: "Term 3", assessmentType: "KCSE" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generatePaperContent(combo: { grade: number; subject: string; term: string; assessmentType: string }): PaperContent {
  const q = QUESTIONS[combo.subject];
  if (!q) {
    const mathQ = QUESTIONS["Mathematics"];
    return generateContentFromQuestions(combo, mathQ);
  }
  return generateContentFromQuestions(combo, q);
}

function generateContentFromQuestions(
  combo: { grade: number; subject: string; term: string; assessmentType: string },
  q: { mcq: string[][]; short: string[]; long: string[]; shortAnswers: string[]; longAnswers: string[] }
): PaperContent {
  const mcqQuestions: Question[] = q.mcq.map((item, i) => {
    // item[0] = question, item[1] = correct answer, item[2-4] = distractors
    const correctAnswer = item[1];
    const distractors = item.slice(2);
    // Shuffle all 4 options together
    const allOptions = shuffleArray([correctAnswer, ...distractors]);
    const correctIndex = allOptions.indexOf(correctAnswer);
    const labels = ["A", "B", "C", "D"];
    return {
      number: i + 1,
      question: item[0],
      options: allOptions.map((opt, oi) => `${labels[oi]}) ${opt}`),
      answer: labels[correctIndex],
      marks: 1,
    };
  });

  const shortQuestions: Question[] = q.short.map((question, i) => ({
    number: 11 + i,
    question,
    answer: q.shortAnswers[i],
    marks: 3,
  }));

  const longQuestions: Question[] = q.long.map((question, i) => ({
    number: 16 + i,
    question,
    answer: q.longAnswers[i],
    marks: 5,
  }));

  return {
    title: `Grade ${combo.grade} ${combo.subject} - ${combo.term} ${combo.assessmentType}`,
    grade: String(combo.grade),
    subject: combo.subject,
    term: combo.term,
    assessmentType: combo.assessmentType,
    totalMarks: 40,
    sections: [
      { name: "Section A - Multiple Choice", marks: 10, questions: mcqQuestions },
      { name: "Section B - Short Answer", marks: 15, questions: shortQuestions },
      { name: "Section C - Long Answer", marks: 15, questions: longQuestions },
    ],
  };
}

async function main() {
  console.log("Clearing existing papers...");
  await prisma.revisionPaper.deleteMany();

  console.log(`Seeding ${PAPERS.length} revision papers locally (no API needed)...\n`);

  let success = 0;

  for (let i = 0; i < PAPERS.length; i++) {
    const combo = PAPERS[i];
    const label = `Grade ${combo.grade} ${combo.subject} (${combo.term} ${combo.assessmentType})`;
    process.stdout.write(`[${i + 1}/${PAPERS.length}] ${label}... `);

    try {
      const content = generatePaperContent(combo);

      await prisma.revisionPaper.create({
        data: {
          title: content.title,
          grade: String(combo.grade),
          subject: combo.subject,
          term: combo.term,
          assessmentType: combo.assessmentType,
          year: 2026,
          content: JSON.stringify(content),
          fileUrl: "",
        },
      });

      console.log("OK");
      success++;
    } catch (error) {
      console.log("FAILED:", error);
    }
  }

  console.log(`\nDone: ${success}/${PAPERS.length} papers seeded`);
  await prisma.$disconnect();
}

main();
