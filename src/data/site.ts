/**
 * ALL organisation identity, legal IDs and payment details live here.
 * Do NOT commit real bank / UPI / IFSC values to a public repo.
 */
export const site = {
  name: "Sahara Jan Kalyan Samiti",
  shortName: "Sahara",
  location: "Sagar, MP",
  regLine: "Reg. No. 4666/19-10-04",
  tagline: "Healthcare, education, livelihoods, environment, and relief across Madhya Pradesh.",
  phone: "+91 9630494707",
  phoneHref: "tel:+919630494707",
  whatsappHref: "https://wa.me/919630494707?text=Hello%20Sahara%20Jan%20Kalyan%20Samiti",
  email: "info@saharangosag.com",
  address: "21/419, Behind TCPC, Khurai Road, Shastri Ward No. 20, Near Hotel Ahilya, Sagar, Madhya Pradesh - 470002, India",
  officeHours: "Monday to Saturday: 9:00 AM - 6:00 PM",
  chairman: "Dr. Harishankar Sen",
  fax: "07582-404399",
  taxNotice: "12A · 80G · FCRA · CSR-1 registered",
  regDate: "19 October 2004",
  legalStatus: "Registered Society under the M.P. Societies Registration Act, 1973 (Sec. 44)",
  website: "www.saharangosag.com",
  /** Additional mobile numbers listed in the organisation profile and impact report. */
  altPhones: [
    { label: "+91 9406520190", href: "tel:+919406520190" },
    { label: "+91 7974406288", href: "tel:+917974406288" }
  ],
  altEmails: ["sjksrehli@gmail.com", "sahara_rehli@yahoo.com"],
  registeredOffice: "333/4, Ram Nagari, Ward No. 5, Rehli - 470227, District Sagar, Madhya Pradesh, India",
  /** Public Razorpay donation page (used as a fallback until the checkout key is configured). */
  razorpayMe: "https://razorpay.me/@saharajankalyansamiti",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61550890041187",
    instagram: "https://www.instagram.com/sahara_rehli/",
    youtube: "https://www.youtube.com/channel/UCr2i8fA8YLC0JKYTFV45ukQ",
    linkedin: "https://www.linkedin.com/in/sahara-jan-kalyan-samiti-ngos-6a650025b/",
    x: "https://x.com/saharasagn9997"
  },
  /** YouTube channel id (the part after /channel/). Used for the Video Gallery embed. */
  youtubeChannelId: "UCr2i8fA8YLC0JKYTFV45ukQ",
  logo: "/assets/images/logo.png"
};

export interface LegalId { title: string; value: string; note: string; authority: string; validity?: string }
export const legalIds: LegalId[] = [
  { title: "Society Registration Certificate", value: "4666/19-10-04", note: "Registered on 19 October 2004 under the M.P. Societies Registration Act, 1973 (Sec. 44).", authority: "Registrar of Societies, Madhya Pradesh" },
  { title: "PAN (Permanent Account Number)", value: "AAHTS0799M", note: "Permanent Account Number of the Samiti.", authority: "Income Tax Department, Govt of India" },
  { title: "TAN (Tax Deduction Account Number)", value: "JBPS07748G", note: "Tax Deduction and Collection Account Number of the Samiti.", authority: "Income Tax Department, Govt of India" },
  { title: "12A Tax Exemption Registration", value: "AAHTS0799M25BP01", note: "Income-tax exemption registration under Section 12A of the Income Tax Act, 1961.", authority: "Income Tax Department (Exemptions)", validity: "AY 2027-28 to AY 2031-32" },
  { title: "80G Tax Exemption Approval", value: "AAHTS0799M25BP02", note: "Donations are eligible for deduction under Section 80G of the Income Tax Act, 1961, subject to applicable rules.", authority: "Income Tax Department (Exemptions)", validity: "AY 2027-28 to AY 2031-32" },
  { title: "NITI Aayog Darpan Portal ID", value: "MP/2011/0039962", note: "Registered on the NGO Darpan portal.", authority: "NITI Aayog, Government of India" },
  { title: "FCRA Registration", value: "063460029R", note: "FCRA renewal letter dated 07-09-2022, valid for five years from 01-10-2022, subject to applicable compliance. Eligible to receive foreign contributions.", authority: "Ministry of Home Affairs, Government of India" },
  { title: "CSR Registration (CSR-1)", value: "CSR00011686", note: "CSR-1 registration. Eligible for corporate CSR projects under the Companies Act, 2013.", authority: "Ministry of Corporate Affairs, Government of India" },
  { title: "EPF / PF Registration", value: "MP/SAG/0020343", note: "EPF registration record.", authority: "Employees' Provident Fund Organisation" },
  { title: "Unique Entity ID (UEI)", value: "NYV1UNKR36F5", note: "Registered on SAM.gov, enabling collaboration with US-based organisations and foundations.", authority: "SAM.gov, United States" },
  { title: "NCAGE Code", value: "7991Y", note: "NATO Commercial and Government Entity code.", authority: "National Codification Bureau (NCB India)" }
];
const idOf = (prefix: string) => legalIds.find((l) => l.title.startsWith(prefix))!;
export const societyReg = idOf("Society").value;
export const darpanId = idOf("NITI").value;
export const reg12A = idOf("12A");
export const reg80G = idOf("80G");
export const fcraReg = idOf("FCRA");

/** Donation payment details for the manual (bank / UPI) fallback. Values starting with "[" are treated as not set. */
export const payment = {
  accountName: "[ACCOUNT NAME]",
  bankName: "[BANK NAME]",
  accountNumber: "[ACCOUNT NUMBER PLACEHOLDER]",
  ifsc: "[IFSC PLACEHOLDER]",
  upi: "[UPI ID PLACEHOLDER]"
};
