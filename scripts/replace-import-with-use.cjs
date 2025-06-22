const fs = require("fs");
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "../src");
const STYLES_DIR = path.join(SRC_DIR, "styles");

function isInStylesFolder(filePath) {
  return filePath.startsWith(STYLES_DIR);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  // Replace @import "foo"; or @import 'foo'; with @use "foo";
  // Do NOT replace @import url(...)
  const replaced = content.replace(
    /^@import\s+(['"])(?!url\()([^'"]+)\1\s*;/gm,
    "@use $1$2$1;"
  );
  if (replaced !== content) {
    fs.writeFileSync(filePath, replaced, "utf8");
    console.log(`Updated: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip the styles folder
      if (fullPath === STYLES_DIR) return;
      walk(fullPath);
    } else if (file.endsWith(".scss") && !isInStylesFolder(fullPath)) {
      processFile(fullPath);
    }
  });
}

walk(SRC_DIR);
console.log("Done replacing @import with @use!");
