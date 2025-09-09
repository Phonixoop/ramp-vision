#!/bin/bash

# Docker management scripts for Ramp Vision

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if ports are available
check_ports() {
    # Load ports from environment file
    source docker.env 2>/dev/null || true
    local ports=("${APP_PORT:-6555}" "${DB_PORT:-1433}" "${PRISMA_STUDIO_PORT:-5555}")
    for port in "${ports[@]}"; do
        if netstat -ano | grep ":$port " > /dev/null 2>&1; then
            print_warning "Port $port is already in use"
        else
            print_success "Port $port is available"
        fi
    done
}

# Function to start production environment
start_production() {
    print_status "Starting production environment..."
    check_docker
    check_ports
    
    docker-compose -f docker-compose.prod.yml --env-file docker.env up --build -d
    print_success "Production environment started"
    # Load URL from environment file
    source docker.env 2>/dev/null || true
    print_status "Access the application at: ${PROD_URL:-http://localhost:3000}"
}

# Function to start development environment
start_development() {
    print_status "Starting development environment..."
    check_docker
    check_ports
    
    docker-compose -f docker-compose.dev.yml --env-file docker.env up --build -d
    print_success "Development environment started"
    # Load URL from environment file
    source docker.env 2>/dev/null || true
    print_status "Access the application at: ${DEV_URL:-http://localhost:3000}"
}

# Function to stop environment
stop_environment() {
    print_status "Stopping environment..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "Environment stopped"
}

# Function to view logs
view_logs() {
    local service=${1:-"app"}
    print_status "Viewing logs for service: $service"
    docker-compose logs -f "$service"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_success "Services restarted"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
    print_success "Cleanup completed"
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker-compose ps
    echo ""
    print_status "Resource usage:"
    docker stats --no-stream
}

# Function to access database
access_db() {
    print_status "Accessing SQL Server database..."
    docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
}

# Function to run Prisma commands
prisma_command() {
    local command=${1:-"generate"}
    print_status "Running Prisma command: $command"
    docker-compose exec app npx prisma "$command"
}

# Function to show help
show_help() {
    echo "Docker Management Script for Ramp Vision"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start-prod     Start production environment"
    echo "  start-dev      Start development environment"
    echo "  stop           Stop all environments"
    echo "  logs [SERVICE] View logs (default: app)"
    echo "  restart        Restart all services"
    echo "  status         Show container status and resource usage"
    echo "  db             Access SQL Server database"
    echo "  prisma [CMD]   Run Prisma command (default: generate)"
    echo "  cleanup        Clean up Docker resources"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start-prod"
    echo "  $0 start-dev"
    echo "  $0 logs db"
    echo "  $0 prisma migrate dev"
}

# Main script logic
case "${1:-help}" in
    "start-prod")
        start_production
        ;;
    "start-dev")
        start_development
        ;;
    "stop")
        stop_environment
        ;;
    "logs")
        view_logs "$2"
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "db")
        access_db
        ;;
    "prisma")
        prisma_command "$2"
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac
