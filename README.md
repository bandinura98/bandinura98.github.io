# Batuhan Senoglu — Portfolio

A single-page personal site in English and Turkish. No frameworks, no build step,
no dependencies.

```
index.html
assets/css/style.css
assets/js/i18n.js     ← all the text, in both languages
assets/js/main.js     ← behaviour
assets/img/           ← your photos go here
.nojekyll             ← tells GitHub Pages not to run Jekyll
```

---

## 1. Add your photos

Drop five JPGs into `assets/img/` with these exact names:

| File | Where it appears | Best shape |
|---|---|---|
| `photo-01.jpg` | Hero, next to the name | portrait, 3:4 |
| `photo-02.jpg` | Profile section | portrait, 4:5 |
| `photo-03.jpg` | Industrial systems banner | wide, 21:9 |
| `photo-04.jpg` | Capital markets | portrait, 3:4 |
| `photo-05.jpg` | Experience closer | wide, 3:1 |

If a file is missing the frame falls back to an engraved placeholder, so the site
never looks broken while you are still collecting images. Photos render
desaturated and re-saturate on hover — that keeps mixed-quality phone shots
looking like one set.

Keep each file under ~400 KB. Quick check:

```bash
powershell -c "gci assets/img/*.jpg | select Name,@{n='KB';e={[int]($_.Length/1KB)}}"
```

## 2. Editing the text

**All copy lives in `assets/js/i18n.js`**, not in the HTML. It is one object with an
`en` block and a `tr` block, and the keys match the `data-i18n` attributes in
`index.html`. To reword something, find its key and edit both languages.

The English text in `index.html` is the fallback shown if JavaScript is disabled —
if you change a sentence permanently, change it in both places.

Values may contain inline HTML (`<b>`, `<span class="hl">`), which is how the
highlighted phrases are done.

## 3. Fill in your details

Search `index.html` for these — they are the only placeholders left:

- `https://github.com/` — your GitHub profile URL (2 places)
- `https://www.linkedin.com/` — your LinkedIn URL
- `github.com/&lt;handle&gt;` and `in/&lt;handle&gt;` — the visible link labels
- `bsenoglu@kaban.com.tr` — swap for a personal address if you would rather not
  publish the work one

If you want the Turkish spelling of your name in the hero, change `BATUHAN` /
`SENOGLU` to `BATUHAN` / `ŞENOĞLU`. Archivo Black has the Turkish characters, so
`Ş` and `Ğ` render correctly.

Also read through the machine descriptions in **Industrial Systems**. I wrote them
from what you described plus the shape of the codebase — correct anything that is
not exactly right before you publish.

## 4. Language switching

The EN/TR toggle sits in the header. Behaviour:

- First visit: the browser's own language decides. `tr-TR` gets Turkish, anything
  else gets English.
- After that the choice is remembered in `localStorage`, so a returning visitor
  gets what they picked last time.
- `<html lang>`, `<title>` and the meta description all switch too, which is what
  search engines and screen readers read.

To make one language always win regardless of the browser, edit `pickLang()` in
`assets/js/main.js`.

## 5. Before you share the link

The social preview card (`assets/img/og-cover.svg`) is an SVG. It looks right in a
browser, but **X, LinkedIn and Slack do not render SVG previews** — they will show
no image at all. Once the site is live, export it to a 1200×630 PNG, save it as
`assets/img/og-cover.png`, and point the tag at it:

```html
<meta property="og:image" content="https://<handle>.github.io/<repo>/assets/img/og-cover.png">
```

Scrapers need an absolute URL there, not a relative one — that is why the line
above carries the full domain.

## 6. Publish on GitHub Pages

```bash
git init -b main
git add -A
git commit -m "Portfolio site"
```

Create an empty repo on GitHub, then:

```bash
git remote add origin https://github.com/<handle>/<repo>.git
git push -u origin main
```

Turn it on: **repo → Settings → Pages → Source: Deploy from a branch →
branch `main`, folder `/ (root)` → Save.** Live in about a minute at
`https://<handle>.github.io/<repo>/`.

For `https://<handle>.github.io/` with no sub-path, name the repo exactly
`<handle>.github.io`.

## 7. Preview locally

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. Opening `index.html` directly works too.

---

## Making it yours

Everything visual is a CSS variable at the top of `assets/css/style.css`:

```css
--gold:   #c9a227;   /* primary accent, rules, numerals    */
--violet: #7b3fe4;   /* secondary glow, card underlight    */
--blood:  #a01e12;   /* reserved for alerts / future use   */
--void:   #06060a;   /* page background                    */
```

Change `--gold` and the whole site re-tunes — nav, frames, seal, counters.

**Motion.** The rotating marks, drifting particles, card tilt, counters and scroll
reveals all check `prefers-reduced-motion` and switch themselves off. With
JavaScript disabled the page still reads top to bottom in English.

**Performance.** One stylesheet, two small scripts, one Google Fonts request. The
only image above the fold is your own portrait.
