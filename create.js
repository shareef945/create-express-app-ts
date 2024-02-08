#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const targetDir = process.argv[2] || process.cwd();

const templateDir = __dirname;

const ignoreList = [".gitignore", ".npmignore", "node_modules", "create.js"];

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

function installDependencies() {
  execSync("npm install", { stdio: "inherit" });
}

function main() {
  console.log("Setting up a new Node.js app...");
  copyFiles(templateDir, targetDir, ignoreList);

  installDependencies();
  console.log("Your Node.js app is ready!");
  console.log("Check our documentation here - https://www.npmjs.com/package/create-node-app-scaffold");
}

main();
