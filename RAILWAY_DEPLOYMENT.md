# Railway Deployment Guide - Norwegian CRM

This guide explains how to deploy your Norwegian CRM system to Railway.

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. Railway CLI installed (optional, but recommended):
   ```bash
   npm install -g @railway/cli
   ```
3. Git repository connected to your project

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Create a New Project**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

2. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click on "Variables"
   - Add the following environment variables (see `.env.example`):

   ```
   NODE_ENV=production
   PORT=5000
   VITE_APP_URL=https://your-app.railway.app
   VITE_API_BASE_URL=https://your-app.railway.app/api/v1
   
   # Email Configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=true
   SMTP_USER=your-email@example.com
   SMTP_PASSWORD=your-smtp-password
   
   # Security (GENERATE STRONG RANDOM STRINGS)
   JWT_SECRET=<generate-a-strong-random-secret>
   API_KEY_SALT=<generate-a-strong-random-salt>
   WEBHOOK_SECRET=<generate-a-strong-webhook-secret>
   
   # Feature Flags
   ENABLE_EMAIL_SCHEDULING=true
   ENABLE_SMS=false
   ENABLE_WEBHOOKS=true
   ENABLE_API_PLAYGROUND=true
   ```

3. **Deploy**
   - Railway will automatically detect the Dockerfile
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided Railway URL

### Option 2: Deploy via Railway CLI

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set JWT_SECRET=your-secret-here
   # Add all other required variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Port to run the server | `5000` |
| `VITE_APP_URL` | Your app's public URL | `https://your-app.railway.app` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate with `openssl rand -base64 32` |
| `API_KEY_SALT` | Salt for API key hashing | Generate with `openssl rand -base64 32` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | - |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASSWORD` | SMTP password | - |
| `SMS_API_KEY` | SMS gateway API key | - |
| `ENABLE_EMAIL_SCHEDULING` | Enable email scheduling | `true` |
| `ENABLE_SMS` | Enable SMS features | `false` |
| `ENABLE_WEBHOOKS` | Enable webhook support | `true` |

## Security Considerations

### Generate Strong Secrets

Use these commands to generate secure random strings:

```bash
# For JWT_SECRET
openssl rand -base64 32

# For API_KEY_SALT
openssl rand -base64 32

# For WEBHOOK_SECRET
openssl rand -hex 32
```

### GDPR Compliance

The application is designed for GDPR compliance:
- Data is stored within the EU (configure Railway region)
- Data export functionality is built-in
- Data retention policies can be configured
- User consent and privacy features are implemented

### Environment Variables in Production

**NEVER commit `.env` files to Git!**

The `.env.example` file is provided as a template. Copy it to `.env` for local development:

```bash
cp .env.example .env
# Edit .env with your actual values
```

## Post-Deployment

### 1. Update Application URL

After deployment, update the `VITE_APP_URL` and `VITE_API_BASE_URL` variables with your actual Railway URL.

### 2. Test the Deployment

Visit your Railway URL and verify:
- ✅ Application loads correctly
- ✅ Login functionality works
- ✅ API endpoints are accessible
- ✅ Email sending works (if configured)
- ✅ Data persistence works

### 3. Configure Custom Domain (Optional)

1. In Railway dashboard, go to Settings
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain

## Monitoring and Logs

### View Logs
```bash
railway logs
```

Or view in Railway dashboard under "Logs" tab.

### Monitor Performance

Railway provides built-in monitoring:
- CPU usage
- Memory usage
- Network traffic
- Response times

Access these metrics in the Railway dashboard.

## Scaling

Railway automatically handles:
- Vertical scaling (CPU/memory)
- Load balancing
- Auto-restart on failures

To adjust resources:
1. Go to Settings in Railway dashboard
2. Adjust resource limits
3. Save changes

## Database Configuration (Future)

When you add a PostgreSQL database:

1. **Add PostgreSQL Service in Railway**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide a `DATABASE_URL`

2. **Update Environment Variables**
   ```bash
   railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

3. **Run Migrations**
   ```bash
   railway run npm run migrate
   ```

## Troubleshooting

### Build Fails

1. Check build logs in Railway dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Dockerfile syntax

### Application Won't Start

1. Check that `PORT` environment variable is set to `5000`
2. Verify `NODE_ENV` is set to `production`
3. Check logs for error messages

### API Requests Fail

1. Verify `VITE_API_BASE_URL` matches your Railway URL
2. Check CORS configuration
3. Verify API keys are correctly set

### Email Not Sending

1. Verify SMTP credentials are correct
2. Check SMTP port and security settings
3. Ensure SMTP provider allows connections from Railway IPs

## Cost Optimization

Railway offers:
- Free tier with $5 credit/month
- Pay-as-you-go pricing

To optimize costs:
1. Set appropriate sleep/wake policies
2. Monitor resource usage
3. Use environment-based feature flags

## Backup and Recovery

### Data Backup

Since the app uses Spark KV store, data is automatically backed up by Railway. For additional safety:

1. **Export Data Regularly**
   - Use the built-in CSV export feature
   - Schedule regular exports

2. **Database Snapshots** (when using PostgreSQL)
   - Railway provides automatic backups
   - Configure retention period in settings

### Disaster Recovery

1. Keep your Git repository up to date
2. Document all environment variables
3. Test restoration process regularly

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: [Your Repository]/issues

## Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Strong secrets generated for JWT_SECRET, API_KEY_SALT
- [ ] SMTP credentials configured and tested
- [ ] GDPR compliance verified
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS enabled (automatic with Railway)
- [ ] Application tested in production mode locally
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team members have access to Railway project

## Next Steps

After successful deployment:

1. Configure monitoring and alerts
2. Set up custom domain
3. Configure email templates
4. Add team members
5. Import initial data
6. Train users
7. Monitor performance and logs

---

**Need Help?** Check the Railway documentation or contact support.
