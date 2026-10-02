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
 * Home page hero SLIDESHOW. The first photo is shown first, then each one shifts sideways to the next.
 * To replace a photo: save yours over the file in public/images/home/ with the same name.
 * To add / remove a slide: add / delete a line. Order here = order on screen.
 * `focus` = which part of the photo stays in view when it is cropped ("across% down%"):
 * the first value pair is for phones (photo on top of the text), the `md:` pair is for wider screens (photo behind the text).
 */
export const homeHeroSlides = [
  { src: "/images/home/hero-slide-01.jpg", focus: "object-[88%_center] md:object-[100%_60%]" },
  { src: "/images/home/hero-slide-02.jpg", focus: "object-[90%_center] md:object-[center_65%]" },
  { src: "/images/home/hero-slide-03.jpg", focus: "object-[58%_center] md:object-[center_40%]" },
  { src: "/images/home/hero-slide-04.jpg", focus: "object-[100%_center] md:object-[center_50%]" },
  { src: "/images/home/hero-slide-05.jpg", focus: "object-[80%_center] md:object-[center_20%]" }
];

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
