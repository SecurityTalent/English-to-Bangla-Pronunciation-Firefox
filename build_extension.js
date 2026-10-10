const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = __dirname;
const DIST_DIR = path.join(ROOT_DIR, "dist");
const FILES = ["manifest.json", "background.js", "content.js", "content.css", "options.html", "options.js"];

function buildPackage(browserName, sourceDir, makeXpi = false) {
  const manifest = JSON.parse(fs.readFileSync(path.join(sourceDir, "manifest.json"), "utf8"));
  const unpackedDir = path.join(DIST_DIR, `${browserName}-unpacked`);
  const zipPath = path.join(DIST_DIR, `bangla-phonetic-pronunciation-${browserName}-v${manifest.version}.zip`);
  fs.rmSync(unpackedDir, { recursive: true, force: true });
  fs.mkdirSync(unpackedDir, { recursive: true });

  for (const file of FILES) {
    fs.copyFileSync(path.join(sourceDir, file), path.join(unpackedDir, file));
  }
  fs.cpSync(path.join(sourceDir, "icons"), path.join(unpackedDir, "icons"), { recursive: true });
  execSync(`tar -a -cf "${zipPath}" *`, { cwd: unpackedDir, stdio: "inherit" });

  let xpiPath;
  if (makeXpi) {
    xpiPath = path.join(DIST_DIR, `bangla-phonetic-pronunciation-v${manifest.version}.xpi`);
    fs.copyFileSync(zipPath, xpiPath);
  }

  return { zipPath, unpackedDir, xpiPath };
}

fs.mkdirSync(DIST_DIR, { recursive: true });
const chrome = buildPackage("chrome", path.join(ROOT_DIR, "chrome"));
const firefox = buildPackage("firefox", path.join(ROOT_DIR, "firefox"), true);
console.log(`Chrome ZIP: ${chrome.zipPath}`);
console.log(`Chrome unpacked: ${chrome.unpackedDir}`);
console.log(`Firefox ZIP: ${firefox.zipPath}`);
console.log(`Firefox XPI: ${firefox.xpiPath}`);
console.log(`Firefox unpacked: ${firefox.unpackedDir}`);
