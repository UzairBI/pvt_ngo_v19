/**
 * Documents published on the Transparency page.
 * To add a new one: copy the PDF into public/documents/, then add an entry below.
 * `section` decides where it appears: "reports" | "audit" | "certificates".
 */
export interface DocItem { title: string; description: string; file: string; section: "reports" | "audit" | "certificates"; pages?: number; size: string; year?: string }
export const documents: DocItem[] = [
  { section: "reports", year: "2004 - 2025", title: "Comprehensive Impact Report & Achievement Profile 2004-2025",
    description: "Two decades of service: all 15 projects with goals, reach, budgets and funding partners; sector-wise impact, success stories, partners and governance.",
    file: "/documents/SJKS-Impact-Report-2004-2025.pdf", pages: 10, size: "243 KB" },
  { section: "reports", title: "Solar Lantern Distribution Programme: Impact Report",
    description: "\"From Darkness to Light\": solar lanterns for 50+ families in three forest-fringe tribal villages of Sagar district, in partnership with Jiv Daya Foundation, USA.",
    file: "/documents/SJKS-Solar-Lantern-Impact-Report.pdf", pages: 7, size: "1.4 MB" },
  { section: "certificates", title: "Organisation Profile: Registration & Tax Details",
    description: "Society registration, PAN/TAN, 12A and 80G numbers with validity, FCRA, CSR-1, Darpan ID, EPF, UEI and NCAGE code; operational areas and contact details.",
    file: "/documents/SJKS-Organisation-Profile.pdf", pages: 3, size: "150 KB" }
];
