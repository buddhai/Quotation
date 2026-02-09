# Deployment Guide

You can deploy this application in two main ways: using Docker (recommended) or Vercel.

## 1. Docker Deployment (Recommended for ease of use)
Since this app uses a local SQLite database, deploying with Docker is the easiest method as it bundles the database with the app.

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### How to Run
1. Open a terminal in the project folder.
2. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
3. Open your browser and go to `http://localhost:3000`.

To stop the app:
```bash
docker-compose down
```

---

## 2. Vercel Deployment (Fastest for public URL)
We have prepared a script to automate this.

### Steps
1. Double-click `DEPLOY_TO_VERCEL.bat` in the project folder.
2. Follow the on-screen instructions to log in (browser will open).
3. The script will automatically build and deploy your app.
4. Once finished, it will display your **Live URL**.

**Note:** Vercel does not support persistent SQLite databases in the same way as a local file. Data created on the live Vercel URL might be reset on new deployments unless you use a cloud database (like Vercel Postgres).

## 3. Local Production Run
To test the production build on your own machine without Docker:

1. Build the app:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Visit `http://localhost:3000`.
