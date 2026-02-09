@echo off
echo ========================================================
echo   ModuQuote Vercel Deployment Script
echo   This script will log you into Vercel and deploy the app.
echo ========================================================
echo.

echo [1/2] Checking Vercel Login...
call npx vercel login
if %errorlevel% neq 0 (
    echo Login failed or cancelled.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Deploying to Production...
call npx vercel --prod
if %errorlevel% neq 0 (
    echo Deployment failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo   Deployment Complete!
echo   Your live URL is shown above.
echo ========================================================
pause
