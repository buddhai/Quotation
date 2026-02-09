# AWS Lightsail Deployment Guide (Step-by-Step)

Follow these steps exactly to get your `ModuQuote` (Quotation SaaS) live on the internet! 🚀

## Phase 1: Create Your Server (AWS Lightsail)

1.  **Log in to AWS Lightsail**:
    *   Go to: [https://lightsail.aws.amazon.com/](https://lightsail.aws.amazon.com/)
    *   Log in with your AWS account.

2.  **Create an Instance**:
    *   Click the big orange **"Create instance"** button.
    *   **Instance location**: Leave default (e.g., Seoul / ap-northeast-2).
    *   **Platform**: Select **Linux/Unix**.
    *   **Blueprint**: Select **Ubuntu 24.04 LTS**.
    *   **Instance plan**: Choose the **$5 USD** (or $3.50) plan. It's plenty for starting out.
    *   **Identify your instance**: Name it `moduquote-server`.
    *   Click **"Create instance"** at the bottom.

3.  **Wait for Running**:
    *   It will show "Pending" (gray) -> "Running" (colorful). Usually takes 1-2 minutes.
    *   Once Running, click the **orange terminal icon** (>_) next to the instance name to open a browser-based SSH terminal.

---

## Phase 2: Server Setup (One-Click Command)

In the black terminal window that popped up, **copy and paste ONLY the following command block** (all at once) and press Enter. This will install Docker and get your server ready.

```bash
# Update system and install Docker
sudo apt-get update && sudo apt-get install -y docker.io docker-compose git

# Allow traffic on port 3000 (Next.js) & 80 (HTTP)
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow ssh
echo "y" | sudo ufw enable

# Verify installation
docker --version
docker-compose --version
echo "Server Setup Complete! Ready for deployment."
```

---

## Phase 3: Bringing Your Code to the Server

Since your code is currently on your local PC, we need to move it to the server. The easiest way without complex Git setup is to use **SCP (Secure Copy)** or simply **clone from GitHub** if you pushed it earlier.

**Option A: Using GitHub (Empowered & Recommended)**
*(If you have pushed your code to a public/private repository)*

1.  In the Lightsail terminal:
    ```bash
    git clone https://github.com/YOUR_GITHUB_USERNAME/quotation-saas.git
    cd quotation-saas
    ```
2.  Create your `.env` file (if needed):
    ```bash
    nano .env
    # Paste your environment variables here
    # Press Ctrl+X, then Y, then Enter to save.
    ```
3.  **Launch!**
    ```bash
    sudo docker-compose up -d --build
    ```

**Option B: "I haven't pushed code anywhere" (Manual Upload)**
If code is only on your local PC, we will use a simpler method to *simulate* a push by just creating the necessary files on the server directly for a quick test.

*(But seriously, using GitHub is 100x easier. Please push your code to GitHub first!)*

---

## Phase 4: Access Your Site

1.  Go back to the Lightsail Dashboard.
2.  Copy the **Public IP** address (e.g., `54.123.45.67`) shown on your instance card.
3.  Open your browser and go to: `http://<YOUR_PUBLIC_IP>:3000`

**🎉 Congratulations! Your SaaS is now LIVE.**

---

## Troubleshooting
*   **"Site can't be reached"**: Ensure `sudo ufw allow 3000` was run successfully. Also check Lightsail "Networking" tab -> Add Rule -> Custom TCP, Port 3000.
*   **"Database error"**: Ensure you are running with `sudo docker-compose`.
