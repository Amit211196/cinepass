@echo off
REM CinePass Backend Deployment Script for AWS Elastic Beanstalk
REM This script automates the entire backend deployment process

setlocal enabledelayedexpansion

cls
echo ============================================
echo CinePass Backend Deployment Script
echo ============================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Maven
if not exist "mvnw.cmd" (
    echo ERROR: Maven wrapper not found. Please run from Backend directory.
    exit /b 1
)

REM Check EB CLI
where eb >nul 2>nul
if errorlevel 1 (
    echo ERROR: EB CLI not found. Install with: pip install awsebcli
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

REM Build the application
echo Building Spring Boot application...
call mvnw.cmd clean package -DskipTests

if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

echo Build successful
echo.

REM Initialize Elastic Beanstalk
if not exist ".elasticbeanstalk" (
    echo Initializing Elastic Beanstalk...

    set /p APP_NAME="Enter application name (default: cinepass): "
    if "!APP_NAME!"=="" set APP_NAME=cinepass

    set /p REGION="Enter region (default: us-east-1): "
    if "!REGION!"=="" set REGION=us-east-1

    call eb init -p "Java 21" !APP_NAME! --region !REGION!

    echo Elastic Beanstalk initialized
) else (
    echo Elastic Beanstalk already initialized
)
echo.

REM Deploy to Elastic Beanstalk
echo Deploying to Elastic Beanstalk...

REM Check if environment exists
for /f "tokens=*" %%A in ('eb list 2^>nul') do (
    echo !line! | findstr /R "^\*" >nul
    if !errorlevel!==0 (
        set ENV_NAME=%%A
        set ENV_NAME=!ENV_NAME:*=!
    )
)

if "!ENV_NAME!"=="" (
    echo Creating new Elastic Beanstalk environment...

    set /p ENV_NAME="Enter environment name (default: cinepass-env): "
    if "!ENV_NAME!"=="" set ENV_NAME=cinepass-env

    set /p RDS_ENDPOINT="Enter RDS endpoint (e.g., cinepass-db.XXXXX.us-east-1.rds.amazonaws.com): "
    set /p RDS_USER="Enter RDS username (default: cinepassadmin): "
    if "!RDS_USER!"=="" set RDS_USER=cinepassadmin

    set /p RDS_PASSWORD="Enter RDS password: "

    echo Creating environment !ENV_NAME!...
    call eb create !ENV_NAME! ^
        --instance-type t2.micro ^
        --envvars SPRING_PROFILES_ACTIVE=prod,SPRING_DATASOURCE_URL="jdbc:postgresql://!RDS_ENDPOINT!:5432/cinepass",SPRING_DATASOURCE_USERNAME="!RDS_USER!",SPRING_DATASOURCE_PASSWORD="!RDS_PASSWORD!"

    echo Environment created
) else (
    echo Deploying to existing environment: !ENV_NAME!
    call eb deploy
    echo Deployment complete
)
echo.

echo ============================================
echo Deployment Complete!
echo ============================================
echo.

echo Useful commands:
echo   eb status       - Check environment status
echo   eb health       - Check instance health
echo   eb logs         - View application logs
echo   eb open         - Open in browser
echo   eb deploy       - Deploy changes
echo   eb terminate    - Delete environment
echo.

endlocal

