<div align="center">

# 🧰 ToolBox Pro
### High-Performance, Privacy-First Browser Utility Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-FCC72B?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Privacy: Zero Server Upload](https://img.shields.io/badge/Privacy-100%25%20Client--Side-22C55E?style=for-the-badge&logo=lock)](https://toolbox-pro-sooty.vercel.app/)

**Live Application:** [toolbox-pro-sooty.vercel.app](https://toolbox-pro-sooty.vercel.app/)  
**GitHub Repository:** [github.com/ArifAli8866/toolbox-pro](https://github.com/ArifAli8866/toolbox-pro)

</div>

---

## 🌟 Introduction

**ToolBox Pro** is a modern SaaS-quality utility suite engineered for developers, designers, and digital creators. Inspired by the structured dashboards of **TailAdmin**, the refined card systems of **Catmin Integration Management**, and the smooth interactions of **Framer**, ToolBox Pro provides a unified workspace for 24+ high-utility operations.

### 🛡️ 100% Client-Side Privacy Guarantee
Unlike traditional cloud conversion websites that transfer your sensitive documents and photos to untrusted remote servers:
- **Zero Document Uploads:** Every byte is processed directly in your browser using modern Web APIs (`Canvas`, `Web Crypto`, `PDF.js`, `Tesseract.js`, `JSZip`, and `DOMPurify`).
- **No Third-Party Tracking:** No invasive tracking scripts, cookies, or analytics spying on your files.
- **Offline & Low-Bandwidth Resilient:** Process multi-megabyte PDFs and images instantly without relying on upstream upload bandwidth.

---

## 🚀 Key Features & Architectural Highlights

- **Desktop & Mobile AppShell:**
  - Collapsible desktop sidebar with persistent layout memory (`localStorage`).
  - Mobile slide-over navigation drawer with touch gestures and `Escape` dismiss.
  - Interactive breadcrumbs and page headers across all sub-tools.
- **Global Command Palette (`Cmd+K` / `Ctrl+K`):**
  - Instant modal tool search with live fuzzy filtering, category tabs, and keyboard arrows (`↑`, `↓`, `Enter`).
- **Personalization Engine:**
  - Add / remove favorite tools with one click.
  - Tracks recently used tools with zero server persistence.
  - Client-side Activity & Workflow Log with one-click export and purge.
- **Multi-Theme System:**
  - True Dark Mode, Light Mode, and System Theme sync with zero layout shifts.
- **Batch Processing & ZIP Archival:**
  - Multi-file image compression queues with batch ZIP downloads (`JSZip`).
  - Batch File Renamer with sequential numbering, prefix/suffix, find-and-replace, and case conversion.
  - Multi-size Favicon Package Generator (`16x16`, `32x32`, `48x48`, `180x180`, `192x192`, `512x512`) with copyable HTML head tags.

---

## 🧰 Complete Tool Catalog

| Category | Tool | Capabilities | Processing Engine |
| :--- | :--- | :--- | :--- |
| **File & PDF** | **File Converter** | Convert PNG, JPG, WebP, GIF, BMP; merge PDFs, rotate pages, reorder pages, extract pages, split PDFs | `Canvas` + `pdf-lib` + `pdfjs-dist` |
| **File & PDF** | **File Compressor** | Real-time quality slider, dimension resizing, aspect-ratio lock, side-by-side comparison, batch ZIP download | `Canvas` bicubic rendering |
| **File & PDF** | **Media Downloader** | Direct media stream downloader with extraction guides for major social platforms | Direct stream API |
| **AI Studio** | **AI Background Remover** | Segment subject and export transparent PNGs directly in browser | `@imgly/background-removal` (WASM) |
| **AI Studio** | **Image to Text (OCR)** | Extract text and tables from photos, documents, and screenshots | `Tesseract.js` (Web Worker) |
| **Developer** | **Advanced JSON Workspace** | Beautify, minify, validate with precise line/column syntax error detection | Native JSON engine + Error Parser |
| **Developer** | **Text Diff Checker** | Side-by-side line comparison with color-coded additions, deletions, and unchanged lines | LCS Diff Algorithm (`diffUtils`) |
| **Developer** | **CSV ↔ JSON Converter** | Bi-directional tabular parsing, auto delimiter detection, and JSON array export | Custom CSV Engine (`diffUtils`) |
| **Developer** | **Case Converter & Cleaner** | 12+ text transformations (camelCase, snake_case, PascalCase, slug, uppercase, trim) | RegEx Transformer |
| **Developer** | **Word & Reading Counter** | Character, word, sentence, paragraph counter with reading/speaking estimates and keyword density | Text Analysis Engine |
| **Utilities** | **Secure Password Generator** | Cryptographically strong random passwords with entropy meter and custom character sets | `crypto.getRandomValues()` |
| **Utilities** | **QR Code Generator** | URLs, WiFi, contact cards, and text with custom dimensions and PNG export | `qrcode` |
| **Utilities** | **Base64 Encoder / Decoder** | UTF-8 text and raw file-to-Base64 encoding/decoding | Browser `btoa` / `atob` / `FileReader` |
| **Utilities** | **URL Encoder / Decoder** | Encode/decode URL query parameters with UTF-8 compliance | `encodeURIComponent` / `decodeURIComponent` |
| **Utilities** | **Color Palette Studio** | Harmonious color schemes (HEX, RGB, HSL) with one-click clipboard copying | Color math engine |
| **Utilities** | **WCAG Contrast Checker** | Contrast ratio test against WCAG 2.1 AA & AAA standards with interactive preview | WCAG Relative Luminance formula |
| **Utilities** | **SVG to PNG Converter** | Render vector SVG files into crisp raster PNGs at custom scale | HTML5 Canvas vector renderer |
| **Utilities** | **Web Crypto Hash Generator** | Compute SHA-256, SHA-512, SHA-384, SHA-1 checksums | `crypto.subtle.digest()` |
| **Utilities** | **JWT Inspector** | Decode JWT headers, payload claims, and expiration dates with 0 network transmission | Base64Url JSON Decoder |
| **Utilities** | **UUID v4 Generator** | Cryptographically secure bulk UUID generation (up to 100) with compact formatting | `crypto.randomUUID()` |
| **Productivity** | **Favicon & App Icon Studio** | Generate standard favicon sets (`16`, `32`, `48`, `180`, `192`, `512px`) bundled in ZIP with HTML head tags | `Canvas` + `JSZip` |
| **Productivity** | **Batch File Renamer** | Sequential numbering (`{name}_{n}`), prefix/suffix, search/replace, case formatting, and ZIP export | `JSZip` |
| **Productivity** | **Website Screenshot** | Viewport website capture with direct PNG download | Microlink rendering API |
| **Productivity** | **Currency & Unit Converter** | Real-time forex rates plus conversion across length, weight, temperature, area, volume, and speed | Live Forex API + Unit matrices |
| **Productivity** | **Live Markdown Studio** | GitHub Flavored Markdown editor with live preview, DOMPurify sanitization, and HTML export | `Marked.js` + `DOMPurify` |
| **Productivity** | **Activity & Workflow Log** | Client-side tracking of user operations in localStorage | `workflowHistory` engine |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Cmd + K` or `Ctrl + K` | Open Global Tool Search | Application-wide |
| `Escape` | Dismiss modal dialogs, drawers, or search | Dialogs & Drawers |
| `↑` / `↓` | Navigate search results | Command Palette |
| `Enter` | Launch selected tool | Command Palette |

---

## 📁 Repository Structure

```
Tool-box_Upgrade/
├── public/                 # Static assets, icons, and manifests
├── src/
│   ├── app/                # Next.js 16 App Router pages
│   │   ├── page.tsx        # Dashboard & tool directory with category filters
│   │   ├── layout.tsx      # Root HTML shell with ThemeProvider
│   │   ├── globals.css     # Design tokens, keyframe animations, dark mode rules
│   │   ├── compressor/     # File & image compressor with quality slider & ZIP
│   │   ├── converter/      # File converter & PDF operations (merge, split, rotate)
│   │   ├── downloader/     # Media link downloader with social guides
│   │   ├── image-tools/    # AI Studio (Background Remover & Tesseract OCR)
│   │   ├── text-tools/     # Developer tools (JSON, Diff, CSV-JSON, Case, Counter)
│   │   ├── utilities/      # Utilities (Password, QR, Base64, URL, Color, WCAG, Hash, JWT, UUID)
│   │   └── more-tools/     # Productivity (Favicon, Batch Renamer, Screenshot, Currency, Markdown)
│   ├── components/         # Reusable design system components
│   │   ├── AppShell.tsx    # Responsive shell (collapsible sidebar, header, footer)
│   │   ├── Sidebar.tsx     # Navigation drawer with active route pills
│   │   ├── Header.tsx      # Top bar with breadcrumbs, Cmd+K trigger, theme toggle
│   │   ├── SearchDialog.tsx# Command palette with fuzzy search & favorite pinning
│   │   ├── ToolCard.tsx    # Card component with category badges & hover states
│   │   ├── ThemeToggle.tsx # Light/Dark/System theme selector
│   │   ├── ThemeProvider.tsx # Theme context manager
│   │   ├── Toast.tsx       # Toast notifications provider
│   │   ├── Breadcrumbs.tsx # Dynamic hierarchical navigation links
│   │   └── Footer.tsx      # Platform footer
│   ├── lib/                # Core utility algorithms & domain logic
│   │   ├── toolsCatalog.ts # Single source of truth for all tools and categories
│   │   ├── personalization.ts # Favorites & recent tools persistence
│   │   ├── workflowHistory.ts # Activity logger
│   │   ├── imageCompressor.ts # Client-side image compression & format resizing
│   │   ├── pdfConverter.ts # PDF-to-image & image-to-PDF rendering via PDF.js
│   │   ├── pdfUtils.ts     # PDF page rotation, reordering, extraction via pdf-lib
│   │   ├── diffUtils.ts    # LCS diff algorithm & CSV-JSON bi-directional engine
│   │   ├── faviconGenerator.ts # Multi-size favicon pack & JSZip bundler
│   │   └── batchRenamer.ts # Multi-file batch renaming rules engine
│   └── tests/              # Vitest test suites
│       ├── developerUtils.test.ts
│       └── batchAndProductivity.test.ts
├── eslint.config.mjs       # ESLint flat config with Next.js Core Web Vitals
├── tsconfig.json           # TypeScript configuration
└── package.json            # Scripts & project dependencies
```

---

## 🛠️ Local Development & Quality Assurance

### Prerequisites
- Node.js `18.x` or higher
- npm `9.x` or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/ArifAli8866/toolbox-pro.git
cd toolbox-pro

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
# Open http://localhost:3000 in your browser
```

### Verification & Test Suite
```bash
# Run unit tests (Vitest)
npm test

# Run ESLint validation
npm run lint

# Run TypeScript typecheck
npm run typecheck

# Build optimized production bundle
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Built with passion by [Arif Ali](https://github.com/ArifAli8866).
