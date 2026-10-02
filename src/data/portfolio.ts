/**
 * Complete project portfolio 2004-2025, taken from the "Comprehensive Impact Report 2004-2025".
 * `area` links each programme to one of the five core project pages (see content.ts -> projects[].slug).
 */
export type Area = "women-empowerment" | "health-nutrition" | "child-education" | "environment" | "social-welfare";
export interface PortfolioItem {
  no: number; name: string; period?: string; location: string; area: Area;
  summary: string; beneficiaries: string; budget: string; funding: string;
}
export const portfolio: PortfolioItem[] = [
  { no: 1, name: "Educational Support Program for Underprivileged Children", period: "2004 - Present", location: "Sagar District, M.P.", area: "child-education",
    summary: "Distribution of school kits, uniforms, books and educational materials; sustained academic support to vulnerable children over two decades.",
    beneficiaries: "1,500+ children", budget: "₹10,00,000+", funding: "Donations, Community Support, CSR" },
  { no: 2, name: "Community Learning & Remedial Education Initiative", period: "Ongoing", location: "Sagar District, M.P.", area: "child-education",
    summary: "Foundational Literacy & Numeracy (FLN), remedial education, after-school support and digital learning for out-of-school and struggling learners.",
    beneficiaries: "1,000+ children", budget: "₹8,00,000+", funding: "Organisation resources, Donations" },
  { no: 3, name: "Preschool Education, Nutrition & Food Support Program", period: "2025 - Present", location: "Sagar District, M.P.", area: "child-education",
    summary: "Early childhood education, preschool learning, structured nutrition support, child development services and parental awareness.",
    beneficiaries: "75 children & 125 families", budget: "₹20,00,000+", funding: "JIV Daya Foundation (USA)" },
  { no: 4, name: "Medical Treatment Assistance & Crowdfunding Support Program", period: "2023 - Present", location: "India (primarily M.P.)", area: "health-nutrition",
    summary: "Facilitated life-saving medical treatment through crowdfunding, donor mobilisation, FCRA-supported healthcare assistance and hospital partnerships. ₹25 Crore+ mobilised.",
    beneficiaries: "2,000+ patients", budget: "₹25 Crore+ mobilised", funding: "Social Squared Ventures Inc. (USA), individual donors & crowdfunding platforms" },
  { no: 5, name: "Women Empowerment, Skill Development & School Awareness Program", location: "Sagar District, M.P.", area: "women-empowerment",
    summary: "School awareness campaigns, sanitary pad making machine support, vocational training, livelihood promotion and health awareness for women and youth.",
    beneficiaries: "500+ women & youth", budget: "₹29,00,000", funding: "SAP Labs India (CSR)" },
  { no: 6, name: "Women Empowerment & Self Help Group Promotion Program", location: "Sagar District, M.P.", area: "women-empowerment",
    summary: "Formation and strengthening of Self-Help Groups (SHGs), financial literacy training, livelihood promotion and community savings mobilisation.",
    beneficiaries: "1,000+ women", budget: "₹12,00,000+", funding: "Community support, Govt. convergence" },
  { no: 7, name: "SGSY & SJSRY Skill Development Programs", period: "2011 - 2013", location: "Betul, Harda, Vidisha & Sagar Districts", area: "women-empowerment",
    summary: "Vocational training in tailoring, fashion designing, electrician work, motor winding, motorcycle repair, security guard and data entry.",
    beneficiaries: "1,500+ youth & women", budget: "₹25,00,000+", funding: "Urban Development Agency & Janpad Panchayats" },
  { no: 8, name: "NREGA Self-Employment Project Support", period: "2007 - 2008", location: "Sagar & Vidisha Districts", area: "social-welfare",
    summary: "Preparation and implementation support for self-employment projects under NREGA; capacity building for rural employment generation.",
    beneficiaries: "7,208 beneficiaries", budget: "₹15,00,000+", funding: "Ministry of Rural Development, Govt. of India" },
  { no: 9, name: "Total Sanitation Campaign", period: "2007 - 2008", location: "Sagar & Sehore Districts", area: "social-welfare",
    summary: "Community awareness and motivation for household toilet construction; hygiene promotion and open-defecation-free village campaigns.",
    beneficiaries: "4,000+ families", budget: "₹8,00,000+", funding: "Panchayat & Rural Development Dept." },
  { no: 10, name: "Mental Health & Student Well-being Program", period: "2025 - Present", location: "Sagar District, M.P.", area: "health-nutrition",
    summary: "Mental health awareness sessions, stress management workshops and student counselling support in schools and colleges.",
    beneficiaries: "2,500+ students", budget: "₹3,00,000+", funding: "Organisation resources" },
  { no: 11, name: "COVID-19 Relief & Humanitarian Support Program", period: "2020 - 2022", location: "Sagar District, M.P.", area: "social-welfare",
    summary: "Emergency distribution of food kits, essential supplies and relief assistance during the COVID-19 pandemic; community outreach and support.",
    beneficiaries: "3,000+ individuals", budget: "₹15,00,000+", funding: "Zomato Feeding India & public donations" },
  { no: 12, name: "Environment Protection & Tree Plantation Campaign", location: "Sagar District, M.P.", area: "environment",
    summary: "Large-scale tree plantation drives and environmental awareness activities to promote ecological conservation and green community spaces.",
    beneficiaries: "5,000+ community members", budget: "₹2,00,000+", funding: "Community support & donations" },
  { no: 13, name: "Residential Training Program for Girls", location: "Madhya Pradesh", area: "child-education",
    summary: "Residential education, life-skills development, personality building and empowerment for girl students from underserved backgrounds.",
    beneficiaries: "70 girls", budget: "₹5,00,000+", funding: "State Education Centre, Govt. of M.P." },
  { no: 14, name: "PC&PNDT Awareness Initiative", location: "Madhya Pradesh", area: "health-nutrition",
    summary: "Gender equality promotion and community awareness campaigns against sex-selective practices under the Pre-Conception & Pre-Natal Diagnostic Techniques Act.",
    beneficiaries: "Community-wide", budget: "₹3,00,000+", funding: "UNFPA & state partners" },
  { no: 15, name: "Navankur Community Development Program", location: "Madhya Pradesh", area: "social-welfare",
    summary: "Formation of Village Development Committees and Ward Committees; grassroots governance strengthening and community mobilisation.",
    beneficiaries: "100+ villages / wards", budget: "₹10,00,000+", funding: "M.P. Jan Abhiyan Parishad" }
];

