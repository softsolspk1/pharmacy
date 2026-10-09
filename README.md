# Faculty of Pharmacy & Pharmaceutical Sciences — University of Karachi

Static website for the Faculty of Pharmacy and Pharmaceutical Sciences, University of Karachi.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup (sections, navigation, modals) |
| `styles.css` | Design system and responsive layout |
| `app.js` | Rendering of departments, curriculum, faculty directory, search, tabs and lightbox |
| `data.js` | Content dataset (faculty, departments, curriculum, leadership, calendar), sourced from the Undergraduate Catalogue 2026–27 |
| `assets/img/` | Optimized RGB JPEG images (`faculty/`, `leadership/`, `campus/`, `stock/`) |
| `assets/brand/` | University and Faculty emblems, plus the favicon |
| `catalogue.pdf` | Full undergraduate catalogue, linked from the site |

## Running locally

No build step is needed. Serve the folder with any static server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Image credits

Campus, staff and faculty photographs come from the Faculty's Undergraduate Catalogue 2026–27 and uok.edu.pk.
Laboratory, library and pharmacy photographs in `assets/img/stock/` are from [Unsplash](https://unsplash.com) under the Unsplash License.
