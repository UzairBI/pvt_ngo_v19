/**
 * ALL SLIDESHOW IMAGES ARE LISTED HERE.
 *
 * To replace a photo: overwrite the file in public/images/<folder>/ with a new photo of the SAME name.
 * To add a photo: put the file in the folder, then add its path to the matching list below.
 * To remove a photo: delete its line. Order in the list = order on screen.
 * A list with no working images falls back to the page's original look (plain blue hero, etc.).
 *
 * See IMAGES.md in the project root for sizes and folder details.
 */

/** FEATURED SET (4 photos). A separate reusable set (not used by the Home hero any more). NEVER used on the donation page. */
export const featuredImages = [
  "/images/featured/featured-01.jpg",
  "/images/featured/featured-02.jpg",
  "/images/featured/featured-03.jpg"
  // "/images/featured/featured-04.jpg"   <- 4th photo: add the file, then remove the // at the start of this line
];

/**
 * Home page hero: ONE static photo (no slideshow). To change it, save your photo over
 * public/images/home/home-hero-01.jpg (same name), or point this line at another file in public/images/home/.
 */
export const homeHeroImage = "/images/home/home-hero.jpg";

/**
 * DONATION SET. Donate page only, completely separate from the featured set.
 * Use VERTICAL (portrait) photos here: the photo area on the Donate page is tall.
 */
export const donationImages = [
  "/images/donation/donate-v1.jpg",
  "/images/donation/donate-v2.jpg",
  "/images/donation/donate-v3.jpg"
];

/** ONE fixed photo per inner page (no slideshow). Blue banner at the top of inner pages (a blue overlay is always kept on top of these). */
export const aboutImages = ["/images/about/about-hero.jpg"];
export const projectsImages = ["/images/projects/projects-hero.jpg"];
export const mediaImages = ["/images/media/media-hero.jpg"];
export const transparencyImages = ["/images/transparency/transparency-hero.jpg"];
export const contactImages = ["/images/contact/contact-hero.jpg"];
