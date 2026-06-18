# CinePass AWS Deployment - Quick Start Guide

**Complete guide to deploy CinePass on AWS Free Tier in 30-60 minutes**

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] AWS Account (free tier eligible)
- [ ] AWS CLI installed: https://aws.amazon.com/cli/
- [ ] EB CLI installed: `pip install awsebcli`
- [ ] AWS credentials configured: `aws configure`
- [ ] Java 21 (for building backend)
- [ ] Node.js 18+ (for building frontend)
- [ ] Maven (included with project: `mvnw.cmd`)

**Quick Setup:**
```powershell
# Install AWS CLI
# Download from https://aws.amazon.com/cli/

# Install EB CLI
pip install awsebcli

# Configure AWS
aws configure
# Enter your AWS Access Key ID and Secret Access Key
# Default region: us-east-1
# Output format: json
```

---

## Step-by-Step Deployment

### Step 1: Create RDS Database (5-10 minutes)

```powershell
cd C:\cinepass

# Run database setup script
.\setup-database.bat

# Follow the prompts:
# - Instance ID: cinepass-db (default)
# - Username: cinepassadmin (default)
# - Password: [Your secure password]
# - Storage: 20 (default, free tier max)
# - Region: us-east-1 (default)
```

**Wait for database to be "Available" - check AWS Console:**
- Go to RDS → Databases
- Look for "cinepass-db" with "Available" status

**Get your RDS Endpoint:**
```powershell
aws rds describe-db-instances --db-instance-identifier cinepass-db --region us-east-1 --query 'DBInstances[0].Endpoint.Address' --output text
```

Save this endpoint - you'll need it for the backend.

---

### Step 2: Deploy Backend to Elastic Beanstalk (10-15 minutes)

```powershell
cd C:\cinepass\Backend

# Build the application
mvnw.cmd clean package -DskipTests

# Run deployment script
.\deploy.bat

# Follow the prompts:
# - Application name: cinepass (default)
# - Region: us-east-1 (default)
# - This is the first time, so it will create a new environment
# - Environment name: cinepass-env (default)
# - RDS endpoint: [Your endpoint from Step 1]
# - RDS username: cinepassadmin (default)
# - RDS password: [Your password from Step 1]
```

**Monitor deployment:**
```powershell
# Check status
eb status

# View logs (for debugging if needed)
eb logs --stream

# When ready, open in browser
eb open
```

**Your Backend URL:**
```
http://cinepass-env.REGION.elasticbeanstalk.com/api
```

---

### Step 3: Deploy Frontend to S3 + CloudFront (10-15 minutes)

```powershell
cd C:\cinepass\Frontend

# Run deployment script
.\deploy.bat

# Follow the prompts:
# - Bucket name: cinepass-frontend-[timestamp]
#   (Must be globally unique, use a timestamp)
```

This will:
1. Build your React app
2. Create an S3 bucket
3. Upload files to S3
4. Configure for static website hosting

The script will guide you through creating a CloudFront distribution.

**For CloudFront distribution:**
```powershell
# Use AWS Console or create with AWS CLI
# Option 1: Use AWS Console (5 minutes)
# - Search for CloudFront
# - Create Distribution
# - Origin: Your S3 bucket
# - Default root object: index.html
# - Click Create

# Option 2: Check S3 static website URL (works without CloudFront)
# Your frontend will be available at S3 URL
```

---

### Step 4: Connect Frontend to Backend

**Update Frontend API Endpoint:**

Edit: `Frontend\.env`
```
VITE_API_URL=http://cinepass-env.us-east-1.elasticbeanstalk.com/api
```

Or if using HTTPS:
```
VITE_API_URL=https://cinepass-env.us-east-1.elasticbeanstalk.com/api
```

**Rebuild and Deploy Frontend:**
```powershell
cd C:\cinepass\Frontend

# Update .env if not done already
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# If using CloudFront, invalidate cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## Verify Everything Works

### Test Backend
```powershell
# Using PowerShell
$env:BACKEND_URL = "http://cinepass-env.REGION.elasticbeanstalk.com/api"

# Test health endpoint (if exists)
Invoke-WebRequest -Uri "$env:BACKEND_URL/health" -Method GET

