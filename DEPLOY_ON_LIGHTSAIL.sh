#!/bin/bash
echo "========================================================"
echo "  ModuQuote Server Deployment Script"
echo "  Run this on your AWS Lightsail Ubuntu Server"
echo "========================================================"
echo ""

# Update and Install Docker
echo "[1/4] Installing Docker..."
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git

# Firewall Setup
echo "[2/4] Configuring Firewall..."
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow ssh
echo "y" | sudo ufw enable

# Clone Repository
echo "[3/4] Cloning Repository..."
read -p "Enter your GitHub Repository URL: " REPO_URL
git clone $REPO_URL app
cd app

# Build and Run
echo "[4/4] Starting Application..."
sudo docker-compose up -d --build

echo ""
echo "========================================================"
echo "  Deployment Complete!"
echo "  Access your app at http://$(curl -s ifconfig.me):3000"
echo "========================================================"
