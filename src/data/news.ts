export interface Post { slug: string; title: string; date: string; category: string; image: string; excerpt: string; body: string[] }

/**
 * Add a new story by copying one object below and editing it. Newest first.
 * Keep stories factual: only publish things that have really happened.
 */
export const posts: Post[] = [
  {
    slug: "solar-lanterns-from-darkness-to-light", title: "From Darkness to Light: solar lanterns for 50+ tribal families", date: "2026-09-30", category: "Renewable Energy", image: "solar-lantern-forest-edge.jpg",
    excerpt: "With Jiv Daya Foundation, USA, we placed solar lanterns and charging panels in homes that have never had electricity in three forest-fringe villages of Sagar district.",
    body: [
      "In three forest-fringe tribal villages of Sagar district, not one home is connected to the power grid. After sunset, families are left in complete darkness, and in the monsoon the unpaved paths between homes become deep, slippery mud.",
      "Working with Jiv Daya Foundation (USA), our volunteers walked door-to-door, often on foot through monsoon mud, and handed more than 50 families a rechargeable solar LED lantern with a charging panel. Women can now fetch water and reach the toilet at night with light in hand, children can study after dark, and families no longer need kerosene lamps or candles.",
      "Thousands more households in Sagar district's forest belt are still waiting. Every lantern you fund gives one family safe light at no running cost. Read the full impact report, or fund a lantern from our Donate page. Light One Lamp, Change One Life."
    ]
  },
  {
    slug: "how-shiksha-kendras-work", title: "How our Shiksha Kendras support children's learning", date: "2026-09-30", category: "Education", image: "field-9.jpg",
    excerpt: "Free evening learning centres, remedial classes and school kits for children who might otherwise miss out.",
    body: [
      "In rural clusters and slum settlements of Sagar, children facing poverty often miss out on foundational reading, writing and school supplies. Our Shiksha Kendras were set up to close that gap.",
      "The evening centres provide free tutoring and remedial classes, along with school kits and uniforms so that a child can attend without worrying about costs. Digital literacy outreach helps children become comfortable with the tools they will need later.",
      "Learning support is strongest when families and communities become part of the journey. You can sponsor a child's education or fund a school kit from our Donate page."
    ]
  },
  {
    slug: "why-native-tree-plantation", title: "Harit Sagar: why we plant native trees", date: "2026-09-30", category: "Environment", image: "plantation-campaign.webp",
    excerpt: "Native plantation drives, eco-workshops and plastic-free market drives across Sagar.",
    body: [
      "The Harit Sagar Tree Campaign brings people together for native tree plantation and community clean-up initiatives, including along Khurai Road in Sagar.",
      "Alongside planting, we run eco-workshops and plastic-free market drives so that green habits continue after the day of the drive.",
      "If you would like to take part in a plantation drive or support the campaign, please get in touch through our Get Involved page."
    ]
  },
  {
    slug: "self-help-groups-and-tailoring", title: "Skills, savings and confidence: women's self-help groups", date: "2026-09-30", category: "Women Empowerment", image: "field-3.jpg",
    excerpt: "Job skills training, Self-Help Group support and financial literacy workshops for women.",
    body: [
      "Our Self-Reliance Tailoring Center offers job skills training to rural and urban women, helping them build an independent income.",
      "Self-Help Groups (SHGs) give women a way to save together and support each other, and our financial literacy workshops teach practical money-management and income-generation skills.",
      "Women who joined the programme describe gaining confidence and greater family security. You can support this work by sponsoring a woman's training."
    ]
  }
];
