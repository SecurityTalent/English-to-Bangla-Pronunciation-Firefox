const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = __dirname;
const SOURCE_DIR = path.join(ROOT_DIR, "chrome");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const UNPACKED_DIR = path.join(DIST_DIR, "chrome-unpacked");
const manifest = require(path.join(SOURCE_DIR, "manifest.json"));
const zipPath = path.join(DIST_DIR, `bangla-phonetic-pronunciation-chrome-v${manifest.version}.zip`);

const files = ["manifest.json", "background.js", "content.js", "content.css", "options.html", "options.js"];
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.rmSync(UNPACKED_DIR, { recursive: true, force: true });
fs.mkdirSync(UNPACKED_DIR, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(SOURCE_DIR, file), path.join(UNPACKED_DIR, file));
}
fs.cpSync(path.join(SOURCE_DIR, "icons"), path.join(UNPACKED_DIR, "icons"), { recursive: true });

execSync(`tar -a -cf "${zipPath}" *`, { cwd: UNPACKED_DIR, stdio: "inherit" });
console.log(`Chrome ZIP: ${zipPath}`);
console.log(`Chrome unpacked: ${UNPACKED_DIR}`);
