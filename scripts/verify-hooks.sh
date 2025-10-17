#!/bin/bash
if ! grep -q "npx lint-staged" .husky/pre-commit; then
  echo "⚠️ Pre-commit corrupted again. Resetting..."
  echo '#!/bin/sh' > .husky/pre-commit
  echo '. "$(dirname "$0")/_/husky.sh"' >> .husky/pre-commit
  echo 'npx lint-staged' >> .husky/pre-commit
  chmod +x .husky/pre-commit
fi
