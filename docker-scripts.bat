@echo off
setlocal enabledelayedexpansion

REM Docker management scripts for Ramp Vision (Windows)

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop first."
    exit /b 1
)
call :print_success "Docker is running"
goto :eof

REM Function to check if ports are available
:check_ports
for %%p in (3000 1433 5555) do (
    netstat -ano | findstr ":%%p " >nul 2>&1
    if errorlevel 1 (
        call :print_success "Port %%p is available"
    ) else (
        call :print_warning "Port %%p is already in use"
    )
)
goto :eof

REM Function to start production environment
:start_production
call :print_status "Starting production environment..."
call :check_docker
if errorlevel 1 exit /b 1
call :check_ports

docker-compose -f docker-compose.prod.yml --env-file docker.env up --build -d
call :print_success "Production environment started"
call :print_status "Access the application at: http://localhost:3000"
goto :eof

REM Function to start development environment
:start_development
call :print_status "Starting development environment..."
call :check_docker
if errorlevel 1 exit /b 1
call :check_ports

docker-compose -f docker-compose.dev.yml --env-file docker.env up --build -d
call :print_success "Development environment started"
call :print_status "Access the application at: http://localhost:3000"
goto :eof

REM Function to stop environment
:stop_environment
call :print_status "Stopping environment..."
docker-compose down
docker-compose -f docker-compose.dev.yml down 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul
call :print_success "Environment stopped"
goto :eof

REM Function to view logs
:view_logs
set "service=%~1"
if "%service%"=="" set "service=app"
call :print_status "Viewing logs for service: %service%"
docker-compose logs -f %service%
goto :eof

REM Function to restart services
:restart_services
call :print_status "Restarting services..."
docker-compose restart
call :print_success "Services restarted"
goto :eof

REM Function to clean up
:cleanup
call :print_status "Cleaning up Docker resources..."
docker system prune -f
docker volume prune -f
call :print_success "Cleanup completed"
goto :eof

REM Function to show status
:show_status
call :print_status "Container status:"
docker-compose ps
echo.
call :print_status "Resource usage:"
docker stats --no-stream
goto :eof

REM Function to access database
:access_db
call :print_status "Accessing SQL Server database..."
docker-compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
goto :eof

REM Function to run Prisma commands
:prisma_command
set "command=%~1"
if "%command%"=="" set "command=generate"
call :print_status "Running Prisma command: %command%"
docker-compose exec app npx prisma %command%
goto :eof

REM Function to show help
:show_help
echo Docker Management Script for Ramp Vision
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   start-prod     Start production environment
echo   start-dev      Start development environment
echo   stop           Stop all environments
echo   logs [SERVICE] View logs (default: app)
echo   restart        Restart all services
echo   status         Show container status and resource usage
echo   db             Access SQL Server database
echo   prisma [CMD]   Run Prisma command (default: generate)
echo   cleanup        Clean up Docker resources
echo   help           Show this help message
echo.
echo Examples:
echo   %~nx0 start-prod
echo   %~nx0 start-dev
echo   %~nx0 logs db
echo   %~nx0 prisma migrate dev
goto :eof

REM Main script logic
if "%1"=="" goto :show_help

if "%1"=="start-prod" goto :start_production
if "%1"=="start-dev" goto :start_development
if "%1"=="stop" goto :stop_environment
if "%1"=="logs" goto :view_logs
if "%1"=="restart" goto :restart_services
if "%1"=="status" goto :show_status
if "%1"=="db" goto :access_db
if "%1"=="prisma" goto :prisma_command
if "%1"=="cleanup" goto :cleanup
if "%1"=="help" goto :show_help

REM If we get here, show help
goto :show_help
