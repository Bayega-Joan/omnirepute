#!/bin/bash

# OmniRepute Production Environment Setup Script
# This script creates a .env file for production deployment

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

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    echo -n "$prompt [$default]: "
    read input
    eval "$var_name=\${input:-$default}"
}

# Function to prompt for required input
prompt_required() {
    local prompt="$1"
    local var_name="$2"
    
    while true; do
        echo -n "$prompt: "
        read input
        if [ -n "$input" ]; then
            eval "$var_name=\"$input\""
            break
        else
            print_error "This field is required. Please enter a value."
        fi
    done
}

# Function to setup new GCP credentials
setup_new_gcp_credentials() {
    print_status "Setting up new GCP service account credentials..."
    echo ""
    echo "To create a new service account:"
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
    echo "2. Navigate to IAM & Admin > Service Accounts"
    echo "3. Click 'Create Service Account'"
    echo "4. Give it a name (e.g., 'omnirepute-service')"
    echo "5. Grant these roles:"
    echo "   - BigQuery Data Viewer"
    echo "   - BigQuery Job User"
    echo "6. Create and download the JSON key"
    echo ""
    echo "After downloading the JSON file, you can:"
    echo "- Upload it to your server and specify the path"
    echo "- Copy and paste the JSON content"
    echo ""
    
    echo -n "Do you want to paste the JSON content now? (y/N): "
    read paste_json
    
    if [[ "$paste_json" =~ ^[Yy]$ ]]; then
        echo ""
        print_status "Paste your service account JSON content (press Ctrl+D when done):"
        echo ""
        
        # Create temporary file for JSON input
        local temp_file=$(mktemp)
        cat > "$temp_file"
        
        # Validate JSON
        if jq empty "$temp_file" 2>/dev/null; then
            cp "$temp_file" "omni-repute-backend/gcp-credentials.json"
            rm "$temp_file"
            GCP_CREDENTIALS_PATH="gcp-credentials.json"
            print_success "GCP credentials saved to omni-repute-backend/gcp-credentials.json"
        else
            print_error "Invalid JSON format. Please try again."
            rm "$temp_file"
            GCP_CREDENTIALS_PATH=""
        fi
    else
        echo ""
        prompt_with_default "Path to your GCP credentials JSON file" "" "GCP_CREDENTIALS_PATH"
        
        if [ -n "$GCP_CREDENTIALS_PATH" ] && [ -f "$GCP_CREDENTIALS_PATH" ]; then
            # Copy to backend directory
            cp "$GCP_CREDENTIALS_PATH" "omni-repute-backend/gcp-credentials.json"
            GCP_CREDENTIALS_PATH="gcp-credentials.json"
            print_success "GCP credentials copied to omni-repute-backend/gcp-credentials.json"
        else
            print_warning "File not found or path not provided. You'll need to add credentials manually."
            GCP_CREDENTIALS_PATH=""
        fi
    fi
}

# Function to setup existing GCP credentials
setup_existing_gcp_credentials() {
    print_status "Using existing GCP credentials..."
    echo ""
    
    prompt_with_default "Path to your existing GCP credentials JSON file" "" "GCP_CREDENTIALS_PATH"
    
    if [ -n "$GCP_CREDENTIALS_PATH" ] && [ -f "$GCP_CREDENTIALS_PATH" ]; then
        # Copy to backend directory
        cp "$GCP_CREDENTIALS_PATH" "omni-repute-backend/gcp-credentials.json"
        GCP_CREDENTIALS_PATH="gcp-credentials.json"
        print_success "GCP credentials copied to omni-repute-backend/gcp-credentials.json"
    else
        print_warning "File not found or path not provided. You'll need to add credentials manually."
        GCP_CREDENTIALS_PATH=""
    fi
}

