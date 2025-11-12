# 🎯 Deployment Checklist

Use this checklist when deploying your server to production.

## Pre-Deployment

### MongoDB Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free tier is fine)
- [ ] Database user created with username/password
- [ ] Network access configured (allow 0.0.0.0/0 for cloud servers)
- [ ] Connection string copied
- [ ] Test connection string locally

### Code Preparation
- [ ] All code committed to Git
- [ ] `.env` file is NOT committed (check `.gitignore`)
- [ ] Server dependencies installed: `cd server && npm install`
- [ ] Server runs locally: `cd server && npm start`
- [ ] Health endpoint works: http://localhost:5000/api/health

### Platform Selection
Choose one:
- [ ] Render (recommended for beginners)
- [ ] Railway
- [ ] Heroku
- [ ] DigitalOcean
- [ ] Vercel
- [ ] Other

## Deployment Steps

### On Your Hosting Platform

1. **Connect Repository**
   - [ ] GitHub repository connected
   - [ ] Correct branch selected (usually `main`)

2. **Configure Build**
   - [ ] Root directory: `server` (or leave blank and adjust commands)
   - [ ] Build command: `cd server && npm install` OR just `npm install` if root is `server`
   - [ ] Start command: `cd server && npm start` OR just `npm start` if root is `server`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000  # (or leave for auto-assignment)
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
   CLIENT_URL=https://your-frontend-url.com
   ```
   
   - [ ] `NODE_ENV` set to `production`
   - [ ] `MONGODB_URI` set to your MongoDB connection string
   - [ ] `CLIENT_URL` set to your frontend URL (update after frontend deploy)
   - [ ] `PORT` set or left for auto-assignment

4. **Deploy**
   - [ ] Click "Deploy" / "Create Service"
   - [ ] Wait for build to complete
   - [ ] Check deployment logs for errors

## Post-Deployment Testing

### Server Health
- [ ] Server URL obtained from hosting platform
- [ ] Health endpoint responds: `https://your-server-url.com/api/health`
- [ ] Response shows `"status": "OK"` and `"environment": "production"`

### API Endpoints
Test each endpoint:
- [ ] `GET /api/equipment` - Returns equipment list
- [ ] `GET /api/users` - Returns users list
- [ ] `GET /api/tags` - Returns tags with asset counts
- [ ] `POST /api/equipment` - Can create new equipment (use Postman/Insomnia)

### Database Connection
- [ ] MongoDB Atlas shows active connection
- [ ] Data is being saved correctly
- [ ] Queries are working

### CORS Configuration
- [ ] Frontend can make API requests
- [ ] No CORS errors in browser console
- [ ] `CLIENT_URL` matches frontend deployment URL

## Frontend Integration

### Update Frontend Configuration

Option A: Environment variable (recommended)
```javascript
// In frontend .env
VITE_API_URL=https://your-server-url.com
```

Option B: Hard-code for production
```javascript
// In frontend config or API client
const API_URL = import.meta.env.PROD 
  ? 'https://your-server-url.com'
  : 'http://localhost:5000';
```

- [ ] Frontend configured with server URL
- [ ] Frontend deployed
- [ ] Server's `CLIENT_URL` updated with frontend URL
- [ ] CORS working between frontend and backend

## Monitoring Setup

### Uptime Monitoring
- [ ] UptimeRobot configured (free)
- [ ] Health endpoint being pinged every 5 minutes
- [ ] Email alerts configured

### Error Tracking (Optional but Recommended)
- [ ] Sentry account created
- [ ] Sentry integrated in server
- [ ] Test error reporting

### Logs
- [ ] Know how to access logs on your platform
- [ ] Logs are readable and helpful
- [ ] No critical errors in logs

## Security Review

- [ ] `.env` file not in Git repository
- [ ] MongoDB user has strong password
- [ ] `CLIENT_URL` set (not using `*` in production)
- [ ] HTTPS enabled (usually automatic)
- [ ] Security headers configured (already done in server.js)
- [ ] Request size limits configured (already done - 10MB)

## Documentation

- [ ] Deployment URL documented
- [ ] Environment variables documented
- [ ] Team members know how to access logs
- [ ] Backup plan in place

## Troubleshooting Resources

If something goes wrong, check:
1. **Deployment logs** on your hosting platform
2. **Server logs** in real-time
3. **MongoDB Atlas** monitoring for connection issues
4. **CORS errors** - verify `CLIENT_URL` is correct
5. **Environment variables** - ensure all are set correctly

### Common Issues

**Build fails:**
- Check Node.js version (needs >=16.0.0)
- Verify `package.json` scripts are correct
- Check if all dependencies install successfully

**Server crashes:**
- Check MongoDB connection string
- Verify environment variables are set
- Look for errors in logs

**CORS errors:**
- Ensure `CLIENT_URL` matches your frontend URL exactly
- No trailing slashes
- Use `https://` not `http://` for production

**Can't connect to MongoDB:**
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string format
- Test connection string locally first

## Rollback Plan

If deployment fails:
- [ ] Know how to revert to previous version
- [ ] Have local backup of working code
- [ ] Can redeploy previous Git commit

## Success Criteria

Your deployment is successful when:
- ✅ Health endpoint returns 200 OK
- ✅ All API endpoints work
- ✅ Frontend can communicate with backend
- ✅ Data is saving to MongoDB
- ✅ No errors in logs
- ✅ CORS working correctly
- ✅ Uptime monitoring active

---

## Platform-Specific Notes

### Render
- Free tier sleeps after 15 min inactivity (first request may be slow)
- Deploy time: 2-5 minutes
- Auto-deploys on Git push

### Railway
- $5 free credit monthly
- Very fast deploys (1-3 minutes)
- Auto-deploys on Git push

### Heroku
- No free tier anymore (starts at $7/month)
- Very reliable
- Lots of add-ons available

---

**Ready to deploy? Follow this checklist step by step!**

Need help? Check `DEPLOYMENT.md` for detailed instructions.
