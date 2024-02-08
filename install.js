#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const targetDir = process.cwd();

const templateDir = __dirname;

const ignoreList = [".gitignore", ".npmignore", "node_modules", ".git"];

function copyFiles(srcDir, destDir, ignoreList) {
  console.log(`srcDir: ${srcDir}`);
  console.log(`destDir: ${destDir}`);

  fs.readdirSync(srcDir).forEach((file) => {
    console.log(`file: ${file}`);

    if (ignoreList.includes(file)) {
      return;
    }

    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    console.log(`srcFile: ${srcFile}`);
    console.log(`destFile: ${destFile}`);

    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      fs.mkdirSync(destFile, { recursive: true });
      copyFiles(srcFile, destFile, ignoreList);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}
copyFiles(templateDir, targetDir, ignoreList);