export const partners: { name: string; role: string }[] = [
  { name: "JIV Daya Foundation (USA)", role: "Funding partner: preschool education, child nutrition, early childhood development and food support (2025 - present)" },
  { name: "Social Squared Ventures Inc. (USA)", role: "Strategic partner: medical treatment assistance and crowdfunding support" },
  { name: "ImpactGuru / VolGuru", role: "Medical crowdfunding platform and volunteer engagement partner" },
  { name: "SAP Labs India", role: "CSR partner: women empowerment, skill development and school awareness programme (₹29 Lakh)" },
  { name: "KONE India", role: "Corporate supporter" },
  { name: "M.P. State Rural Livelihood Mission (MPSRLM)", role: "Government programme partner: rural livelihoods and SHG development" },
  { name: "National Nutrition Mission (Poshan Abhiyaan)", role: "Collaboration on nutrition awareness and child health" },
  { name: "M.P. Jan Abhiyan Parishad", role: "Community development partner: Navankur programme" },
  { name: "State Education Centre, Govt. of M.P.", role: "Education programme partner: residential training for girls" },
  { name: "Zomato Feeding India", role: "COVID-19 relief support partner" },
  { name: "Ministry of Rural Development, Govt. of India", role: "NREGA self-employment project funding" },
  { name: "Panchayat & Rural Development Dept., M.P.", role: "Total Sanitation Campaign partnership" },
  { name: "UNFPA & state partners", role: "PC&PNDT awareness initiative collaboration" },
  { name: "Urban Development Agency & Janpad Panchayats", role: "SGSY / SJSRY skill development funding (2011 - 2013)" },
  { name: "Eight higher education institutions in Kerala", role: "Project Kaushal implementation partners" },
  { name: "Biomet", role: "Technology partner: Project Kaushal" }
];
