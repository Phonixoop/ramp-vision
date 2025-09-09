# Docker Setup for Ramp Vision

This document explains how to run the Ramp Vision application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- At least 4GB of RAM available for SQL Server

## Quick Start

### Production Mode

1. **Build and run the application:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Main app: http://localhost:3000
   - Database: localhost:1433
   - Prisma Studio: http://localhost:5555 (optional)

### Development Mode

1. **Run in development mode with hot reloading:**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Main app: http://localhost:3000
   - Database: localhost:1433
   - Prisma Studio: http://localhost:5555

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=mssql://sa:YourStrong@Passw0rd@localhost:1433/ramp_vision
SQL_USER=sa
SQL_PASSWORD=YourStrong@Passw0rd
SQL_SERVERIP=localhost
SQL_PORT=1433

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Docker Commands

### Basic Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build

# Stop and remove volumes (database data)
docker-compose down -v
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start development environment in background
docker-compose -f docker-compose.dev.yml up -d

# View development logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Database Commands

```bash
# Access SQL Server container
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd

# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Push database schema
docker-compose exec app npx prisma db push

# Generate Prisma client
docker-compose exec app npx prisma generate
```

## Service Details

### App Service

- **Port:** 3000
- **Image:** Custom Next.js application
- **Features:** Production-optimized build with standalone output

### Database Service

- **Port:** 1433
- **Image:** Microsoft SQL Server 2022
- **Features:** Persistent data storage, SQL Server Express

### Prisma Studio Service

- **Port:** 5555
- **Features:** Database management interface
- **Profile:** tools (only runs when explicitly started)

## Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000

   # Kill the process or change ports in docker-compose.yml
   ```

2. **Database connection issues:**

   ```bash
   # Check database logs
   docker-compose logs db

   # Restart database service
   docker-compose restart db
   ```

3. **Build failures:**

   ```bash
   # Clean Docker cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Performance Optimization

1. **Increase Docker resources:**

   - Memory: 4GB+ (SQL Server needs at least 2GB)
   - CPU: 2+ cores
   - Disk: 20GB+ free space

2. **Use Docker volumes for better performance:**
   ```yaml
   volumes:
     - ./src:/app/src:delegated
     - ./public:/app/public:delegated
   ```

## Production Deployment

### Build Production Image

```bash
# Build production image
docker build -t ramp-vision:latest .

# Run production container
docker run -p 3000:3000 --env-file .env ramp-vision:latest
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=mssql://user:password@host:port/database
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com
```

## Security Considerations

1. **Change default passwords** in production
2. **Use environment variables** for sensitive data
3. **Limit database access** to application only
4. **Regular security updates** for base images
5. **Network isolation** between services

## Monitoring and Logs

```bash
# View all container logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f app

# Check container status
docker-compose ps

# View resource usage
docker stats
```

## Backup and Restore

### Database Backup

```bash
# Create backup
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "BACKUP DATABASE ramp_vision TO DISK = '/var/opt/mssql/backup.bak'"

# Copy backup from container
docker cp $(docker-compose ps -q db):/var/opt/mssql/backup.bak ./backup.bak
```

### Restore Database

```bash
# Copy backup to container
docker cp ./backup.bak $(docker-compose ps -q db):/var/opt/mssql/backup.bak

# Restore database
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "RESTORE DATABASE ramp_vision FROM DISK = '/var/opt/mssql/backup.bak'"
```
