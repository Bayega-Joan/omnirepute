#!/bin/bash

# OmniRepute Deployment Script for GCP Linux VM
# This script manages Docker Compose deployment of the OmniRepute application

set -e  # Exit on any error

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

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please ensure Docker Compose is installed."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f "omni-repute-backend/.env" ]; then
        print_warning ".env file not found in omni-repute-backend directory."
        print_warning "Please run ./setup-prod.sh setup to create the .env file"
        print_error "Required: Run ./setup-prod.sh setup first to configure the environment"
        exit 1
    else
        print_success ".env file found in omni-repute-backend directory"
    fi
}

# Function to stop and remove containers
stop_app() {
    print_status "Stopping OmniRepute application..."
    docker compose down --remove-orphans
    print_success "Application stopped successfully"
}

# Function to build and start the application
start_app() {
    print_status "Building and starting OmniRepute application..."
    
    # Pull latest images if needed
    docker compose pull --ignore-pull-failures
    
    # Build and start services
    docker compose up --build -d
    
    print_success "Application started successfully"
    print_status "Services are starting up..."
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    if docker compose ps | grep -q "Up (healthy)"; then
        print_success "All services are healthy and running"
    else
        print_warning "Some services may still be starting up"
    fi
}

# Function to show application status
show_status() {
    print_status "OmniRepute Application Status:"
    echo ""
    docker compose ps
    echo ""
    
    # Show logs for the last 10 lines
    print_status "Recent logs:"
    docker compose logs --tail=10
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        print_status "Showing logs for $service service:"
        docker compose logs -f "$service"
    else
        print_status "Showing logs for all services:"
        docker compose logs -f
    fi
}

# Function to restart the application
restart_app() {
    print_status "Restarting OmniRepute application..."
    stop_app
    sleep 2
    start_app
}

# Function to update the application
update_app() {
    print_status "Updating OmniRepute application..."
    
    # Pull latest code (if using git)
    if [ -d ".git" ]; then
        print_status "Pulling latest code..."
        git pull origin main
    fi
    
    # Rebuild and restart
    restart_app
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker compose down --volumes --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "OmniRepute Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start the application"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  status    Show application status"
    echo "  logs      Show application logs"
    echo "  logs [service]  Show logs for specific service (frontend/backend)"
    echo "  update    Update and restart the application"
    echo "  cleanup   Stop application and clean up Docker resources"
    echo "  help      Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  Run ./setup-prod.sh setup first to configure environment variables"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 restart"
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_env_file
    
    # Parse command line arguments
    case "${1:-start}" in
        "start")
            start_app
            ;;
        "stop")
            stop_app
            ;;
        "restart")
            restart_app
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "update")
            update_app
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
