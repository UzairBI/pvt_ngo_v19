export interface ProjectDetailBlock {
  partner?: string;
  stats?: { value: string; label: string }[];
  paragraphs?: string[];
  benefitsTitle?: string;
  benefits?: [string, string][];
  reach?: { village: string; terrain: string; families: string }[];
  reachNote?: string;
  quote?: string;
  gallery?: { file: string; alt: string }[];
  report?: { label: string; href: string };
  donateCause?: string;
  tagline?: string;
}
export interface Project { slug: string; category: string; title: string; text: string; image: string; featured?: boolean; detail?: ProjectDetailBlock }
export const projects: Project[] = [
  { slug: "women-empowerment", category: "Women Empowerment", title: "Self-Reliance Tailoring Center", image: "field-3.jpg",
    text: "Job skills training, Self-Help Groups (SHGs) support, and financial literacy workshops helping rural and urban women achieve financial independence." },
  { slug: "health-nutrition", category: "Health & Nutrition", title: "Rural Health Checkup Camps", image: "field-6.jpg",
    text: "Free health check-up camps, preventative awareness drives, maternal care, and basic nutrition kits delivered directly to remote village doorsteps." },
  { slug: "child-education", category: "Child Education", title: "Shiksha Sahara Child Education Programme", image: "field-9.jpg",
    text: "Free community learning centers, remedial classes, school kits, uniforms, and digital literacy outreach for underprivileged children." },
  { slug: "environment", category: "Environment", title: "Harit Sagar Tree Campaign", image: "plantation-campaign.webp",
    text: "Massive native tree plantation campaigns, eco-workshops, plastic-free market drives, and community clean-up initiatives." },
  { slug: "social-welfare", category: "Social Relief", title: "Winter Blanket & Cloth Drive", image: "field-1.jpg",
    text: "Emergency disaster relief, seasonal blanket & clothing drives, ration kits for senior citizens, and community food drives." },
  { slug: "solar-lantern", category: "Renewable Energy", title: "Solar Lantern Distribution Programme", image: "solar-lantern-forest-edge.jpg", featured: true,
    text: "Solar LED lanterns with charging panels for off-grid tribal families in forest-fringe villages of Sagar district, in partnership with Jiv Daya Foundation, USA.",
    detail: {
      tagline: "From Darkness to Light",
      partner: "In partnership with Jiv Daya Foundation, USA",
      stats: [{ value: "50+", label: "Families reached" }, { value: "3", label: "Villages covered" }, { value: "0", label: "Grid electricity" }, { value: "100%", label: "Solar powered" }],
      paragraphs: [
        "None of the homes in these forest-fringe tribal villages, whether mud-walled huts, tin-sheet shelters or brick-and-tarp structures, is connected to the power grid. For every family, night means total darkness.",
        "During the monsoon the unpaved paths between homes turn into deep, slippery mud, and after sunset they become genuinely dangerous. Women often have to fetch water or firewood after dark, many households have no in-home toilet, a sick child means finding the way with no light, and living at the forest edge brings the risk of snakes and other wildlife. With no lighting, children's study time ends at sunset.",
        "Every family received a rechargeable solar LED lantern together with a small solar charging panel: placed in daylight, the panel charges the lantern at no cost, and after dark the household has several hours of clean, reliable light inside the home and on the path outside it. Volunteer teams delivered each lantern door-to-door, often on foot through monsoon mud, and every distribution was documented with photographs."
      ],
      benefitsTitle: "Direct benefits recorded on the ground",
      benefits: [
        ["Safer movement at night", "Families walk the mud paths around their homes with far greater confidence and less risk of falling or injury."],
        ["Protection for women and children", "After-dark tasks such as water, sanitation and checking on livestock are now done with light in hand."],
        ["Continued schooling", "Children can study after sunset for the first time, closing a gap that ended their school day at dusk."],
        ["Faster response in emergencies", "A sick family member or a snake near the house can be seen and dealt with immediately."],
        ["Zero ongoing cost", "The lantern runs entirely on sunlight: no electricity bill and no recurring spend on kerosene or candles."],
        ["A cleaner alternative", "It replaces kerosene lamps and candles, removing smoke, fire risk and fumes in small, poorly ventilated homes."]
      ],
      reach: [
        { village: "Village 1", terrain: "Forest-edge hamlet; tin-and-thatch homes; unpaved, muddy access paths", families: "~25" },
        { village: "Village 2", terrain: "Rahli block settlement; mud-brick homes; no electricity infrastructure", families: "~15" },
        { village: "Village 3", terrain: "Roadside hamlet; brick and tarp-roof shelters; seasonal flooding", families: "~10" }
      ],
      reachNote: "Figures reflect field-team tallies at the time of distribution and will be confirmed in the consolidated beneficiary register.",
      quote: "Today, we have received the greatest support of our lives — now we are not afraid to walk the muddy paths at night.",
      gallery: [
        { file: "solar-lantern-forest-edge.jpg", alt: "A family at the edge of the forest received a solar lantern and charging panel. With no electricity nearby, it is now their only reliable source of light after sunset." },
        { file: "solar-lantern-rahli.jpg", alt: "In a Rahli-block settlement that has never had an electricity connection, an elderly resident received a solar lantern and panel." },
        { file: "solar-lantern-hamlet.jpg", alt: "In a low-lying, flood-prone hamlet, a woman managing her household received a solar lantern." },
        { file: "solar-lantern-mother-child.jpg", alt: "A mother, holding her young child, receiving her family's lantern: a household where nightfall previously meant complete darkness." }
      ],
      report: { label: "Read the full Solar Lantern Impact Report (PDF)", href: "/documents/SJKS-Solar-Lantern-Impact-Report.pdf" },
      donateCause: "Solar Lanterns for Tribal Families"
    } }
];
export const heroSlides = [
  { image: "field-1.jpg", alt: "Empowering Lives, Transforming Communities in Rural India" },
  { image: "field-6.jpg", alt: "Free Healthcare & Nutrition at Village Doorsteps" },
  { image: "field-9.jpg", alt: "Child Education Programme" },
  { image: "plantation-campaign.webp", alt: "Environment Protection & Tree Plantation" }
];
export const ticker = "🎓 3,000+ children supported · 🏥 2,000+ patients assisted · 👩 1,500+ women in SHGs & livelihoods · ☀️ 50+ families lit up with solar lanterns · 🌱 5,000+ in tree plantation drives";
export interface Stat { label: string; value?: number; suffix?: string; text?: string; plain?: boolean }
/** Fallback numbers. Live numbers come from public/data/live.json (see README). */
export const stats: Stat[] = [
  { label: "Direct & indirect beneficiaries", value: 25000, suffix: "+" },
  { label: "Children in education programmes", value: 3000, suffix: "+" },
  { label: "Patients supported", value: 2000, suffix: "+ patients" },
  { label: "Women in SHGs & livelihoods", value: 1500, suffix: "+" },
  { label: "Environment participants", value: 5000, suffix: "+" },
  { label: "Working since", value: 2004, plain: true }
];
/** Short excerpts from https://saharajks.help/testimonials/ . The source gives only the speaker's role (no personal names), so `name` holds that role.
 *  `statLabel` (optional) pulls a matching live number from stats above to show as the big figure on the two feature cards. */