# Function to create .env file
create_env_file() {
    print_status "Setting up OmniRepute production environment..."
    echo ""
    
    # Check if .env already exists in backend directory
    if [ -f "omni-repute-backend/.env" ]; then
        print_warning ".env file already exists in omni-repute-backend directory."
        echo -n "Do you want to overwrite it? (y/N): "
        read overwrite
        if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
            print_status "Keeping existing .env file."
            return 0
        fi
    fi
    
    # Gather configuration
    echo "Please provide the following configuration details:"
    echo ""
    
    prompt_required "Google Cloud Project ID" "GCP_PROJECT_ID"
    prompt_required "Gemini API Key" "API_KEY"
    
    echo ""
    print_status "GCP Service Account Configuration:"
    echo "Do you want to set up GCP service account credentials?"
    echo "This is required for BigQuery access."
    echo ""
    echo -n "Set up GCP credentials? (y/N): "
    read setup_gcp
    
    if [[ "$setup_gcp" =~ ^[Yy]$ ]]; then
        echo ""
        print_status "GCP Service Account Setup Options:"
        echo "1. Create new service account credentials"
        echo "2. Use existing credentials file"
        echo "3. Skip for now (configure manually later)"
        echo ""
        echo -n "Choose option (1-3): "
        read gcp_option
        
        case "$gcp_option" in
            "1")
                setup_new_gcp_credentials
                ;;
            "2")
                setup_existing_gcp_credentials
                ;;
            "3")
                print_warning "Skipping GCP credentials setup. You'll need to configure this manually."
                GCP_CREDENTIALS_PATH=""
                ;;
            *)
                print_warning "Invalid option. Skipping GCP credentials setup."
                GCP_CREDENTIALS_PATH=""
                ;;
        esac
    else
        GCP_CREDENTIALS_PATH=""
    fi
    
    echo ""
    print_status "Optional configuration (press Enter to use defaults):"
    echo ""
    
    prompt_with_default "Node Environment (production/development)" "production" "NODE_ENV"
    prompt_with_default "Backend Port" "3001" "PORT"
    prompt_with_default "Log Level (info/debug/error)" "info" "LOG_LEVEL"
    
    echo ""
    print_status "CORS Configuration:"
    echo "Enter allowed origins (comma-separated). Common examples:"
    echo "  - http://localhost:3000,http://localhost:5173"
    echo "  - https://yourdomain.com,https://www.yourdomain.com"
    echo "  - https://yourdomain.com,http://localhost:3000"
    echo ""
    
    prompt_with_default "Allowed Origins" "https://omnirepute.samuelninsiima.com,http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173" "ALLOWED_ORIGINS"
    
    # Create .env file in backend directory
    print_status "Creating .env file in omni-repute-backend directory..."
    
    cat > omni-repute-backend/.env << EOF
# OmniRepute Production Environment Configuration
# Generated on $(date)

# Google Cloud Platform Configuration
GOOGLE_APPLICATION_CREDENTIALS=${GCP_CREDENTIALS_PATH:-./gcp-credentials.json}
GCP_PROJECT_ID=$GCP_PROJECT_ID
API_KEY=$API_KEY

# Application Configuration
NODE_ENV=$NODE_ENV
PORT=$PORT
LOG_LEVEL=$LOG_LEVEL

# CORS Configuration
ALLOWED_ORIGINS=$ALLOWED_ORIGINS

# Optional: Additional Configuration
# Uncomment and configure if needed

# Database Configuration (if using additional databases)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=omnirepute
# DB_USER=your-db-user
# DB_PASSWORD=your-db-password

# Redis Configuration (if using Redis for caching)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=your-redis-password

# Monitoring Configuration
# SENTRY_DSN=your-sentry-dsn
# LOG_FILE_PATH=/var/log/omnirepute/app.log
EOF

    print_success ".env file created successfully in omni-repute-backend directory!"
    echo ""
    
    # Show summary
    print_status "Configuration Summary:"
    echo "  GCP Project ID: $GCP_PROJECT_ID"
    echo "  API Key: ${API_KEY:0:8}..."
    if [ -n "$GCP_CREDENTIALS_PATH" ]; then
        echo "  GCP Credentials: $GCP_CREDENTIALS_PATH"
    else
        echo "  GCP Credentials: Not configured"
    fi
    echo "  Node Environment: $NODE_ENV"
    echo "  Port: $PORT"
    echo "  Log Level: $LOG_LEVEL"
    echo "  Allowed Origins: $ALLOWED_ORIGINS"
    echo ""
    
    # Security reminder
    print_warning "Security Reminders:"
    echo "  - Keep your .env file secure and never commit it to version control"
    echo "  - Keep your gcp-credentials.json file secure and never commit it"
    echo "  - Ensure your Gemini API key has appropriate permissions"
    echo "  - Update CORS origins to match your production domains"
    echo "  - Consider using environment-specific API keys"
    echo "  - Restrict GCP service account permissions to minimum required"
    echo ""
    
    # Next steps
    print_status "Next Steps:"
    echo "  1. Review the .env file: cat omni-repute-backend/.env"
    echo "  2. Start the application: ./deploy.sh start"
    echo "  3. Check application status: ./deploy.sh status"
    echo "  4. View logs: ./deploy.sh logs"
}

# Function to validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    if [ ! -f "omni-repute-backend/.env" ]; then
        print_error ".env file not found in omni-repute-backend directory. Please run the setup script first."
        exit 1
    fi
    
    # Source the .env file
    source omni-repute-backend/.env
    
    # Check required variables
    if [ -z "$GCP_PROJECT_ID" ]; then
        print_error "GCP_PROJECT_ID is not set in .env file"
        exit 1
    fi
    
    if [ -z "$API_KEY" ]; then
        print_error "API_KEY is not set in .env file"
        exit 1
    fi
    
    # Check GCP credentials file
    if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ] && [ ! -f "omni-repute-backend/$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        print_warning "GCP credentials file not found: omni-repute-backend/$GOOGLE_APPLICATION_CREDENTIALS"
        print_warning "Make sure the file exists or run ./setup-prod.sh setup to configure it"
    fi
    
    print_success "Configuration validation passed!"
}

# Function to show help
show_help() {
    echo "OmniRepute Production Environment Setup"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     Create .env file interactively"
    echo "  validate  Validate existing .env file"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 validate"
}

# Main script logic
main() {
    case "${1:-setup}" in
        "setup")
            create_env_file
            ;;
        "validate")
            validate_config
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
