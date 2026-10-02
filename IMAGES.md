# V15: slideshow images

All slideshow photos live in `public/images/`, one folder per set. The lists that decide which photos
are shown (and in what order) are all in **`src/data/slideshows.ts`**.

| Folder | Shown on | Photo shape | Suggested size |
|---|---|---|---|
| `public/images/featured/` | Separate reusable set (not shown on Home) | Landscape | 1600 x 900 or larger |
| `public/images/home/` | Home hero: ONE static photo, `home-hero-01.jpg` | Landscape | 1920 x 1080 or larger |
| `public/images/donation/` | **Donate page only** | **Vertical (portrait)** | 1200 x 1600 (3:4) or 1200 x 1500 (4:5) |
| `public/images/about/` | About banner | Landscape | 1600 x 700 or larger |
| `public/images/projects/` | Projects banner | Landscape | 1600 x 700 or larger |
| `public/images/media/` | Media & Gallery banner | Landscape | 1600 x 700 or larger |
| `public/images/transparency/` | Transparency & Reports banner | Landscape | 1600 x 700 or larger |
| `public/images/contact/` | Contact banner | Landscape | 1600 x 700 or larger |

**Featured photos are never used on the Donate page.** The donation set has its own folder and its own list.

## Replace a photo
Save the new photo over the old file with the **same name** (e.g. `donation-02.jpg`). No code change needed.

## Add a photo
1. Put the file in the folder, e.g. `public/images/donation/donation-05.jpg`.
2. Add its path to the matching list in `src/data/slideshows.ts`, e.g. `"/images/donation/donation-05.jpg"`.

## The 4th featured photo
Save it as `public/images/featured/featured-04.jpg`, then in `src/data/slideshows.ts` remove the `//`
in front of the `featured-04` line.

## Tips
- Use .jpg, keep each file under ~500 KB (export at quality 80-85).
- Keep the main subject near the centre; edges are cropped to fit different screens.
- Inner-page banners always keep their blue overlay, so text stays readable on any photo.