export interface Testimonial { initial: string; name: string; program: string; quote: string; statLabel?: string }
export const testimonials: Testimonial[] = [
  { initial: "P", name: "Parent of a Beneficiary Student", program: "Education Support Programme", statLabel: "Children in education programmes",
    quote: "Thanks to Sahara Jan Kalyan Samiti, my daughter got the supplies and support to keep learning. Her confidence and grades soared!" },
  { initial: "S", name: "SHG Member & Rural Entrepreneur", program: "Women Empowerment & Self Help Groups", statLabel: "Women in SHGs & livelihoods",
    quote: "This group boosted my self-confidence and taught me money skills that have really helped out." },
  { initial: "H", name: "Healthcare Support Beneficiary", program: "Medical Treatment Assistance",
    quote: "When our family faced a serious medical emergency, Sahara Jan Kalyan Samiti stepped in. Their timely aid gave us hope in a tough time." },
  { initial: "C", name: "Community Volunteer", program: "Nutrition & Child Welfare",
    quote: "Parents learned about healthy habits, and the kids look healthier and happier. This has been fantastic for our community." },
  { initial: "C", name: "Community Leader", program: "Awareness, Health & Education",
    quote: "Because of their dedication to social progress, they inspire positive changes around the area." }
];
export const ways = [
  { title: "Donate", text: "Fund education kits, health camps and relief drives.", href: "/donate", cta: "Donate now" },
  { title: "Volunteer", text: "Give your time at field camps and learning centers.", href: "/get-involved", cta: "Volunteer" },
  { title: "Corporate CSR", text: "Partner with us for verified, reportable impact.", href: "/get-involved", cta: "Partner with us" },
  { title: "Sponsor a Cause", text: "Sponsor a child, a tree drive or a family kit.", href: "/donate", cta: "Sponsor" }
];
export const committee = [
  { name: "Dr. Harishankar Sen", post: "Chairman / President" }, { name: "Mr. Manish Kumar", post: "Secretary" },
  { name: "Smt. Ritu Sen", post: "Treasurer" }, { name: "Smt. Sunita Jain", post: "Vice President" },
  { name: "Mr. Abhitabh Mishra", post: "General Secretary" }, { name: "Anita Tiwari", post: "Executive Member" },
  { name: "Roop Kumar Chadar", post: "Executive Member" }
];
export const values = [
  ["Quality", "Excellence through research, innovation, continuous improvement, transparency, accountability and professional management systems."],
  ["Caring", "Serving communities with empathy, compassion, dignity and respect for every individual."],
  ["Participation", "Sustainable development is possible only through active community participation and ownership."],
  ["Transparency", "Transparency, accountability and ethical governance in all organisational processes and programmes."]
];
export const impactTiers = [
  { min: 500, text: "Provides a school kit (bag, notebooks and stationery) for 1 child." },
  { min: 1500, text: "Provides a nutrition kit for 3 families for one month." },
  { min: 2500, text: "Provides complete learning kits, notebooks & books for 5 children for 1 full academic year." },
  { min: 6000, text: "Sponsors one child's education for one full year." },
  { min: 12500, text: "Funds a full village health check-up camp." },
  { min: 20000, text: "Funds a large native tree plantation drive with community care." }
];

