#!/bin/bash

echo "Removing vibe symlinks..."
rm -f .cursorrules
rm -f .clinerules
rm -f .windsurfrules
rm -f .supermavenrules
rm -f .aider.conf.yml
rm -f .geminiconfig
rm -f .symlinks

# Remove only the copilot symlink from .github (keep .github directory)
rm -f .github/copilot-instructions.yml

# Remove symlink and directory for .cody
rm -f .cody/context.md
rm -rf .cody

# Remove symlink and directory for .continue
rm -f .continue/config.json
rm -rf .continue

echo "All vibe symlinks removed and non-GitHub directories deleted"