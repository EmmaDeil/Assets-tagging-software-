# ASE Tag Software - Server Deployment Guide

## 🚀 Deployment-Ready Features

The server is now configured with:
- ✅ Environment-based configuration (development/production)
- ✅ CORS with configurable origins
- ✅ Security headers (XSS, clickjacking protection)
- ✅ Request size limits (10MB)
- ✅ Graceful shutdown handling
- ✅ Error handling middleware
- ✅ Health check endpoint
- ✅ Trust proxy for reverse proxies
- ✅ Process error handlers

## 📋 Prerequisites

1. MongoDB Atlas account (or any MongoDB hosting)
2. Node.js hosting platform account (Render, Heroku, Railway, etc.)
3. Your MongoDB connection string
4. Your frontend deployment URL

## 🔧 Environment Variables

Configure these environment variables on your hosting platform:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
CLIENT_URL=https://your-frontend-url.com
```

## 🌐 Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. **Sign up** at [render.com](https://render.com)

2. **Create New Web Service**
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service:**
   ```
   Name: ase-tag-software-server
   Environment: Node
   Region: Choose nearest to you
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

4. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Your MongoDB connection string
   - `CLIENT_URL` = Your frontend URL (e.g., https://your-app.netlify.app)
   - `PORT` = `5000` (or leave blank, Render auto-assigns)

5. **Deploy** - Click "Create Web Service"

Your server will be available at: `https://your-service-name.onrender.com`

---

### Option 2: Railway

1. **Sign up** at [railway.app](https://railway.app)

2. **New Project** → **Deploy from GitHub repo**

3. **Configure:**
   - Root Directory: `/server`
   - Start Command: `npm start`

4. **Add Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   CLIENT_URL=your_frontend_url
   ```

5. **Deploy** - Railway will auto-deploy

---

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login and Create App:**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set CLIENT_URL="your_frontend_url"
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

Your server will be at: `https://your-app-name.herokuapp.com`

---

### Option 4: DigitalOcean App Platform

1. **Create New App** in DigitalOcean

2. **Configure:**
   - Type: Web Service
   - Source: GitHub repository
   - Build Command: `cd server && npm install`
   - Run Command: `cd server && npm start`

3. **Add Environment Variables** in the app settings

4. **Deploy**

---

## 🔍 MongoDB Setup (MongoDB Atlas)

1. **Create Account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster** (Free tier M0 available)

3. **Database Access:**
   - Create database user with username/password
   - Note credentials for connection string

4. **Network Access:**
   - Add `0.0.0.0/0` to allow access from anywhere (for hosted servers)

5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<username>`, `<password>`, and `<database>`

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ase-tag-software?retryWrites=true&w=majority
```

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-server-url.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "environment": "production",
  "timestamp": "2025-11-12T10:30:00.000Z",
  "uptime": 123.45
}
```

### 2. API Test
```bash
curl https://your-server-url.com/api/users
```

### 3. CORS Test
Make a request from your frontend to ensure CORS is working properly.

---

## 📝 Post-Deployment Checklist

- [ ] Server health endpoint returns 200 OK
- [ ] MongoDB connection successful
- [ ] All API endpoints working
- [ ] CORS configured with frontend URL
- [ ] Environment variables set correctly
- [ ] Error logging working
- [ ] File uploads working (if applicable)

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify connection string format
- Ensure database user has correct permissions

### Issue: "CORS Error"
**Solution:**
- Set `CLIENT_URL` environment variable to your frontend URL
- No trailing slash in URL
- Use `https://` not `http://` for production

### Issue: "Server not starting"
**Solution:**
- Check server logs for errors
- Verify all dependencies installed
- Check `PORT` environment variable
- Ensure `NODE_ENV=production` is set

### Issue: "File uploads not working"
**Solution:**
- Check if hosting platform supports file system writes
- Consider using cloud storage (AWS S3, Cloudinary) for production

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong MongoDB passwords** - Generate random passwords
3. **Limit CORS origins** - Set specific frontend URL, not `*`
4. **Enable MongoDB authentication** - Always use username/password
5. **Use HTTPS** - All modern platforms provide SSL certificates
6. **Regular updates** - Keep dependencies updated
7. **Monitor logs** - Set up error logging service (Sentry, LogRocket)

---

## 📊 Monitoring

### Add these services for production monitoring:

1. **Uptime Monitoring:** 
   - [UptimeRobot](https://uptimerobot.com) - Free
   - Ping your `/api/health` endpoint

2. **Error Tracking:**
   - [Sentry](https://sentry.io) - Free tier available
   - [LogRocket](https://logrocket.com)

3. **Performance:**
   - [New Relic](https://newrelic.com)
   - Built-in platform monitoring (Render, Railway)

---

## 🔄 CI/CD (Continuous Deployment)

Most platforms support auto-deployment from GitHub:

1. **Connect GitHub repository** to hosting platform
2. **Enable auto-deploy** from main branch
3. **Every push to main** triggers automatic deployment

This is already configured for:
- ✅ Render
- ✅ Railway
- ✅ Vercel
- ✅ Heroku

---

## 📱 Update Frontend

After deploying server, update your frontend `vite.config.js`:

**For Production Build:**
```javascript
// Replace API calls from '/api/*' to full server URL
const API_URL = import.meta.env.PROD 
  ? 'https://your-server-url.com/api'
  : '/api';
```

Or set environment variable in your frontend hosting:
```
VITE_API_URL=https://your-server-url.com
```

---

## 🎯 Quick Start Commands

```bash
# Local test in production mode
cd server
NODE_ENV=production npm start

# Check if server responds
curl http://localhost:5000/api/health

# Deploy to Heroku (example)
git push heroku main

# View logs on Render
render logs -s your-service-name
```

---

## 📞 Support

If you encounter issues:
1. Check server logs on your hosting platform
2. Test `/api/health` endpoint
3. Verify environment variables are set
4. Check MongoDB Atlas connection
5. Review CORS configuration

---

## 🎉 Success!

Once deployed, your server URL will look like:
- Render: `https://ase-tag-software.onrender.com`
- Railway: `https://ase-tag-software.up.railway.app`
- Heroku: `https://ase-tag-software.herokuapp.com`

Use this URL in your frontend configuration!
