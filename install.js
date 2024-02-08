#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const targetDir = process.cwd();
const templateDir = path.join(__dirname);

function copyFiles(srcDir, destDir) {
  fs.readdirSync(srcDir).forEach((file) => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      fs.mkdirSync(destFile, { recursive: true });
      copyFiles(srcFile, destFile);
    } else if (!file.startsWith(".") && !file.endsWith(".gitignore")) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

copyFiles(templateDir, targetDir);
