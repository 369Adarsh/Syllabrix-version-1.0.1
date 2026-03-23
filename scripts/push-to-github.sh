#!/bin/bash
# Push Syllabrix to GitHub for the first time
# Run from project root: bash scripts/push-to-github.sh

echo "=============================="
echo "  Syllabrix → GitHub Push"
echo "=============================="

# Check if remote exists
if ! git remote | grep -q origin; then
  echo ""
  echo "No remote 'origin' found."
  echo "Run this first:"
  echo "  git remote add origin https://github.com/YOUR_USERNAME/syllabrix-project.git"
  echo ""
  exit 1
fi

echo ""
echo "Pushing develop branch..."
git push -u origin develop

echo ""
echo "Creating and pushing qa branch..."
git checkout -b qa 2>/dev/null || git checkout qa
git merge develop
git push -u origin qa

echo ""
echo "Creating and pushing main branch..."
git checkout -b main 2>/dev/null || git checkout main
git merge qa
git push -u origin main

echo ""
echo "Switching back to develop..."
git checkout develop

echo ""
echo "Done! All 3 branches pushed:"
echo "  develop → active development"
echo "  qa      → testing"
echo "  main    → production"
echo ""
