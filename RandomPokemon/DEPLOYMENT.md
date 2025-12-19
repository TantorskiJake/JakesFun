# Deployment Guide for Random Pokémon App

This guide covers multiple options for hosting your Flask app on tantorski.com.

## Quick Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Render** | ⭐ Easy | Free tier available | Quick deployment |
| **Railway** | ⭐ Easy | Free tier available | Simple setup |
| **Heroku** | ⭐⭐ Medium | Paid ($5+/mo) | Established platform |
| **DigitalOcean** | ⭐⭐⭐ Advanced | $6+/mo | Full control |
| **AWS/GCP** | ⭐⭐⭐⭐ Complex | Pay-as-you-go | Enterprise scale |

## Option 1: Render (Recommended for Beginners)

### Pros
- Free tier available
- Automatic SSL certificates
- Easy GitHub integration
- No credit card required for free tier

### Steps

1. **Prepare your app:**
   ```bash
   # Create a Procfile (already created below)
   # Create runtime.txt (optional, for Python version)
   ```

2. **Create `Procfile` in project root:**
   ```
   web: gunicorn app:app
   ```

3. **Update `requirements.txt` to include gunicorn:**
   ```
   Flask==3.0.0
   requests==2.31.0
   gunicorn==21.2.0
   ```

4. **Deploy:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: random-pokemon (or your choice)
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn app:app`
     - **Plan**: Free (or paid for better performance)

5. **Custom Domain:**
   - In Render dashboard → Settings → Custom Domains
   - Add `tantorski.com` or `www.tantorski.com`
   - Add DNS records as instructed:
     - Type: CNAME
     - Name: @ (or www)
     - Value: [provided by Render]

6. **Update DNS at your domain registrar:**
   - Add CNAME record pointing to Render's provided URL
   - Or A record if using root domain (@)

### Update app.py for production:

```python
if __name__ == "__main__":
    # ... existing logging code ...
    
    # For production, use environment variable for port
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)
```

---

## Option 2: Railway

### Pros
- Very simple setup
- Free tier with $5 credit
- Automatic deployments
- Great for small projects

### Steps

1. **Create `Procfile`:**
   ```
   web: gunicorn app:app --bind 0.0.0.0:$PORT
   ```

2. **Update requirements.txt:**
   ```
   Flask==3.0.0
   requests==2.31.0
   gunicorn==21.2.0
   ```

3. **Deploy:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Python and deploys

4. **Custom Domain:**
   - In project → Settings → Domains
   - Add custom domain: `tantorski.com`
   - Follow DNS instructions

---

## Option 3: DigitalOcean App Platform

### Pros
- Simple deployment
- Good performance
- $5/month minimum

### Steps

1. **Create `Procfile`:**
   ```
   web: gunicorn app:app
   ```

2. **Deploy:**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create account
   - App Platform → Create App
   - Connect GitHub repository
   - Auto-detects settings
   - Choose $5/month plan

3. **Custom Domain:**
   - Settings → Domains
   - Add `tantorski.com`
   - Update DNS records

---

## Option 4: VPS (DigitalOcean Droplet, Linode, etc.)

### Pros
- Full control
- Can host multiple apps
- More complex setup

### Steps

1. **Create VPS:**
   - DigitalOcean: Create Droplet (Ubuntu 22.04)
   - Minimum: $6/month (1GB RAM)

2. **SSH into server:**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install dependencies:**
   ```bash
   apt update
   apt install python3-pip python3-venv nginx
   ```

4. **Clone your repo:**
   ```bash
   git clone https://github.com/yourusername/RandomPokemon.git
   cd RandomPokemon
   ```

5. **Setup virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt gunicorn
   ```

6. **Create systemd service (`/etc/systemd/system/pokemon.service`):**
   ```ini
   [Unit]
   Description=Random Pokemon App
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/path/to/RandomPokemon
   Environment="PATH=/path/to/RandomPokemon/venv/bin"
   ExecStart=/path/to/RandomPokemon/venv/bin/gunicorn app:app --bind 127.0.0.1:5001

   [Install]
   WantedBy=multi-user.target
   ```

