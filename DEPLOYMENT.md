# Deployment Guide: T24 Watches MERN Stack

This guide explains how to deploy the T24 Watches storefront application. The **frontend (React/Vite)** is deployed to **Vercel**, and the **backend (Node/Express)** is deployed to **Render**, connected via Vercel Proxy Rewrites to avoid CORS issues.

---

## Step 1: Push Repository to GitHub

We have initialized a local Git repository and committed the code. To publish it to GitHub:

1. Create a new repository on your GitHub account (e.g., named `t24-watches`).
2. Run the following terminal commands inside the project directory:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/t24-watches.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy the Backend to Render

Render will host the Node.js/Express server and connect to MongoDB Atlas and Cloudinary.

1. Go to [Render](https://render.com/) and log in.
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   * **Name**: `t24-watches-backend`
   * **Root Directory**: `server`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Click **Advanced** and add the following **Environment Variables**:
   * `PORT`: `5055`
   * `MONGO_URI`: `mongodb+srv://developerinspitetech_db_user:IHxmQWUKUSKbIkhu@cluster0.bqn54m2.mongodb.net/?appName=Cluster0`
   * `JWT_SECRET`: *(Create a secure random string, e.g. `yourSuperSecureJwtSecretKey`)*
   * `CLOUDINARY_CLOUD_NAME`: `dwqxzzqpn`
   * `CLOUDINARY_API_KEY`: `166385748614328`
   * `CLOUDINARY_API_SECRET`: `Cnc2G4jSlw-XDDvTlu72r1izalQ`
6. Click **Deploy Web Service**.
7. Once deployed, note down your backend URL (e.g. `https://t24-watches-backend.onrender.com`).

---

## Step 3: Link Vercel to the Backend

To allow the frontend to route requests to the Render backend, update `vercel.json` in the root of your project:

1. Open `vercel.json` in your editor.
2. Add a proxy rewrite directing `/api` requests to your Render URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://YOUR_BACKEND_URL_ON_RENDER/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
3. Commit and push the change:
   ```bash
   git add vercel.json
   git commit -m "chore: configure vercel rewrites proxy for Render backend"
   git push
   ```

---

## Step 4: Deploy the Frontend to Vercel

Vercel will build and host your static React/Vite assets.

1. Go to [Vercel](https://vercel.com/) and log in.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Set the following configurations:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `./` (Root folder)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Click **Deploy**.
6. Once complete, your storefront and accessible admin panel will be live on your Vercel URL!
