#!/bin/bash

# Function to check internet connection
check_internet() {
    echo "Checking internet connection..."
    if ping -c 1 google.com &> /dev/null
    then
        echo "Internet connection is active."
    else
        echo "No internet connection. Please check your network."
        exit 1
    fi
}

# Function to verify GitHub repository URL
verify_repo_url() {
    echo "Verifying GitHub repository URL..."
    if git ls-remote "$1" &> /dev/null
    then
        echo "Repository URL is valid."
    else
        echo "Invalid repository URL. Please check the URL."
        exit 1
    fi
}

# Function to check GitHub status
check_github_status() {
    echo "Checking GitHub status..."
    if curl -s https://www.githubstatus.com/ | grep "All Systems Operational" &> /dev/null
    then
        echo "GitHub is operational."
    else
        echo "GitHub is experiencing issues. Please try again later."
        exit 1
    fi
}

# Function to verify authentication
verify_authentication() {
    echo "Verifying authentication..."
    if git ls-remote "$1" &> /dev/null
    then
        echo "Authentication is successful."
    else
        echo "Authentication failed. Please check your credentials."
        exit 1
    fi
}

# Function to check Git version
check_git_version() {
    echo "Checking Git version..."
    if git --version &> /dev/null
    then
        echo "Git is installed."
    else
        echo "Git is not installed. Please install Git."
        exit 1
    fi
}

# Function to check repository access
check_repo_access() {
    echo "Checking repository access..."
    if git ls-remote "$1" &> /dev/null
    then
        echo "Repository access is valid."
    else
        echo "Repository access denied. Please check your permissions."
        exit 1
    fi
}

# Main script execution
REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
    echo "Usage: $0 <repository-url>"
    echo "Example: $0 https://github.com/username/repository.git"
    exit 1
fi

check_internet
verify_repo_url "$REPO_URL"
check_github_status
verify_authentication "$REPO_URL"
check_git_version
check_repo_access "$REPO_URL"

# Fetch the latest commit SHA for the Codetrackr extension
echo "Fetching the latest commit SHA for the Codetrackr extension..."
LATEST_COMMIT_SHA=$(git ls-remote "$REPO_URL" HEAD | awk '{ print $1 }')

if [ -z "$LATEST_COMMIT_SHA" ]; then
    echo "Failed to fetch the latest commit SHA. Debug information:"
    echo "Repository URL: $REPO_URL"
    git ls-remote "$REPO_URL" HEAD
    exit 1
else
    echo "The latest commit SHA is: $LATEST_COMMIT_SHA"
fi

echo "All checks passed. You should be able to fetch the commit from GitHub."
