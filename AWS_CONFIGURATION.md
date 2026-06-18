# CinePass Deployment Configuration

## AWS Account Setup

Before starting deployment, ensure you have:
1. AWS Account (https://aws.amazon.com/)
2. AWS CLI installed and configured
3. Elastic Beanstalk CLI installed
4. Appropriate IAM permissions

## Configuration Files

### Backend Configuration

#### Application Production Profile
File: `Backend/src/main/resources/application-prod.yaml`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://YOUR-RDS-ENDPOINT:5432/cinepass
    username: cinepassadmin
    password: YOUR_DB_PASSWORD
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    database-platform: org.hibernate.dialect.PostgreSQL10Dialect
    show-sql: false
  
server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    root: INFO
    com.capstone.cinepass: DEBUG
```

#### Environment Variables for Elastic Beanstalk
These are set in `.ebextensions/02_environment.config`:

```
SPRING_PROFILES_ACTIVE=prod
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_DATASOURCE_URL=jdbc:postgresql://RDS-ENDPOINT:5432/cinepass
SPRING_DATASOURCE_USERNAME=cinepassadmin
SPRING_DATASOURCE_PASSWORD=your_password
JAVA_TOOL_OPTIONS=-Xmx512m -Xms256m
```

### Frontend Configuration

#### API Base URL
File: `Frontend/src/services/api.ts`

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 
  'https://cinepass-env.REGION.elasticbeanstalk.com/api';
```

Create a `.env` file in Frontend directory:
```
VITE_API_URL=https://cinepass-env.us-east-1.elasticbeanstalk.com/api
```

#### CORS Configuration
Ensure your backend allows requests from your frontend CloudFront domain.

## AWS Resource Naming Conventions

To keep things organized, use these naming conventions:

| Resource | Naming Pattern | Example |
|----------|---|---|
| Application | `cinepass` | `cinepass` |
| EB Environment | `cinepass-env` | `cinepass-env` |
| RDS Instance | `cinepass-db` | `cinepass-db` |
| S3 Bucket | `cinepass-frontend-[unique]` | `cinepass-frontend-20240618` |
| CloudFront | `cinepass-cdn` | (auto-generated ID) |
| Security Group | `cinepass-sg` | `cinepass-sg` |

## Database Initial Setup

After RDS instance is created and connected:

1. Create the database:
```sql
CREATE DATABASE cinepass;
```

2. Hibernate will automatically create tables on first run with:
```
spring.jpa.hibernate.ddl-auto=update
```

3. Initial data will be loaded from `init-data.sql` if configured

## Security Considerations

### For Production Use:

1. **Database Password**: Use AWS Secrets Manager
   ```bash
   aws secretsmanager create-secret \
     --name cinepass/db/password \
     --secret-string "your-secure-password"
   ```

2. **API Keys**: Store in AWS Systems Manager Parameter Store
   ```bash
   aws ssm put-parameter \
     --name /cinepass/jwt-secret \
     --value "your-jwt-secret" \
     --type SecureString
   ```

3. **CORS**: Update the CloudFront domain after distribution is created

4. **Security Groups**: 
   - Only allow necessary ports
   - RDS: Allow only from Elastic Beanstalk security group
   - Elastic Beanstalk: Allow HTTP/HTTPS from CloudFront

5. **SSL/TLS**: 
   - CloudFront provides free HTTPS
   - Add custom domain with AWS Certificate Manager

## Monitoring & Logging

### CloudWatch Logs
Access via AWS Console:
- **Elastic Beanstalk Logs**: Environments → Select Environment → Logs
- **RDS Logs**: RDS → Databases → Select Instance → Logs & Events
- **Application Logs**: CloudWatch → Logs → `aws/elasticbeanstalk/`

### Health Monitoring
```bash
# Check EB health
eb health

# Check RDS status
aws rds describe-db-instances --db-instance-identifier cinepass-db

# Check CloudFront distribution
aws cloudfront get-distribution-summary --id DISTRIBUTION_ID
```

## Updating Configuration After Deployment

### Update Backend Environment Variables:
```bash
cd Backend
eb setenv SPRING_DATASOURCE_PASSWORD="new-password"
eb deploy
```

### Update Frontend API URL:
```bash
cd Frontend
echo "VITE_API_URL=https://new-api-endpoint" > .env
npm run build
aws s3 sync dist/ s3://your-bucket/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Update RDS Password:
```bash
# Change password in RDS
aws rds modify-db-instance \
  --db-instance-identifier cinepass-db \
  --master-user-password new-password \
  --apply-immediately

# Update in EB
eb setenv SPRING_DATASOURCE_PASSWORD="new-password"
eb deploy
```

## Cost Optimization Tips

1. **Use Free Tier Resources**:
   - t2.micro EC2 (750 hours/month)
   - db.t3.micro RDS (750 hours/month)
   - S3 (5GB free)
   - CloudFront (50GB/month free)

2. **Monitor Data Transfer**:
   - 1GB/month free data transfer out
   - Over quota costs $0.09 per GB
   - Compress responses with gzip

3. **Clean Up Unused Resources**:
   - Delete test databases
   - Remove test environments
   - Delete old S3 versions

4. **Set Billing Alerts**:
   ```bash
   aws ce get-cost-and-usage \
     --time-period Start=2024-06-01,End=2024-06-30 \
     --granularity MONTHLY \
     --metrics BlendedCost \
     --group-by Type=DIMENSION,Key=SERVICE
   ```

## Troubleshooting Configuration Issues

### Backend can't connect to database
1. Check RDS is publicly accessible
2. Verify security group allows port 5432
3. Check credentials in EB environment variables
4. Test connection locally:
   ```bash
   psql -h RDS_ENDPOINT -U cinepassadmin -d cinepass
   ```

### Frontend can't reach API
1. Verify EB environment is active
2. Check CORS headers are set correctly
3. Verify API_URL in frontend .env
4. Check CloudFront distribution is active

### High data transfer costs
1. Enable gzip compression in application
2. Use CloudFront caching
3. Optimize bundle size
4. Cache static assets

## Useful AWS CLI Commands

```bash
# List all resources
aws ec2 describe-instances --filters "Name=tag:Application,Values=cinepass"
aws rds describe-db-instances
aws s3 ls
aws cloudfront list-distributions

# View costs
aws ce get-cost-and-usage --time-period Start=2024-06-01,End=2024-06-30 --granularity DAILY --metrics BlendedCost

# Set up alarms
aws cloudwatch put-metric-alarm --alarm-name cinepass-cpu-high \
  --alarm-description "Alert if CPU > 80%" \
  --namespace AWS/EC2 --metric-name CPUUtilization \
  --statistic Average --period 300 --threshold 80 --comparison-operator GreaterThanThreshold
```

