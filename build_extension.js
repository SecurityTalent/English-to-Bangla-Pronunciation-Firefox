const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, "dist");
const BUILD_DIR = path.join(DIST_DIR, "extension");
const VERSION = require(path.join(ROOT_DIR, "manifest.json")).version;
const ZIP_NAME = `bangla-phonetic-pronunciation-v${VERSION}.zip`;
const XPI_NAME = `bangla-phonetic-pronunciation-v${VERSION}.xpi`;
const ZIP_PATH = path.join(DIST_DIR, ZIP_NAME);
const XPI_PATH = path.join(DIST_DIR, XPI_NAME);

console.log("=========================================");
console.log("📦 Packaging Firefox Extension for AMO...");
console.log("=========================================");

// 1. Clean only the temporary staging directory; preserve unrelated dist files.
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(BUILD_DIR, { recursive: true });

// 2. Files and folders to include
const filesToCopy = [
  "manifest.json",
  "background.js",
  "content.js",
  "content.css",
  "options.html",
  "options.js"
];

filesToCopy.forEach(file => {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(BUILD_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied: ${file}`);
  } else {
    console.warn(`⚠️ Warning: Missing ${file}`);
  }
});

// Copy icons folder
const iconsSrc = path.join(ROOT_DIR, "icons");
const iconsDest = path.join(BUILD_DIR, "icons");
if (fs.existsSync(iconsSrc)) {
  fs.mkdirSync(iconsDest, { recursive: true });
  fs.readdirSync(iconsSrc).forEach(iconFile => {
    fs.copyFileSync(path.join(iconsSrc, iconFile), path.join(iconsDest, iconFile));
  });
  console.log("✓ Copied: icons/");
}

// 3. Create ZIP using native Windows tar (bsdtar)
console.log("\nCompressing archive...");
try {
  // Run tar inside the BUILD_DIR so root of zip contains manifest.json directly
  execSync(`tar -a -cf "${ZIP_PATH}" *`, {
    cwd: BUILD_DIR,
    stdio: "inherit"
  });

  // Also create .xpi
  fs.copyFileSync(ZIP_PATH, XPI_PATH);

  // Clean up temporary build folder
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });

  const stats = fs.statSync(ZIP_PATH);
  console.log("\n=========================================");
  console.log("🎉 Build Successful!");
  console.log(`📁 ZIP Package : ${ZIP_PATH} (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log(`📁 XPI Package : ${XPI_PATH}`);
  console.log("=========================================");
  console.log("Ready to upload directly to Mozilla Add-ons (AMO): https://addons.mozilla.org/developers/");
} catch (err) {
  console.error("❌ Failed to create zip:", err);
  process.exit(1);
}