7. **Start service:**
   ```bash
   systemctl start pokemon
   systemctl enable pokemon
   ```

8. **Configure Nginx (`/etc/nginx/sites-available/pokemon`):**
   ```nginx
   server {
       listen 80;
       server_name tantorski.com www.tantorski.com;

       location / {
           proxy_pass http://127.0.0.1:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

9. **Enable site:**
   ```bash
   ln -s /etc/nginx/sites-available/pokemon /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

10. **Setup SSL with Let's Encrypt:**
    ```bash
    apt install certbot python3-certbot-nginx
    certbot --nginx -d tantorski.com -d www.tantorski.com
    ```

11. **Update DNS:**
    - Add A record: `@` → your server IP
    - Add A record: `www` → your server IP

---

## Required Code Changes

### 1. Update app.py for production:

```python
import os

# ... existing code ...

if __name__ == "__main__":
    # ... existing logging code ...
    
    # Use environment variable for port (required by most platforms)
    port = int(os.environ.get('PORT', 5001))
    # Set debug=False in production
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
```

### 2. Create `.gitignore` (if not exists):

```
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
ENV/
.venv
*.log
.DS_Store
.env
```

### 3. Create `runtime.txt` (optional, for Python version):

```
python-3.11.0
```

---

## Environment Variables (Optional)

For production, you might want to set:
- `FLASK_ENV=production`
- `PORT=5001` (usually set automatically by platform)

---

## DNS Configuration

### For Root Domain (tantorski.com):

**Option A: CNAME (if platform supports)**
- Type: CNAME
- Name: @
- Value: [platform-provided-url]

**Option B: A Record (if CNAME not supported)**
- Type: A
- Name: @
- Value: [server-ip-address]

### For Subdomain (www.tantorski.com):

- Type: CNAME
- Name: www
- Value: [platform-provided-url] or [server-ip]

---

## Testing After Deployment

1. **Check app is running:**
   - Visit your domain
   - Test all features

2. **Check SSL:**
   - Should redirect to HTTPS automatically
   - Green lock in browser

3. **Monitor logs:**
   - Platform dashboard → Logs
   - Or SSH into server: `journalctl -u pokemon -f`

---

## Recommended: Render (Easiest)

For your use case, I recommend **Render** because:
- ✅ Free tier available
- ✅ Simple setup
- ✅ Automatic SSL
- ✅ Easy custom domain
- ✅ Good documentation
- ✅ No credit card needed

### Quick Render Setup:

1. Add `gunicorn==21.2.0` to `requirements.txt`
2. Create `Procfile` with: `web: gunicorn app:app`
3. Update `app.py` to use `PORT` environment variable
4. Push to GitHub
5. Connect to Render
6. Add custom domain
7. Update DNS

---

## Troubleshooting

### App won't start:
- Check logs in platform dashboard
- Verify `Procfile` is correct
- Ensure `requirements.txt` includes gunicorn

### Domain not working:
- Wait 24-48 hours for DNS propagation
- Check DNS records are correct
- Verify domain is added in platform dashboard

### SSL issues:
- Most platforms auto-configure SSL
- For VPS: Ensure certbot ran successfully

---

## Security Considerations

1. **Never commit secrets:**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Set debug=False in production:**
   - Already handled in code above

3. **Use HTTPS:**
   - Most platforms auto-configure
   - For VPS: Use Let's Encrypt

4. **Rate limiting:**
   - Consider adding Flask-Limiter for API protection

---

## Next Steps

1. Choose a platform (Render recommended)
2. Make code changes (add gunicorn, update app.py)
3. Deploy
4. Configure custom domain
5. Update DNS
6. Test thoroughly

Need help with any specific step? Let me know!

