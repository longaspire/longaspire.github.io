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
2. `./deploy.sh` builds to `_site/` and syncs to production repo (`longaspire.github.io`)
3. Production repo is force-pushed to `origin master` on GitHub Pages
4. Source backup is committed with timestamp and pushed to source repo

### Site Configuration
- Base URL: `""` (served at root)
- Site URL: `https://longaspire.github.io`
- Google Analytics ID: `UA-160136605-1`
- Math rendering: MathJax via kramdown