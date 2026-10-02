# ShelfSearch Website

Last updated: 2026-10-02

## Live links

- Microsoft Store listing: <https://apps.microsoft.com/detail/9MXCMHJT0BZD>
- Product website: <https://nikatsam.github.io/ShelfSearch-Website/>
- Public website repository: <https://github.com/nikatsam/ShelfSearch-Website>
- Private app source repository: <https://github.com/nikatsam/WIN_APP_ShelfSearch>

The app-source repository remains private. GitHub Pages on the Free plan requires a public
repository, so the public `ShelfSearch-Website` repository contains only the static marketing site,
its Pages workflow, and website-specific documentation. The `site/` directory in the app-source
repository is the editable source of truth and is mirrored to the website repository for publishing.

## Publishing

The website is a static GitHub Pages project site. Its publishing workflow is
`.github/workflows/pages.yml` and deploys only the `site/` directory. It runs through the GitHub
Actions **Publish GitHub Pages** workflow (`workflow_dispatch`); normal app-source pushes do not
publish the website automatically.

When changing the marketing site, update `site/` in the private app repository, mirror those changes
to `ShelfSearch-Website`, then run the publishing workflow in the public repository. Do not copy
the app source, project audit files, or build output into the website repository.

Local checks from the app-source repository:

```powershell
node scripts/validate-site.mjs
npx --yes html-validate site/index.html
```

## Search-engine files

- `site/index.html` contains the canonical URL, title and description, Open Graph/Twitter metadata,
  `index,follow`, and truthful `WebSite` and `SoftwareApplication` JSON-LD. The software schema
  points to the Microsoft Store using `installUrl` and `sameAs`.
- `site/sitemap.xml` lists the canonical website URL.
- `site/robots.txt` allows crawlers and advertises the sitemap.
- `site/<key>.txt` is the IndexNow ownership-verification key. Keep the deployed file name and
  contents consistent; the key is public verification data, not an API secret.
- The site is a single page with in-page sections, not a multi-level document hierarchy. Do not add
  a fabricated `BreadcrumbList`; add breadcrumb navigation only if real nested pages are introduced.

The IndexNow key and URL submission must be used only after deployment, when the key file is
publicly reachable. Sitemap submission to Google Search Console, Bing Webmaster Tools, and Yandex
Webmaster also requires ownership verification in each service. Discovery requests do not guarantee
crawling or indexing.

## GitHub Pages caveat

The project site URL is under `/ShelfSearch-Website/`. Crawlers normally request `robots.txt` at the
host root (`https://nikatsam.github.io/robots.txt`), not at a project-site subpath. The project's
`robots.txt` is therefore not a host-root robots policy. The page-level robots meta and directly
submitted sitemap remain available; a controllable root-level robots file would require a root
site or a custom domain. Recheck these URLs if the repository name or domain changes.
