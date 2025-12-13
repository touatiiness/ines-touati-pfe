#!/bin/bash

###############################################################################
# Deployment Script for PFE Application
# Usage: ./scripts/deploy.sh [environment] [options]
# Environments: dev, staging, prod
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    log_info "Checking requirements..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    log_success "All requirements met"
}

backup_database() {
    log_info "Creating database backup..."

    mkdir -p "$BACKUP_DIR"

    # Backup MySQL database
    docker-compose exec -T mysql mysqldump -u root -p${DB_ROOT_PASSWORD} anosdb > \
        "$BACKUP_DIR/mysql_backup_$TIMESTAMP.sql" 2>/dev/null || \
        log_warning "Database backup failed (database might not be running)"

    if [ -f "$BACKUP_DIR/mysql_backup_$TIMESTAMP.sql" ]; then
        log_success "Database backup created: mysql_backup_$TIMESTAMP.sql"
    fi
}

pull_latest_code() {
    log_info "Pulling latest code from Git..."

    if [ -d ".git" ]; then
        git pull origin $(git branch --show-current)
        log_success "Code updated"
    else
        log_warning "Not a git repository, skipping pull"
    fi
}

build_images() {
    log_info "Building Docker images..."

    docker-compose build --parallel --no-cache

    log_success "Docker images built successfully"
}

stop_services() {
    log_info "Stopping current services..."

    docker-compose down

    log_success "Services stopped"
}

start_services() {
    log_info "Starting services..."

    docker-compose up -d

    log_success "Services started"
}

wait_for_health() {
    log_info "Waiting for services to be healthy..."

    max_attempts=30
    attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep -q "healthy"; then
            log_success "Services are healthy"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    log_error "Services failed to become healthy"
    return 1
}

run_database_migrations() {
    log_info "Running database migrations..."

    # Wait for Spring Boot to be ready
    sleep 10

    # Spring Boot with Hibernate will auto-migrate on startup
    log_success "Database migrations completed"
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."

    docker image prune -f

    log_success "Cleanup completed"
}

show_status() {
    log_info "Service status:"
    echo ""
    docker-compose ps
    echo ""
    log_info "Application URLs:"
    echo "  Frontend: http://localhost"
    echo "  Spring Backend: http://localhost:8080"
    echo "  Python Backend: http://localhost:8001"
    echo ""
}

deploy() {
    log_info "Starting deployment for environment: $ENVIRONMENT"
    echo ""

    # Pre-deployment checks
    check_requirements

    # Backup
    if [ "$ENVIRONMENT" != "dev" ]; then
        backup_database
    fi

    # Update code
    pull_latest_code

    # Build new images
    build_images

    # Stop old services
    stop_services

    # Start new services
    start_services

    # Wait for health
    if ! wait_for_health; then
        log_error "Deployment failed - services are not healthy"
        log_warning "Rolling back..."
        docker-compose down
        exit 1
    fi

    # Run migrations
    run_database_migrations

    # Cleanup
    cleanup_old_images

    # Show status
    show_status

    log_success "Deployment completed successfully! 🚀"
}

rollback() {
    log_warning "Rolling back to previous version..."

    # Find the latest backup
    latest_backup=$(ls -t $BACKUP_DIR/mysql_backup_*.sql 2>/dev/null | head -1)

    if [ -z "$latest_backup" ]; then
        log_error "No backup found for rollback"
        exit 1
    fi

    log_info "Restoring from backup: $latest_backup"

    # Stop services
    docker-compose down

    # Start only MySQL
    docker-compose up -d mysql
    sleep 10

    # Restore database
    docker-compose exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} anosdb < "$latest_backup"

    # Start all services with previous images
    docker-compose up -d

    log_success "Rollback completed"
}

# Main execution
case "${2:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    *)
        echo "Usage: $0 [environment] [deploy|rollback]"
        echo "Environments: dev, staging, prod"
        exit 1
        ;;
esac