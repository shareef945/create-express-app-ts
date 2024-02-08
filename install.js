const fs = require("fs");
const path = require("path");

const targetDir = process.cwd();

const templateDir = __dirname;

const ignoreList = [".gitignore", ".npmignore", "node_modules", ".git"];

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

copyFiles(templateDir, targetDir, ignoreList);
