# OmniRepute - Docker Deployment Guide

## Quick Start

1. **Setup Environment**
   ```bash
   # Run interactive setup script
   ./setup-prod.sh setup
   
   # Or manually copy and edit
   cp env.example .env
   nano .env
   ```

2. **Deploy Application**
   ```bash
   # Make scripts executable (if not already)
   chmod +x deploy.sh setup-prod.sh
   
   # Start the application
   ./deploy.sh start
   ```

3. **Access Application**
   - Frontend: http://your-server-ip:8080 (or via nginx proxy)
   - Backend API: http://your-server-ip:3001 (or via nginx proxy)
   - Health Check: http://your-server-ip:3001/api/health

## Deployment Commands

```bash
# Start application
./deploy.sh start

# Stop application
./deploy.sh stop

# Restart application
./deploy.sh restart

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# View specific service logs
./deploy.sh logs backend
./deploy.sh logs frontend

# Update application
./deploy.sh update

# Clean up (removes containers and volumes)
./deploy.sh cleanup
```

## Environment Variables

Required variables in `.env`:
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to GCP service account credentials file
- `GCP_PROJECT_ID`: Your Google Cloud Project ID
- `API_KEY`: Your Gemini API key

## Troubleshooting

### Check Service Status
```bash
docker-compose ps
```

### View Detailed Logs
```bash
docker-compose logs -f
```

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild Services
```bash
docker-compose up --build -d
```

## Deploying with Existing Nginx

If you already have nginx running on your server, follow these steps:

1. **Configure Nginx Reverse Proxy**
   ```bash
   # Copy the nginx configuration
   sudo cp nginx-omnirepute.conf /etc/nginx/sites-available/omnirepute
   
   # Edit the configuration with your domain
   sudo nano /etc/nginx/sites-available/omnirepute
   
   # Enable the site
   sudo ln -s /etc/nginx/sites-available/omnirepute /etc/nginx/sites-enabled/
   
   # Test nginx configuration
   sudo nginx -t
   
   # Reload nginx
   sudo systemctl reload nginx
   ```

2. **Update CORS Origins**
   ```bash
   # Edit .env file to include your domain
   nano .env
   
   # Update ALLOWED_ORIGINS to include your domain
   ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
   ```

3. **Deploy Application**
   ```bash
   # Start the application
   ./deploy.sh start
   
   # Check status
   ./deploy.sh status
   ```

## Production Considerations

1. **Security**: Update CORS origins in `.env`
2. **SSL**: Configure reverse proxy (nginx/traefik) for HTTPS
3. **Monitoring**: Set up log aggregation and monitoring
4. **Backups**: Regular backups of BigQuery data
5. **Updates**: Use `./deploy.sh update` for seamless updates
6. **Existing Nginx**: Use provided nginx configuration for reverse proxy
