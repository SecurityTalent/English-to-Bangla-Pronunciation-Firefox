const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, "dist");
const COMMON_FILES = [
  "background.js",
  "content.js",
  "content.css",
  "options.html",
  "options.js"
];

function stagePackage(target, manifestPath, sourceDir = ROOT_DIR, includeFirefoxIcons = false, keepUnpacked = false) {
  const stageDir = path.join(DIST_DIR, `${target}-unpacked`);
  const manifest = require(manifestPath);
  const zipPath = path.join(DIST_DIR, `bangla-phonetic-pronunciation-${target}-v${manifest.version}.zip`);
  fs.rmSync(stageDir, { recursive: true, force: true });
  fs.mkdirSync(stageDir, { recursive: true });

  fs.copyFileSync(manifestPath, path.join(stageDir, "manifest.json"));
  for (const file of COMMON_FILES) {
    fs.copyFileSync(path.join(sourceDir, file), path.join(stageDir, file));
  }

  if (includeFirefoxIcons) {
    const iconsDir = path.join(stageDir, "icons");
    fs.mkdirSync(iconsDir, { recursive: true });
    for (const iconFile of fs.readdirSync(path.join(ROOT_DIR, "icons"))) {
      fs.copyFileSync(path.join(ROOT_DIR, "icons", iconFile), path.join(iconsDir, iconFile));
    }
  }

  execSync(`tar -a -cf "${zipPath}" *`, { cwd: stageDir, stdio: "inherit" });
  if (!keepUnpacked) fs.rmSync(stageDir, { recursive: true, force: true });
  return zipPath;
}

fs.mkdirSync(DIST_DIR, { recursive: true });

// Build Firefox and Chrome packages from the same shared extension code.
console.log("Packaging Firefox and Chrome extensions...");
const firefoxManifestPath = path.join(ROOT_DIR, "manifest.json");
const firefoxZipPath = stagePackage("firefox", firefoxManifestPath, ROOT_DIR, true);
const firefoxManifest = require(firefoxManifestPath);
const xpiPath = path.join(DIST_DIR, `bangla-phonetic-pronunciation-v${firefoxManifest.version}.xpi`);
try {
  fs.copyFileSync(firefoxZipPath, xpiPath);
} catch (error) {
  const updatedXpi = path.join(DIST_DIR, `bangla-phonetic-pronunciation-v${firefoxManifest.version}-updated.xpi`);
  fs.copyFileSync(firefoxZipPath, updatedXpi);
  console.warn(`Existing XPI is locked; wrote ${updatedXpi}`);
}
const chromeManifestPath = path.join(ROOT_DIR, "chrome", "manifest.json");
const chromeSourceDir = path.join(ROOT_DIR, "chrome");
const chromeZipPath = stagePackage("chrome", chromeManifestPath, chromeSourceDir, false, true);

console.log(`Firefox ZIP: ${firefoxZipPath}`);
console.log(`Firefox XPI: ${xpiPath}`);
console.log(`Chrome ZIP:  ${chromeZipPath}`);
console.log(`Chrome unpacked: ${path.join(DIST_DIR, "chrome-unpacked")}`);
