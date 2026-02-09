@echo off
echo ========================================================
echo   ModuQuote GitHub Push Helper
echo   This script will help you push your code to GitHub.
echo ========================================================
echo.

echo [1/3] Checking for Git...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/download/win
    echo After installing, run this script again.
    pause
    exit /b 1
)

echo.
echo [2/3] Initializing Git Repository...
if not exist .git (
    git init
    echo Git repository initialized.
)

echo.
echo [3/3] Preparing to Push...
git add .
git commit -m "Initial commit for ModuQuote SaaS"

echo.
echo Please enter your GitHub Repository URL (e.g., https://github.com/username/repo-name.git):
set /p REPO_URL=Repository URL: 

if "%REPO_URL%"=="" (
    echo Repository URL cannot be empty.
    pause
    exit /b 1
)

git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ========================================================
echo   Push Complete!
echo   Now you can pull this code on your Lightsail server.
echo ========================================================
pause
