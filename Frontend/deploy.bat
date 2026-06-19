@echo off
REM CinePass Frontend Deployment Script
REM Deploys React frontend to S3 and CloudFront

setlocal enabledelayedexpansion

cls
echo ============================================
echo CinePass Frontend Deployment Script
echo ============================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js/npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js/npm not found. Install from https://nodejs.org/
    exit /b 1
)

REM Check AWS CLI
where aws >nul 2>nul
if errorlevel 1 (
    echo ERROR: AWS CLI not found. Install from https://aws.amazon.com/cli/
    exit /b 1
)

echo All prerequisites satisfied
echo.

set /p BACKEND_API_URL="Enter backend API URL (e.g., http://your-eb-url/api) or leave blank for localhost: "
if not "!BACKEND_API_URL!"=="" (
    if not "!BACKEND_API_URL:~0,1!"=="/" (
        echo !BACKEND_API_URL! | findstr /R /I "^http:// ^https://" >nul
        if errorlevel 1 (
            set BACKEND_API_URL=https://!BACKEND_API_URL!
        )
    )
    if "!BACKEND_API_URL:~-1!"=="/" set BACKEND_API_URL=!BACKEND_API_URL:~0,-1!
    set VITE_API_BASE_URL=!BACKEND_API_URL!
    echo Using API base URL: !VITE_API_BASE_URL!
) else (
    echo No API URL provided, using default localhost API URL
)
echo.

REM Install dependencies and build
echo Installing dependencies and building frontend...
call npm install
call npm run build

if not exist "dist" (
    echo ERROR: Build failed. dist directory not found.
    exit /b 1
)

echo Frontend build successful
echo.

REM Create S3 bucket
set /p BUCKET_NAME="Enter S3 bucket name (must be globally unique, e.g., cinepass-frontend-): "

echo Creating S3 bucket: !BUCKET_NAME!
call aws s3 mb s3://!BUCKET_NAME! --region us-east-1

if errorlevel 1 (
    echo Note: Bucket may already exist. Continuing...
)

echo.

REM Configure S3 for static website
echo Configuring S3 for static website hosting...

call aws s3 website s3://!BUCKET_NAME!/ ^
    --index-document index.html ^
    --error-document index.html ^
    --region us-east-1

REM Create bucket policy
(
    echo {
    echo   "Version": "2012-10-17",
    echo   "Statement": [
    echo     {
    echo       "Sid": "PublicReadGetObject",
    echo       "Effect": "Allow",
    echo       "Principal": "*",
    echo       "Action": "s3:GetObject",
    echo       "Resource": "arn:aws:s3:::!BUCKET_NAME!/*"
    echo     }
    echo   ]
    echo }
) > bucket-policy.json

call aws s3api put-bucket-policy --bucket !BUCKET_NAME! --policy file://bucket-policy.json

del bucket-policy.json

echo S3 configured
echo.

REM Upload to S3
echo Uploading frontend to S3...
call aws s3 sync dist/ s3://!BUCKET_NAME!/ --delete --region us-east-1
echo Upload complete
echo.

echo ============================================
echo Frontend Deployment Complete!
echo ============================================
echo.

echo Next steps:
echo 1. Create CloudFront distribution manually in AWS Console
echo    - Origin: !BUCKET_NAME!.s3.us-east-1.amazonaws.com
echo    - Default Root Object: index.html
echo    - Viewer Protocol Policy: Redirect HTTP to HTTPS
echo.
echo 2. Or use AWS CLI to create distribution
echo    Run: aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
echo.

endlocal

