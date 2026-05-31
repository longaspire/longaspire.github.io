# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal academic website hosted on GitHub Pages. The site is deployed in two repos:
- **Source**: `personal_page` (this repo) — Jekyll source code
- **Production**: `longaspire.github.io` — built static site served by GitHub Pages

## Common Commands

### Build & Preview
```bash
# Install dependencies
bundle install

# Build site (outputs to _site/)
bundle exec jekyll build

# Serve locally with live reload
bundle exec jekyll serve
```

### Deployment
```bash
# Full deploy: build → sync to production repo → backup source to GitHub
./deploy.sh
```

The deploy script handles: Jekyll build → copies `_site/` to `/Users/lihuan/Git/longaspire.github.io` → force-pushes to production → commits and pushes source backup. It skips if only `deploy.sh` or `_site/` changed.

### Dependency Management
```bash
bundle update # Update gems
```

## Architecture

### Directory Structure
- `_config.yml` — Jekyll configuration (site title, URL, Google Analytics ID, permalink structure)
- `_data/menu.yml` — Navigation menu items
- `_includes/` — Reusable HTML partials: `head.html`, `header.html`, `footer.html`, `nav.html`, `image.html`
- `_layouts/` — Page templates: `default.html` (wrapper), `page.html`, `post.html`
- `_posts/` — Blog posts in Markdown (filename format: `YYYY-MM-DD-title.md`)
- `publication.md` — Publications list (main data file)
- `publication/` — Subdirectories for publication research projects (dense, e2c2, edge-sketch, flow, ikrq, isqea, itspq, sid, trips, vita)
- `js/` — JavaScript: `publication.js` (publication filtering/dynamic display), `post.js` (post-related JS)
- `_sass/` — Sass stylesheets compiled to `css/main.css`
- `css/` — Compiled CSS output
- `images/` — Site images and icons
- `deploy.sh` — One-click deployment script (see above)

### Key Technologies
- **Jekyll** with `github-pages` gem (kramdown Markdown, MathJax for math)
- **Sass** for styles (compiled to CSS)
- **Google Analytics** for traffic tracking (configured in `_config.yml`)
- No testing framework — changes are validated by previewing locally before deploy

### Deployment Flow
1. Source repo (`personal_page`) contains Jekyll source
2. `./deploy.sh` builds to `_site/` and syncs to the production repository
3. Production repo is force-pushed to `origin master` on GitHub Pages
4. Source backup is committed with timestamp and pushed to source repo

### Site Configuration
- Base URL: `""` (served at root)
- Site URL: `https://longaspire.github.io`
- Google Analytics ID: `UA-160136605-1`
- Math rendering: MathJax via kramdown

## Publication Maintenance

### Publication Data Source
Publications are managed in two places:
- **`publication.md`** — The rendered page shown on the website
- **Paper overview JSON** (maintained locally) — Source of truth for DOIs, titles, authors, venues

When updating publications, cross-reference both files. The JSON is the authoritative source for DOI data.

### Adding a New Publication
1. Add the entry to the appropriate year section in `publication.md` (before the next year's `<h2>` tag)
2. Follow the existing HTML format:
```html
<li>
    Paper Title Here.<br>
    Authors with <b>Huan Li</b> in bold.<br>
    <i>Venue with <b>CCF-X</b> and <b>CORE-X</b> tags.</i><br>
    <a href="https://doi.org/..." target="_blank">
        <div class="color-button">DOI</div>
    </a>
    <a>
        <div class="color-button-type">CONFERENCE</div>
    </a>
    <a>
        <div class="color-button-tag">CCF-A</div>
    </a>
    <a>
        <div class="color-button-tag">CORE-A*</div>
    </a>
</li><br>
```
3. Set `href="#"` if DOI is not yet available

### Fixing DOIs in Publication.md
Common issues and fixes:
- **Missing DOI**: Entry has `href="#"` — replace with correct DOI from paper-overview.json
- **Duplicate DOIs**: Two papers sharing same DOI — one is wrong, check paper-overview.json
- **Malformed URL**: e.g., `https://doi.org/...ij` — remove trailing garbage characters
- **Duplicate entries**: Same paper appears twice — remove the duplicate block

### DOI Format Guidelines
- Standard DOI: `https://doi.org/10.xxxx/...`
- OpenReview DOI: `https://openreview.net/forum?id=...`
- ACL Anthology: `https://aclanthology.org/...`
- ICML virtual: `https://icml.cc/virtual/2025/poster/...` (not a standard DOI — use as-is if no DOI available)