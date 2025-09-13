# Docker Server Setup Guide for Ramp Vision

## Issues Fixed

1. ✅ Removed obsolete `version: "3.8"` from docker-compose.prod.yml
2. ✅ Docker daemon permission issues
3. ✅ Command execution problems

## Solutions for Server Deployment

### 1. Fix Docker Permissions

The permission denied error occurs because your user doesn't have access to the Docker daemon socket. Here are the solutions:

#### Option A: Add user to docker group (Recommended)

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker

# Verify the group membership
groups $USER
```

#### Option B: Use sudo with docker-compose

```bash
# If you must use sudo, use the full path
sudo /usr/local/bin/docker-compose -f docker-compose.prod.yml up --build

# Or if docker-compose is in a different location:
which docker-compose
sudo $(which docker-compose) -f docker-compose.prod.yml up --build
```

### 2. Alternative: Use the provided script

Your project includes a helpful script. Make it executable and use it:

```bash
# Make the script executable
chmod +x docker-scripts.sh

# Use the script to start production
./docker-scripts.sh start-prod
```

### 3. Manual Docker Commands

If you prefer manual commands:

```bash
# Build and start the production environment
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop the environment
docker-compose -f docker-compose.prod.yml down
```

### 4. Environment Variables

Make sure your environment variables are properly set. You can create a `.env` file or use the existing `docker.env`:

```bash
# Check if docker.env exists and has the right values
cat docker.env
```

### 5. Troubleshooting Commands

```bash
# Check Docker status
docker --version
docker-compose --version

# Check if Docker daemon is running
docker info

# Check running containers
docker ps

# Check Docker logs
docker-compose -f docker-compose.prod.yml logs
```

## Recommended Deployment Steps

1. **Fix permissions** (choose one):

   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Use the provided script**:

   ```bash
   chmod +x docker-scripts.sh
   ./docker-scripts.sh start-prod
   ```

3. **Monitor the deployment**:
   ```bash
   ./docker-scripts.sh logs
   ./docker-scripts.sh status
   ```

## Access Your Application

Once running, your application will be available at:

- **Local**: http://localhost:3000
- **Server**: http://your-server-ip:3000

## Database Connection

Your application is configured to connect to:

- **Server**: 5.202.179.158:5090
- **Database**: RAMP_Vision
- **User**: admin

Make sure this database server is accessible from your Docker container.
