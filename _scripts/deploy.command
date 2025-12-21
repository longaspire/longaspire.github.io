#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( dirname "$SCRIPT_DIR" )"
CONFIG_FILE="$SCRIPT_DIR/config.conf"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: Configuration file not found at $CONFIG_FILE"
    exit 1
fi

echo "------------------------------------------"
echo "🚀 Starting Deployment Process"
echo "📅 Date: $(date)"
echo "------------------------------------------"

# 1. Validation
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Error: Source directory '$SOURCE_DIR' does not exist."
    echo "Please update SOURCE_DIR in $CONFIG_FILE"
    exit 1
fi

echo "📂 Source: $SOURCE_DIR"
echo "🏠 Target: $REPO_ROOT"

# 2. Cleaning Target (except .git and _scripts)
echo "🧹 Step 1: Cleaning target directory..."
find "$REPO_ROOT" -maxdepth 1 -not -name ".git" -not -name "_scripts" -not -name "$(basename "$REPO_ROOT")" -not -path "$REPO_ROOT" -exec rm -rf {} +
echo "✅ Cleaned."

# 3. Copying Files
echo "📦 Step 2: Copying files from source..."
cp -R "$SOURCE_DIR/"* "$REPO_ROOT/"
echo "✅ Files copied."

# 4. Git Operations
echo "📂 Step 3: Git operations..."
cd "$REPO_ROOT"

# Check for changes
if [[ -z $(git status -s) ]]; then
    echo "ℹ️ No changes to commit."
else
    git add .
    echo "✅ Files added to git."

    COMMIT_MSG="Site update: $(date +'%Y-%m-%d %H:%M:%S') - automatic deployment"
    git commit -m "$COMMIT_MSG"
    echo "✅ Committed with message: $COMMIT_MSG"

    echo "⬆️ Pushing to GitHub..."
    git push
    echo "✅ Successfully pushed."
fi

echo "------------------------------------------"
echo "✨ Deployment Complete!"
echo "------------------------------------------"
