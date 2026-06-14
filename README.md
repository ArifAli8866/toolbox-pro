# 🔧 ToolBox Pro

**Free Online Tools** — Convert, compress, download, format, and generate — all in your browser.

**15+ professional-grade tools** with zero uploads, zero sign-ups, and zero limits.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/toolbox-pro)

---

## ✨ Features

### File Tools
- **File Converter** — PNG, JPG, WEBP, BMP, GIF ↔ PDF (merge, split, rotate, extract)
- **File Compressor** — Reduce image & PDF sizes with quality control
- **Media Downloader** — Download videos/images from any link (YouTube, direct URLs, etc.)

### Text & Code Tools
- **JSON Formatter** — Format, validate, and minify JSON
- **Case Converter** — 12 text transformations (camelCase, snake_case, Title Case, etc.)
- **Word Counter** — Words, characters, reading time, keyword density

### Utilities
- **Password Generator** — Strong passwords with strength meter
- **QR Code Generator** — Create downloadable QR codes
- **Base64 Encoder/Decoder** — Text and file encoding
- **Color Palette Generator** — Beautiful HEX/RGB/HSL palettes
- **SVG → PNG Converter** — Vector to raster with custom dimensions
- **Hash Generator** — SHA-256, SHA-1, MD5

---

## 🚀 Key Benefits

- ✅ **100% Private** — All processing happens in your browser (no server uploads)
- ✅ **Completely Free** — No sign-up, no limits, no watermarks
- ✅ **Fast** — Instant results, zero upload wait times
- ✅ **Works Offline** — Most tools work after initial page load
- ✅ **No Database Needed** — Pure client-side JavaScript + Next.js

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **pdf-lib** (PDF manipulation)
- **Canvas API** (Image conversion & compression)
- **Web Crypto API** (Password & hash generation)
- **QRCode** (QR generation)

---

## 📦 Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/toolbox-pro.git
cd toolbox-pro

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment (Vercel)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Add your GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/toolbox-pro.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with **GitHub**
3. Click **"Add New Project"**
4. Import your `toolbox-pro` repository
5. Click **Deploy** (no environment variables needed!)

Your site will be live at `https://your-project.vercel.app`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── download/     # Media downloader API
│   │   └── health/       # Health check
│   ├── converter/        # File converter page
│   ├── compressor/       # File compressor page
│   ├── downloader/       # Media downloader page
│   ├── text-tools/       # JSON, Case, Word Counter
│   ├── utilities/        # Password, QR, Base64, Color, etc.
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Toast.tsx
└── lib/
    ├── imageConverter.ts
    ├── imageCompressor.ts
    ├── pdfUtils.ts
    └── pdfConverter.ts
```

---

## 🔒 Privacy & Security

All tools run **entirely in the browser** using:
- Canvas API for images
- `pdf-lib` for PDF operations
- Web Crypto API for passwords & hashes
- Client-side libraries only

**No files are ever uploaded to any server.**

---

## 📄 License

MIT License — Free to use and modify.

---

## 💡 Contributing

Pull requests are welcome! If you have ideas for new tools or improvements, open an issue.

---

**Made with ❤️ — All processing happens in your browser.**