# Or test API documentation
# Visit: http://cinepass-env.us-east-1.elasticbeanstalk.com/api/swagger-ui.html
```

### Test Frontend
```powershell
# Visit your S3 website or CloudFront URL
# Try logging in with test credentials
# Verify API calls work (check browser console)
```

---

## Common Issues & Solutions

### Issue: "Access Denied" when creating S3 bucket
**Solution:** Bucket names must be globally unique. Try:
```powershell
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$bucketName = "cinepass-frontend-$timestamp"
aws s3 mb "s3://$bucketName" --region us-east-1
```

### Issue: Backend can't connect to database
**Solution:** 
1. Verify RDS is publicly accessible
2. Check security group allows inbound port 5432
3. Verify credentials in EB environment:
   ```powershell
   cd Backend
   eb printenv
   ```

### Issue: Frontend shows "API connection error"
**Solution:**
1. Verify backend is running: `eb open`
2. Check `VITE_API_URL` in .env
3. Check CORS settings in backend
4. Verify CloudFront caching isn't stale

### Issue: CloudFront not showing content
**Solution:**
1. Wait 5-15 minutes for distribution to be active
2. Check S3 bucket policy allows public read
3. Verify index.html exists in S3
4. Check Origin settings (should point to S3)

---

## Monitoring & Management

### Check Costs

```powershell
# View monthly costs
aws ce get-cost-and-usage `
  --time-period Start=$(Get-Date -Format "yyyy-MM-01"),End=$(Get-Date -Format "yyyy-MM-dd") `
  --granularity MONTHLY `
  --metrics BlendedCost `
  --group-by Type=DIMENSION,Key=SERVICE
```

### Monitor Resources

```powershell
# Elastic Beanstalk status
cd Backend
eb health

# RDS status
aws rds describe-db-instances --db-instance-identifier cinepass-db

# S3 usage
aws s3 ls --summarize --human-readable --recursive

# CloudFront statistics
aws cloudfront get-distribution-statistics --id YOUR_DISTRIBUTION_ID
```

### View Logs

```powershell
# Application logs
cd Backend
eb logs

# Stream logs in real-time
eb logs --stream

# AWS CloudWatch logs
# Go to: https://console.aws.amazon.com/cloudwatch/
```

---

## Free Tier Limits (Important!)

**Your free tier includes:**
- EC2: 750 hours/month (1 t2.micro running 24/7 = ~720 hours)
- RDS: 750 hours/month (same as EC2)
- S3: 5GB storage + 20,000 GET requests
- Data Transfer: 1GB/month OUT (beyond RDS/EC2/S3)
- CloudFront: 50GB/month OUT + 50GB/month IN

**Monitor these closely to avoid charges!**

---

## Cleanup (When Done Testing)

```powershell
# Delete everything safely
cd C:\cinepass

# Run cleanup script
.\cleanup.bat

# Or manually:

# Delete Elastic Beanstalk
cd Backend
eb terminate

# Delete RDS
aws rds delete-db-instance --db-instance-identifier cinepass-db --skip-final-snapshot

# Delete S3 and CloudFront
aws s3 rm s3://your-bucket-name --recursive
aws s3 rb s3://your-bucket-name

# Disable and delete CloudFront distribution
# (Takes ~15 minutes through AWS Console)
```

---

## Quick Reference - Useful Commands

```powershell
# Backend (Elastic Beanstalk)
cd Backend
eb status          # Check environment status
eb health          # Check instance/application health
eb logs            # View application logs
eb open            # Open application in browser
eb deploy          # Deploy latest build
eb terminate       # Delete environment

# Database (RDS)
aws rds describe-db-instances                    # List databases
aws rds modify-db-instance --db-instance-identifier cinepass-db --master-user-password newpass
psql -h ENDPOINT -U cinepassadmin -d cinepass   # Connect to database

# Frontend (S3)
aws s3 ls                                        # List buckets
aws s3 sync dist/ s3://bucket/ --delete         # Deploy
aws s3 rm s3://bucket/ --recursive               # Delete contents

# CloudFront
aws cloudfront list-distributions                # List distributions
aws cloudfront create-invalidation             # Clear cache
```

---

## Next Steps

1. **Set Up Custom Domain** (Optional)
   - Use AWS Route 53
   - Point to CloudFront distribution
   - Get free SSL certificate with AWS Certificate Manager

2. **Enable Monitoring & Alarms**
   - CloudWatch alarms for CPU, memory, data transfer
   - Email notifications for alerts

3. **Setup Automated Backups**
   - RDS automatic backups (7 days default)
   - S3 versioning for static files

4. **Add Database Monitoring**
   - CloudWatch logs for RDS
   - Query performance insights

5. **Optimize for Production**
   - Update security groups for restrictive access
   - Enable encryption at rest for RDS
   - Add WAF rules for CloudFront
   - Setup auto-scaling policies

---

## Documentation Files

- `DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `AWS_CONFIGURATION.md` - Configuration reference
- `Backend/.ebextensions/` - Elastic Beanstalk configuration
- `Frontend/deploy.bat` - Frontend deployment script
- `Backend/deploy.bat` - Backend deployment script

---

## Support Resources

- AWS Documentation: https://docs.aws.amazon.com/
- AWS Free Tier: https://aws.amazon.com/free/
- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Documentation: https://react.dev/
- AWS CLI Reference: https://docs.aws.amazon.com/cli/

---

**Estimated Time: 30-60 minutes**
**Estimated Cost: $0 (if within free tier limits)**

Ready to deploy? Start with Step 1! 🚀

