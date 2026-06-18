@echo off
REM CinePass Database Setup Script
REM Creates RDS PostgreSQL instance on AWS

setlocal enabledelayedexpansion

cls
echo ============================================
echo CinePass Database Setup Script
echo ============================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check AWS CLI
where aws >nul 2>nul
if errorlevel 1 (
    echo ERROR: AWS CLI not found. Install from https://aws.amazon.com/cli/
    exit /b 1
)

echo AWS CLI found
echo.

REM Get user input
echo Enter database configuration:

set /p DB_INSTANCE_ID="Database instance identifier (default: cinepass-db): "
if "!DB_INSTANCE_ID!"=="" set DB_INSTANCE_ID=cinepass-db

set /p DB_USER="Master username (default: cinepassadmin): "
if "!DB_USER!"=="" set DB_USER=cinepassadmin

set /p DB_PASSWORD="Master password (min 8 characters): "

set /p STORAGE="Allocated storage in GB (default: 20, free tier max): "
if "!STORAGE!"=="" set STORAGE=20

set /p REGION="Region (default: us-east-1): "
if "!REGION!"=="" set REGION=us-east-1

echo.

REM Create RDS instance
echo Creating RDS PostgreSQL instance...
echo Instance ID: !DB_INSTANCE_ID!
echo Username: !DB_USER!
echo Region: !REGION!
echo.

call aws rds create-db-instance ^
    --db-instance-identifier !DB_INSTANCE_ID! ^
    --db-instance-class db.t3.micro ^
    --engine postgres ^
    --engine-version 15.3 ^
    --master-username !DB_USER! ^
    --master-user-password !DB_PASSWORD! ^
    --allocated-storage !STORAGE! ^
    --publicly-accessible ^
    --storage-type gp2 ^
    --region !REGION! ^
    --no-multi-az ^
    --backup-retention-period 7

if errorlevel 1 (
    echo ERROR: Failed to create database instance
    exit /b 1
)

echo Database instance creation initiated
echo.

echo Waiting for database to be available (this may take 5-10 minutes)...
echo You can check status manually:
echo   aws rds describe-db-instances --db-instance-identifier !DB_INSTANCE_ID! --region !REGION!
echo.

echo ============================================
echo Database Created Successfully!
echo ============================================
echo.
echo Configuration Details:
echo ======================
echo Instance ID:  !DB_INSTANCE_ID!
echo Engine:       PostgreSQL 15.3
echo Class:        db.t3.micro (free tier)
echo Storage:      !STORAGE!GB
echo Username:     !DB_USER!
echo Region:       !REGION!
echo.

echo Once the database is available, you can get the endpoint:
echo   aws rds describe-db-instances --db-instance-identifier !DB_INSTANCE_ID! --region !REGION! --query 'DBInstances[0].Endpoint.Address'
echo.

echo To delete this instance later:
echo   aws rds delete-db-instance --db-instance-identifier !DB_INSTANCE_ID! --skip-final-snapshot --region !REGION!
echo.

endlocal

