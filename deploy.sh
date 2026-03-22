#!/bin/bash

# Configuration
SOURCE_DIR="/Users/lihuan/Git/personal_page"
DEST_DIR="/Users/lihuan/Git/longaspire.github.io"
BUILD_DIR="$SOURCE_DIR/_site"

# Exit on error
set -e

echo "🚀 Starting deployment and backup process..."

# 1. Build the site
echo "🔨 Building Jekyll site..."
cd "$SOURCE_DIR"
bundle exec jekyll build

# 2. Verify build output
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build directory $BUILD_DIR does not exist."
    exit 1
fi

# 3. Clean and Sync production directory
echo "🧹 Cleaning and syncing production directory: $DEST_DIR"
mkdir -p "$DEST_DIR"
cd "$DEST_DIR"

# Ensure we are on master and aligned with remote to avoid detached HEAD/conflicts
echo "📥 Aligning with production remote (master)..."
git fetch origin
git checkout master || git checkout -b master
git reset --hard origin/master || echo "⚠️ Remote master not found, starting fresh..."

# Remove everything except .git
find . -maxdepth 1 ! -name ".git" ! -name "." -exec rm -rf {} +

# Copy from _site
cp -R "$BUILD_DIR/"* .

# 4. Commit and push to production (longaspire.github.io)
echo "📦 Committing and pushing to production repository..."
if [ -n "$(git status --porcelain)" ]; then
    git add .
    COMMIT_MSG="Site update: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"
    
    echo "☁️ Force pushing to production master..."
    if git push -f origin master; then
        echo "✅ Successfully pushed to production (forced)."
    else
        echo "❌ Failed to push to production. Please check your connection or permissions."
        exit 1
    fi
else
    echo "ℹ️ No changes to commit in production."
fi

# 5. Backup source code (personal_page)
echo "💾 Backing up source code: $SOURCE_DIR"
cd "$SOURCE_DIR"

echo "📥 Pulling latest from source backup..."
git pull --rebase || echo "⚠️ Pull failed, proceeding..."

if [ -n "$(git status --porcelain)" ]; then
    git add .
    BACKUP_MSG="Source backup: $(date '+%Y-%m-%d %H:%M:%S') - Publication updates and dynamic filters"
    git commit -m "$BACKUP_MSG"
    
    echo "☁️ Pushing source code to backup..."
    if git push; then
        echo "✅ Successfully backed up source code."
    else
        echo "❌ Failed to backup source code. Please check your connection or permissions."
        exit 1
    fi
else
    echo "ℹ️ No changes to commit in source code."
fi

echo "🎉 Deployment and backup completed successfully!"
