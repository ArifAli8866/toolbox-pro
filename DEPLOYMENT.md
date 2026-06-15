# 🚀 Deployment Guide — ToolBox Pro

This guide walks you through pushing your code to **GitHub** and deploying it to **Vercel** (free hosting). No coding experience required!

---

## 📋 Prerequisites

Before you start, make sure you have:

1. ✅ **A GitHub account** — Sign up free at [github.com](https://github.com)
2. ✅ **Git installed** — Check by running `git --version` in your terminal
3. ✅ **A Vercel account** — Sign up free at [vercel.com](https://vercel.com) (you can sign in with your GitHub account)

---

## Step 1: Initialize Git in Your Project

Open a terminal (Command Prompt / Terminal / VS Code terminal) **in your project folder** and run these commands one by one:

```bash
# Initialize a new Git repository
git init

# Add all your files to Git
git add .

# Create your first commit (save point)
git commit -m "Initial commit: ToolBox Pro"
```

> **💡 What this does:** Git is a version control system. These commands start tracking your files and create a "snapshot" (commit) of your current project.

---

## Step 2: Create a Repository on GitHub

1. Go to **[github.com/new](https://github.com/new)**
2. Fill in the form:
   - **Repository name:** `toolbox-pro` *(you can choose any name)*
   - **Description:** `Free online file converter, compressor & utilities` *(optional)*
   - **Visibility:** Select **Public** ⚪ *(recommended — required for free Vercel hobby plan)*
   - **⚠️ IMPORTANT:** Do NOT check any of these:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - *(We already have these files in the project, so leave them unchecked)*
3. Click the green **"Create repository"** button

---

## Step 3: Connect and Push Your Code to GitHub

After creating the repo, GitHub shows you a page with commands. Copy and run these in your terminal
*(replace `YOUR_USERNAME` with your actual GitHub username)*:

```bash
# Rename your main branch to "main"
git branch -M main

# Connect your local project to GitHub
git remote add origin https://github.com/YOUR_USERNAME/toolbox-pro.git

# Upload (push) your code to GitHub
git push -u origin main
```

### 🔑 Authentication Help

When you run `git push`, Git may ask for your username and password.

- **Username:** Your GitHub username
- **Password:** You CANNOT use your normal GitHub password. Use a **Personal Access Token (PAT)** instead:

**To create a Personal Access Token:**
1. Go to GitHub → click your profile picture (top-right) → **Settings**
2. Scroll down the left sidebar → click **Developer settings** (at the bottom)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **"Generate new token"** → **"Generate new token (classic)"**
5. Fill in:
   - **Note:** `Vercel deployment` *(just a label)*
   - **Expiration:** 90 days *(or whatever you prefer)*
   - **Scopes:** ✅ Check **`repo`** *(this selects all repo permissions)*
6. Click **"Generate token"** at the bottom
7. **⚠️ COPY THE TOKEN NOW** — you won't be able to see it again!
8. Paste this token as your "password" when Git asks

✅ **Success!** Your code is now on GitHub. Refresh your repo page to see all your files.

---

## Step 4: Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** and click **"Log In"**
2. Click **"Continue with GitHub"** and authorize Vercel to access your GitHub
3. Click **"Add New..."** → **"Project"** *(top-right corner)*
4. Find your `toolbox-pro` repository and click **"Import"**
   - *(If you don't see it, click "Adjust GitHub App Permissions" to grant access)*

### Vercel Settings (everything auto-detects — just verify):
| Setting | Value |
|---------|-------|
| Framework Preset | Next.js ✅ *(auto-detected)* |
| Build Command | `next build` ✅ *(auto-detected)* |
| Output Directory | `.next` ✅ *(auto-detected)* |
| Install Command | `npm install` ✅ *(auto-detected)* |
| Environment Variables | *(none needed — leave blank)* |

5. Click the blue **"Deploy"** button 🎉

### ⏳ Wait for the build
Vercel will now build your app (this takes ~1-2 minutes). You'll see a progress screen with logs.

### ✅ Done!
When you see the **"Congratulations!"** screen with confetti, your app is live! Click **"Visit"** to see your deployed website.

Your URL will look like: **`https://toolbox-pro.vercel.app`**

---

## Step 5: (Optional) Add a Custom Domain

1. In your Vercel dashboard, click your project
2. Go to **Settings** → **Domains**
3. Click **"Add"** and type your domain (e.g., `mytoolbox.com`)
4. Vercel shows you DNS records — add them at your domain registrar (GoDaddy, Namecheap, etc.)
5. Wait for DNS to propagate (can take a few minutes to hours)

---

## 🔄 How to Update Your Website Later

Whenever you change your code, push the updates to GitHub and Vercel **auto-deploys** automatically:

```bash
# After making changes to your code:
git add .
git commit -m "Added a new feature"
git push
```

Vercel detects the push and rebuilds your site automatically! 🚀

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `git push` asks for password | Use a **Personal Access Token**, not your GitHub password (see Step 3) |
| Vercel build fails | Check the build logs in Vercel → click on the failed deployment |
| Can't see repo in Vercel | Click "Adjust GitHub App Permissions" and grant access |
| `command not found: git` | Install Git from [git-scm.com](https://git-scm.com) |
| Build succeeds but page is blank | Wait 1-2 min for CDN propagation, then refresh |

---

## 📞 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **GitHub Docs:** [docs.github.com](https://docs.github.com)
- **Git Cheatsheet:** [github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf](https://education.github.com/git-cheat-sheet-education.pdf)

Happy deploying! 🎉
