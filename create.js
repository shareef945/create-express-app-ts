#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get the project directory from the command line arguments
const targetDir = process.argv[2] || process.cwd();

// Get the directory of the package files
const templateDir = path.__dirname;

// List of files to ignore
const ignoreList = [".gitignore", ".npmignore", "node_modules", "create.js"];

// Function to copy files recursively
function copyFiles(srcDir, destDir, ignoreList) {
  fs.readdirSync(srcDir).forEach((file) => {
    if (ignoreList.includes(file)) {
      return;
    }

    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      fs.mkdirSync(destFile, { recursive: true });
      copyFiles(srcFile, destFile, ignoreList);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// Start the copying process
copyFiles(templateDir, targetDir, ignoreList);
