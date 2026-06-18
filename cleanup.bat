@echo off
REM CinePass AWS Cleanup Script
REM Removes all AWS resources created for CinePass

setlocal enabledelayedexpansion

cls
echo ============================================
echo CinePass AWS Cleanup Script
echo ============================================
echo.

echo WARNING: This will delete all CinePass resources on AWS!
echo.

set /p CONFIRM="Are you sure you want to continue? (yes/no): "

if not "!CONFIRM!"=="yes" (
    echo Cancelled.
    exit /b 0
)

echo.

REM Cleanup Elastic Beanstalk
echo Cleaning up Elastic Beanstalk...

for /f "tokens=*" %%A in ('eb list 2^>nul') do (
    if "%%A"=="*" (
        set ENV_NAME=%%A
        set ENV_NAME=!ENV_NAME:*=!
    )
)

if not "!ENV_NAME!"=="" (
    set /p DELETE_EB="Delete Elastic Beanstalk environment '!ENV_NAME!'? (y/n): "

    if "!DELETE_EB!"=="y" (
        call eb terminate !ENV_NAME! -f
        echo Elastic Beanstalk environment deleted
    )
) else (
    echo No Elastic Beanstalk environment found
)

echo.

REM Cleanup RDS
echo Cleaning up RDS...

set /p DB_INSTANCE_ID="Enter RDS instance identifier to delete (or skip): "

if not "!DB_INSTANCE_ID!"=="" (
    set /p DELETE_RDS="Delete RDS instance '!DB_INSTANCE_ID!' and skip final snapshot? (y/n): "

    if "!DELETE_RDS!"=="y" (
        call aws rds delete-db-instance ^
            --db-instance-identifier !DB_INSTANCE_ID! ^
            --skip-final-snapshot
        echo RDS instance deletion initiated
    )
) else (
    echo Skipping RDS cleanup
)

echo.

REM Cleanup S3
echo Cleaning up S3...

set /p BUCKET_NAME="Enter S3 bucket name to delete (or skip): "

if not "!BUCKET_NAME!"=="" (
    echo Deleting S3 bucket contents...
    call aws s3 rm s3://!BUCKET_NAME! --recursive

    echo Deleting S3 bucket...
    call aws s3 rb s3://!BUCKET_NAME!

    echo S3 bucket deleted
) else (
    echo Skipping S3 cleanup
)

echo.

echo ============================================
echo Cleanup Complete!
echo ============================================
echo.

echo Remember:
echo 1. CloudFront distributions take ~15 minutes to disable
echo 2. Monitor AWS Console for completion
echo 3. Check billing for any remaining charges
echo.

endlocal

