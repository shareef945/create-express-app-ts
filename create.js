#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");


// Get the project directory from the command line arguments
const targetDir = process.argv[2] || process.cwd();

// Get the directory of the package files
const templateDir = __dirname;

// List of files to ignore
const ignoreList = [".gitignore", ".npmignore", "node_modules", "create.js"];


// Function to copy your template files from the package to the user's current directory
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

// Function to install dependencies, if necessary
function installDependencies() {
  execSync("npm install", { stdio: "inherit" });
}

// Main function to orchestrate the setup
function main() {
  console.log("Setting up a new Node.js app...");
  copyFiles(templateDir, targetDir, ignoreList);

  installDependencies();
  console.log("Your Node.js app is ready!");
}

main();
