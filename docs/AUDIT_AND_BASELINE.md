# Toolbox Pro — Repository Audit & Design Foundation

## 1. Project Overview & Audit

- **Application:** ToolBox Pro (In-browser file converter, compressor, developer utilities, and productivity suite)
- **Deployment Target:** Vercel (`https://toolbox-pro-sooty.vercel.app/`)
- **Git Remote:** `https://github.com/ArifAli8866/toolbox-pro`
- **Framework & Core Stack:**
  - Next.js 16 (App Router, Turbopack)
  - React 19
  - Tailwind CSS v4 (@tailwindcss/postcss)
  - TypeScript 5.9
  - Client-side processing libraries: `pdf-lib`, `qrcode`, `@imgly/background-removal`, `tesseract.js`, `dompurify`, `marked`, `file-saver`, `jszip`

## 2. Design References & Visual Architecture

### A. Local Screenshots Review
1. `29b6e9be71502b34dc81f0411fadd777.webp`:
   - Full landing page showing VinoMa SaaS design style.
   - Clean pastel pill badges ("Highlights", "Integration", "Features").
   - Soft off-white backgrounds with subtle ambient blur glows.
   - Structured card grids with refined 1px neutral borders and soft drop shadows.
   - Elegant typography with clear hierarchy and generous spacing.
2. `74253b9255fe5121b7de37e913758220.webp`:
   - Desktop and tablet comparison showing card layouts, interactive controls, and pill toggles.

### B. UI Reference Inspirations
1. **TailAdmin Dashboard:**
   - Collapsible navigation sidebar with active indicator pills and category groupings.
   - Polished top navigation bar with search bar trigger, breadcrumbs, notification/user cues, and theme switch.
   - Crisp data presentation and structured tool cards.
2. **Catmin Integration Management:**
   - Integration cards with tool icon, title, description, category badge, and status indicators.
   - Category filter tabs ("All", "Document", "Image", "Developer", "Productivity").
   - Action controls and clean card border hover states.
3. **Framer SaaS Polish:**
   - Restrained color palette (indigo/violet primary, deep slate dark mode, crisp cool gray borders).
   - Fast, purposeful micro-interactions and smooth layout transitions.
   - Zero generic or unfinished UI elements.

## 3. Baseline Audit & Code Review Findings

1. **Lint & Code Quality:**
   - Baseline lint run identified 17 problems (8 errors, 9 warnings), including:
     - Synchronous `setState` inside an effect (`AnimatedCounter` in `src/app/page.tsx`).
     - Unescaped entity quotes in JSX (`'`, `"`).
     - Missing `alt` props on image elements and missing Next.js `<Image />` optimization where applicable.
2. **Tool Implementation Issues:**
   - `src/lib/pdfConverter.ts`: `pdfToImages` was a non-functional stub that threw `throw new Error('PDF to image conversion requires PDF.js library...')`. Needs proper browser-native rendering or clean canvas fallback.
   - Lack of global search (`Cmd+K` / `Ctrl+K`) across the 20+ utilities.
   - Navigation lacked a sidebar shell and dark mode support was incomplete.
   - User favorites and recent history were not persisted.
   - Batch operations were missing multi-file queues and ZIP download options.

## 4. Design Tokens Established

- **Light Mode Surface:** `#f8fafc` background, `#ffffff` card surface, `#e2e8f0` border.
- **Dark Mode Surface:** `#090d16` background, `#0f172a` card surface, `#1e293b` border.
- **Brand Accent:** `#6366f1` (Indigo 500) to `#4f46e5` (Indigo 600) with purple accents.
- **Semantic Badges:**
  - Active / Client-Side: Emerald (`#10b981`)
  - Popular: Indigo / Violet (`#6366f1`)
  - AI Powered: Fuchsia / Pink (`#d946ef`)
  - New: Cyan (`#06b6d4`)

## 5. 10 Git Commit Milestones Plan

1. `chore: audit project and establish design foundation`
2. `feat: redesign application shell and navigation`
3. `feat: build premium toolbox dashboard`
4. `feat: add global tool search and personalization`
5. `feat: upgrade image and media utilities`
6. `feat: improve pdf and document workflows`
7. `feat: enhance developer and text utilities`
8. `feat: add batch workflows and utility enhancements`
9. `feat: polish motion responsive layouts and accessibility`
10. `test: finalize regression checks and production readiness`
