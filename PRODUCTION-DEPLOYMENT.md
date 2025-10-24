# OmniRepute - Production Deployment with Existing Nginx

## Overview

This guide covers deploying OmniRepute on a VM that already has nginx running, using Docker Compose with reverse proxy configuration.

## Architecture

```
Internet → Nginx (Port 80/443) → Docker Containers
                                ├── Frontend (Port 8080)
                                └── Backend (Port 3001)
```

## Prerequisites

- VM with existing nginx installation
- Docker and Docker Compose installed
- Domain name pointing to your VM (optional)
- Google Cloud Project with BigQuery access
- Gemini API key

## Step-by-Step Deployment

### 1. Setup Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd omnirepute

# Run interactive setup
./setup-prod.sh setup

# Or manually create .env
cp env.example .env
nano .env
```

### 2. Configure Nginx Reverse Proxy

```bash
# Copy nginx configuration
sudo cp nginx-omnirepute.conf /etc/nginx/sites-available/omnirepute

# Edit configuration with your domain
sudo nano /etc/nginx/sites-available/omnirepute

# Update server_name directive
server_name your-domain.com www.your-domain.com;

# Enable the site
sudo ln -s /etc/nginx/sites-available/omnirepute /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 3. Deploy Application

```bash
# Start the application
./deploy.sh start

# Check status
./deploy.sh status

# View logs
./deploy.sh logs
```

### 4. Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# Test backend health
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:8080

# Test through nginx proxy
curl http://your-domain.com/health
```

## Configuration Details

### Docker Compose Ports

- **Backend**: Exposed on port 3001 (internal only)
- **Frontend**: Exposed on port 8080 (accessible via nginx)

### Nginx Configuration

The `nginx-omnirepute.conf` file includes:

- **Upstream definitions** for load balancing
- **API proxy** (`/api/*` → backend:3001)
- **Frontend proxy** (`/` → frontend:8080)
- **Health check** endpoint (`/health`)
- **Security headers** and **gzip compression**
- **Static asset caching**

### Environment Variables

Required in `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
GCP_PROJECT_ID=your-gcp-project-id
API_KEY=your-gemini-api-key
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### GCP Service Account Setup

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: `omnirepute-service`
   - Description: `Service account for OmniRepute BigQuery access`

2. **Grant Required Roles**:
   - BigQuery Data Viewer
   - BigQuery Job User

3. **Create and Download Key**:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download the file

4. **Configure Credentials**:
   ```bash
   # Run setup script
   ./setup-prod.sh setup
   
   # Or manually copy credentials
   cp /path/to/downloaded/key.json gcp-credentials.json
   ```

## SSL/HTTPS Setup (Optional)

1. **Obtain SSL Certificate**
   ```bash
   # Using Let's Encrypt
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Update Nginx Configuration**
   ```bash
   # Uncomment SSL section in nginx-omnirepute.conf
   sudo nano /etc/nginx/sites-available/omnirepute
   
   # Reload nginx
   sudo systemctl reload nginx
   ```

## Management Commands

```bash
# Start application
./deploy.sh start

# Stop application
./deploy.sh stop

# Restart application
./deploy.sh restart

# View logs
./deploy.sh logs
./deploy.sh logs backend
./deploy.sh logs frontend

# Check status
./deploy.sh status

# Update application
./deploy.sh update

# Clean up
./deploy.sh cleanup
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   sudo netstat -tlnp | grep :8080
   sudo netstat -tlnp | grep :3001
   
   # Modify docker-compose.yml if needed
   ```

2. **Nginx Configuration Errors**
   ```bash
   # Test nginx configuration
   sudo nginx -t
   
   # Check nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Container Issues**
   ```bash
   # Check container logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Restart specific service
   docker-compose restart backend
   ```

4. **CORS Issues**
   ```bash
   # Update ALLOWED_ORIGINS in .env
   nano .env
   
   # Restart backend
   docker-compose restart backend
   ```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health (via nginx)
curl http://your-domain.com/health

# Full application test
curl http://your-domain.com/api/health
```

## Monitoring

### Log Files

- **Nginx**: `/var/log/nginx/omnirepute_access.log`
- **Application**: `docker-compose logs`
- **System**: `/var/log/syslog`

### Monitoring Commands

```bash
# Check resource usage
docker stats

# Check container health
docker-compose ps

# Monitor logs in real-time
docker-compose logs -f
```

## Security Considerations

1. **Firewall**: Only expose necessary ports (80, 443)
2. **SSL**: Use HTTPS in production
3. **API Keys**: Keep `.env` file secure
4. **Updates**: Regularly update Docker images
5. **Backups**: Backup BigQuery data regularly

## Scaling

To scale the application:

1. **Add more backend instances** in `docker-compose.yml`
2. **Update nginx upstream** configuration
3. **Use load balancer** for multiple VMs

```yaml
# Example scaling in docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

## Maintenance

### Regular Tasks

1. **Update application**: `./deploy.sh update`
2. **Monitor logs**: `./deploy.sh logs`
3. **Check health**: `./deploy.sh status`
4. **Clean up**: `./deploy.sh cleanup` (when needed)

### Backup Strategy

1. **Environment**: Backup `.env` file
2. **Configuration**: Backup nginx configs
3. **Data**: Backup BigQuery data
4. **Code**: Regular git commits
