export interface NavItem { label: string; href: string; children?: { label: string; href: string }[] }
export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about", children: [
    { label: "Founder Chairman & CEO", href: "/about#founder" },
    { label: "Mission & Vision", href: "/about#mission" },
    { label: "Executive Committee", href: "/about#committee" },
    { label: "Where We Work", href: "/about#reach" },
    { label: "Partners & Supporters", href: "/about#partners" },
    { label: "Legal & Registration", href: "/about#legal" } ] },
  { label: "Our Projects", href: "/projects", children: [
    { label: "Women Empowerment", href: "/projects/women-empowerment" },
    { label: "Health & Nutrition", href: "/projects/health-nutrition" },
    { label: "Child Education", href: "/projects/child-education" },
    { label: "Environment & Tree Plantation", href: "/projects/environment" },
    { label: "Social Welfare & Relief", href: "/projects/social-welfare" },
    { label: "Solar Lantern Programme", href: "/projects/solar-lantern" },
    { label: "Project Portfolio 2004–2025", href: "/projects#portfolio" } ] },
  { label: "Media & Gallery", href: "/media", children: [
    { label: "Photo Gallery", href: "/media#photo-gallery" },
    { label: "Video Gallery", href: "/media#video-gallery" },
    { label: "Press / News", href: "/media#press-news" },
    { label: "Latest News", href: "/news" },
    { label: "Events Calendar", href: "/events" } ] },
  { label: "Transparency & Reports", href: "/transparency", children: [
    { label: "Annual Reports", href: "/transparency#annual-reports" },
    { label: "Request Audit Report", href: "/transparency?request=audit#request" },
    { label: "Request Certificates", href: "/transparency?request=certificate#request" } ] },
  { label: "Contact Us", href: "/contact" }
];
export const quickNav = [
  { label: "About Us & Leadership", href: "/about" },
  { label: "Our 5 Core Projects", href: "/projects" },
  { label: "Photo & Video Gallery", href: "/media" },
  { label: "Latest News", href: "/news" },
  { label: "Events Calendar", href: "/events" },
  { label: "Transparency & Financial Reports", href: "/transparency" },
  { label: "Volunteer & CSR Partnerships", href: "/get-involved" },
  { label: "Contact Us & Field Office", href: "/contact" },
  { label: "Donate Now", href: "/donate" }
];