/** Mission, vision and philosophy, from the organisation profile. */
export const mission = {
  vision: "To build a world-class social development organization creating an equitable, inclusive, healthy, and empowered society, free from discrimination, poverty, and inequality.",
  mission: "Empower communities through sustainable development interventions in education, health, livelihood, women empowerment, environment, renewable energy, youth development, and social justice while strengthening community participation and institutional capacity.",
  philosophy: "The planting of trees is the least self-centered of all that we do. Someone enjoys the shade and fruits today because someone planted a tree a long time ago."
};
export const thematicAreas: [string, string][] = [
  ["Education", "School education support, digital learning, girls' education, remedial education, scholarship support and career guidance."],
  ["Health & Nutrition", "Health awareness camps, maternal & child health, nutrition programmes and community health interventions."],
  ["WASH", "School sanitation programmes, hygiene awareness and safe drinking water promotion."],
  ["Women Empowerment", "Self Help Groups, livelihood promotion, skill training and leadership development."],
  ["Tribal Development", "Community mobilisation, traditional knowledge promotion, and education & health support."],
  ["Environment & Energy", "Tree plantation, solar awareness campaigns, renewable energy promotion and climate awareness."],
  ["Youth & Skills", "Vocational training, entrepreneurship development, sports promotion, leadership & life skills."],
  ["Bharat Maternal Mission", "Maternal health, neonatal care systems, nutritional support and community training in remote districts."]
];
export const districts = ["Sagar", "Harda", "Shahdol", "Sehore", "Vidisha", "Tikamgarh", "Panna", "Katni", "Narsinghpur", "Chhatarpur", "Betul", "Ashoknagar"];
export const otherAreas = ["Hyderabad, Telangana", "Mumbai, Maharashtra", "Kerala"];
export const team = [
  { name: "Dr. Harishankar Sen", post: "Chairman & CEO", role: "Founder Chairman with 25+ years in social development, governance and community empowerment. Strategic leadership, fundraising and programme oversight." },
  { name: "Dr. Shailendra Yadav", post: "Manager", role: "Programme design, implementation and field monitoring across health, education, nutrition and livelihood sectors." },
  { name: "Dr. Suyash Kamal Soni", post: "Program Manager", role: "Coordination of development projects, beneficiary engagement, progress monitoring and stakeholder communication." },
  { name: "Kaustubh Agrawal", post: "Admin & Finance Head", role: "Financial planning, budgeting, statutory compliance and programme accounting." }
];
export const csrReadiness: [string, string][] = [
  ["CSR partnerships", "Eligible for corporate CSR projects under the Companies Act, 2013."],
  ["International grants", "FCRA certified: eligible to receive foreign contributions."],
  ["Government projects", "Experienced in implementing government-funded schemes."],
  ["Foundation funding", "Registered with NGO Darpan and the CSR portal for foundation grants."],
  ["Education & sports", "Skill development, vocational training and sports promotion projects."],
  ["Renewable energy", "Solar awareness, renewable energy promotion and climate programmes."],
  ["Community development", "Holistic WASH, health, livelihood and women empowerment projects."],
  ["Livelihood programmes", "SHG formation, skill training and entrepreneurship development."]
];
