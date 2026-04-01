#!/bin/bash

# ==============================================================================
# 🚀 ONE-CLICK DEPLOYMENT & BACKUP SCRIPT
# ==============================================================================
# Description: 
#   Automates the process of building the Jekyll site, syncing with the 
#   production repository, and backing up source code to GitHub.
#
# Usage:
#   ./deploy.sh
#
# Workflow:
#   1. Builds Jekyll site to _site/
#   2. Syncs _site/ to production repo (longaspire.github.io)
#   3. Push production changes using force-push for clean state
#   4. Commits and pulls/pushes source repo (personal_page)
# ==============================================================================

# --- Configuration ---
SOURCE_DIR="/Users/lihuan/Git/personal_page"
DEST_DIR="/Users/lihuan/Git/longaspire.github.io"
BUILD_DIR="$SOURCE_DIR/_site"

# --- Terminal UI Colors ---
BOLD='\033[1m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- UI Helpers ---
info() { echo -e "${BLUE}${BOLD}info${NC} $1"; }
success() { echo -e "${GREEN}${BOLD}success${NC} $1"; }
warn() { echo -e "${YELLOW}${BOLD}warning${NC} $1"; }
error() { echo -e "${RED}${BOLD}error${NC} $1"; }
header() {
    echo -e "\n${BOLD}==============================================================================${NC}"
    echo -e "${BOLD}🚀 $1${NC}"
    echo -e "${BOLD}==============================================================================${NC}"
}

# Exit on error
set -e

header "Starting Deployment & Backup Process"

# --- Change Detection ---
# Check if anything OTHER than deploy.sh has changed in the source directory
# We exclude 'deploy.sh' and '_site/' from the change detection.
CHANGES=$(git status --porcelain | grep -v "deploy.sh" | grep -v "_site/" || true)

if [ -z "$CHANGES" ]; then
    info "No source changes detected (excluding deploy.sh and build artifacts)."
    info "Skipping deployment and backup. See you next time! 👋"
    exit 0
fi

# 1. Build the site
header "STEP 1: Building Jekyll Site"
info "Building into $BUILD_DIR..."
cd "$SOURCE_DIR"
if bundle exec jekyll build; then
    success "Jekyll build completed successfully."
else
    error "Jekyll build failed."
    exit 1
fi

# 2. Verify build output
if [ ! -d "$BUILD_DIR" ]; then
    error "Build directory $BUILD_DIR does not exist. Aborting."
    exit 1
fi

# 3. Clean and Sync production directory
header "STEP 2: Syncing Production Repository"
info "Target: $DEST_DIR"
mkdir -p "$DEST_DIR"
cd "$DEST_DIR"

# Ensure we are on master and aligned with remote to avoid detached HEAD/conflicts
info "Aligning with remote master (force reset to origin/master)..."
git fetch origin
git checkout master || git checkout -b master
# Hard reset ensures we don't carry over local conflicts from failed previous runs
git reset --hard origin/master || warn "Remote master not found or inaccessible, starting from local state."

# Clean destination: Remove everything except .git to ensure absolute mirror of _site
info "Cleaning destination directory (preserving .git)..."
find . -maxdepth 1 ! -name ".git" ! -name "." -exec rm -rf {} +

# Copy from _site
info "Copying build artifacts to production directory..."
cp -R "$BUILD_DIR/"* .

# 4. Commit and push to production (longaspire.github.io)
header "STEP 3: Pushing to Production (GitHub)"
if [ -n "$(git status --porcelain)" ]; then
    git add .
    COMMIT_MSG="Site update: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    
    info "Force pushing to production master..."
    if git push -f origin master; then
        success "Production site is now LIVE at longaspire.github.io"
    else
        error "Failed to push to production. Check your credentials/network."
        exit 1
    fi
else
    info "No content changes detected in production."
fi

# 5. Backup source code (personal_page)
header "STEP 4: Backing Up Source Code"
info "Target: $SOURCE_DIR"
cd "$SOURCE_DIR"

info "Pulling latest changes from source remote..."
# Pull with rebase to keep history clean
git pull --rebase || warn "Pull failed, attempting to proceed with backup..."

if [ -n "$(git status --porcelain)" ]; then
    git add .
    BACKUP_MSG="Source backup: $(date '+%Y-%m-%d %H:%M:%S') - Publication updates and dynamic filters"
    git commit -m "$BACKUP_MSG"
    
    info "Pushing source code to GitHub..."
    if git push; then
        success "Source code successfully backed up."
    else
        error "Failed to backup source code."
        exit 1
    fi
else
    info "No changes to backup in source code."
fi

header "All Tasks Completed Successfully! 🎉"
echo -e "${GREEN}${BOLD}Your personal page has been updated and backed up.${NC}\n"
