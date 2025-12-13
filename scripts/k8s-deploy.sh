#!/bin/bash

###############################################################################
# Kubernetes Deployment Script for PFE Application
# Usage: ./scripts/k8s-deploy.sh [command] [options]
# Commands: deploy, rollback, status, logs
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="pfe-app"
K8S_DIR="./k8s"

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    log_success "kubectl found"
}

create_namespace() {
    log_info "Creating namespace..."
    kubectl apply -f "$K8S_DIR/namespace.yaml"
    log_success "Namespace created/updated"
}

deploy_secrets() {
    log_info "Deploying secrets..."

    # Check if secrets exist
    if ! kubectl get secret mysql-secret -n $NAMESPACE &> /dev/null; then
        log_warning "Creating MySQL secret..."
        kubectl apply -f "$K8S_DIR/mysql-deployment.yaml"
    fi

    if ! kubectl get secret backend-spring-secret -n $NAMESPACE &> /dev/null; then
        log_warning "Creating Spring Boot secret..."
        kubectl apply -f "$K8S_DIR/backend-spring-deployment.yaml"
    fi

    if ! kubectl get secret backend-python-secret -n $NAMESPACE &> /dev/null; then
        log_warning "Creating Python Backend secret..."
        kubectl apply -f "$K8S_DIR/backend-python-deployment.yaml"
    fi

    log_success "Secrets deployed"
}

deploy_database() {
    log_info "Deploying MySQL database..."
    kubectl apply -f "$K8S_DIR/mysql-deployment.yaml"

    log_info "Waiting for MySQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=300s || true

    log_success "MySQL deployed"
}

deploy_backends() {
    log_info "Deploying backend services..."

    # Deploy Spring Boot Backend
    kubectl apply -f "$K8S_DIR/backend-spring-deployment.yaml"

    # Deploy Python Backend
    kubectl apply -f "$K8S_DIR/backend-python-deployment.yaml"

    log_info "Waiting for backends to be ready..."
    kubectl wait --for=condition=available deployment/backend-spring -n $NAMESPACE --timeout=300s || true
    kubectl wait --for=condition=available deployment/backend-python -n $NAMESPACE --timeout=300s || true

    log_success "Backends deployed"
}

deploy_frontend() {
    log_info "Deploying frontend..."
    kubectl apply -f "$K8S_DIR/frontend-deployment.yaml"

    log_info "Waiting for frontend to be ready..."
    kubectl wait --for=condition=available deployment/frontend -n $NAMESPACE --timeout=300s || true

    log_success "Frontend deployed"
}

deploy_ingress() {
    log_info "Deploying ingress..."
    kubectl apply -f "$K8S_DIR/ingress.yaml"

    log_success "Ingress deployed"
}

full_deploy() {
    log_info "Starting full deployment to Kubernetes..."
    echo ""

    check_kubectl
    create_namespace
    deploy_secrets
    deploy_database
    deploy_backends
    deploy_frontend
    deploy_ingress

    echo ""
    log_success "Deployment completed successfully! 🚀"
    show_status
}

rollback_deployment() {
    local service=$1

    if [ -z "$service" ]; then
        log_error "Please specify a service to rollback (backend-spring, backend-python, frontend)"
        exit 1
    fi

    log_info "Rolling back $service..."

    kubectl rollout undo deployment/$service -n $NAMESPACE

    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment/$service -n $NAMESPACE

    log_success "Rollback completed for $service"
}

show_status() {
    log_info "Cluster Status:"
    echo ""

    echo "=== Pods ==="
    kubectl get pods -n $NAMESPACE
    echo ""

    echo "=== Services ==="
    kubectl get svc -n $NAMESPACE
    echo ""

    echo "=== Deployments ==="
    kubectl get deployments -n $NAMESPACE
    echo ""

    echo "=== Ingress ==="
    kubectl get ingress -n $NAMESPACE
    echo ""

    # Get LoadBalancer IP if available
    INGRESS_IP=$(kubectl get ingress pfe-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ -n "$INGRESS_IP" ]; then
        log_info "Application URL: http://$INGRESS_IP"
    else
        log_warning "Ingress IP not yet assigned"
    fi
}

show_logs() {
    local service=${1:-all}

    if [ "$service" = "all" ]; then
        log_info "Showing logs for all services..."
        kubectl logs -n $NAMESPACE -l app=backend-spring --tail=50
        kubectl logs -n $NAMESPACE -l app=backend-python --tail=50
        kubectl logs -n $NAMESPACE -l app=frontend --tail=50
    else
        log_info "Showing logs for $service..."
        kubectl logs -n $NAMESPACE -l app=$service --tail=100 -f
    fi
}

scale_deployment() {
    local service=$1
    local replicas=$2

    if [ -z "$service" ] || [ -z "$replicas" ]; then
        log_error "Usage: $0 scale <service> <replicas>"
        exit 1
    fi

    log_info "Scaling $service to $replicas replicas..."
    kubectl scale deployment/$service -n $NAMESPACE --replicas=$replicas

    log_success "Scaling completed"
    kubectl get deployment/$service -n $NAMESPACE
}

delete_all() {
    log_warning "This will delete all resources in namespace $NAMESPACE"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        log_info "Deleting all resources..."
        kubectl delete namespace $NAMESPACE
        log_success "All resources deleted"
    else
        log_info "Deletion cancelled"
    fi
}

# Main execution
case "${1:-deploy}" in
    deploy)
        full_deploy
        ;;
    rollback)
        rollback_deployment $2
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs $2
        ;;
    scale)
        scale_deployment $2 $3
        ;;
    delete)
        delete_all
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|logs|scale|delete} [options]"
        echo ""
        echo "Commands:"
        echo "  deploy              - Deploy all services to Kubernetes"
        echo "  rollback <service>  - Rollback a deployment"
        echo "  status              - Show cluster status"
        echo "  logs [service]      - Show logs (default: all)"
        echo "  scale <service> <n> - Scale a deployment"
        echo "  delete              - Delete all resources"
        exit 1
        ;;
esac