/**
 * patch-get-to-fetch.js
 *
 * Usage:
 *   1. Save this file in your project's root.
 *   2. Run: node patch-get-to-fetch.js
 *
 * What it does:
 *  - Scans src/api for exported names
 *  - Writes src/api/index.js which re-exports everything and creates fetch* aliases for get*
 *  - Rewrites imports that import from an api path to keep original imports and add local aliases:
 *      const fetchX = getX;
 *    (only when appropriate)
 *  - Replaces standalone usage "getX(" with "fetchX(" when not preceded by a dot or identifier character.
 *
 * NOTE: Please commit/backup your repo before running.
 */

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");
const apiDir = path.join(srcDir, "api");
if (!fs.existsSync(srcDir)) {
  console.error("Could not find src/ in project root. Run this script from the repository root.");
  process.exit(1);
}
if (!fs.existsSync(apiDir)) {
  console.error("Could not find src/api/. If your API lives elsewhere, adjust this script.");
  process.exit(1);
}

function readFileSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch(e){ return null; }
}

function writeFileSafe(p, content) {
  fs.writeFileSync(p, content, "utf8");
  console.log("WROTE", p);
}

// 1) Scan src/api for exported names
const apiFiles = fs.readdirSync(apiDir).filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
const exportMap = {}; // file -> [names]

const reExportFunc = /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g;
const reExportConst = /export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)/g;
const reExportList = /export\s*{\s*([^}]+)\s*}/g;
const reModuleExports = /module\.exports\s*=\s*{([^}]+)}/g;

apiFiles.forEach(fn => {
  const full = path.join(apiDir, fn);
  const txt = readFileSafe(full) || "";
  const names = new Set();
  let m;
  while ((m = reExportFunc.exec(txt))) names.add(m[1]);
  while ((m = reExportConst.exec(txt))) names.add(m[1]);
  while ((m = reExportList.exec(txt))) {
    const items = m[1];
    items.split(",").forEach(it => {
      const name = it.split("as")[0].trim();
      if (name) names.add(name);
    });
  }
  while ((m = reModuleExports.exec(txt))) {
    const items = m[1];
    items.split(",").forEach(it => {
      const name = it.split(":")[0].trim();
      if (name) names.add(name);
    });
  }
  if (names.size) exportMap[fn] = Array.from(names).sort();
});

// 2) Build src/api/index.js
const indexPath = path.join(apiDir, "index.js");
const indexBak = indexPath + ".bak_from_patch";
if (fs.existsSync(indexPath) && !fs.existsSync(indexBak)) {
  fs.copyFileSync(indexPath, indexBak);
  console.log("Backed up existing src/api/index.js ->", path.basename(indexBak));
}

if (Object.keys(exportMap).length === 0) {
  console.log("No exports found in src/api — skipping index.js generation.");
} else {
  const lines = [];
  lines.push("// Auto-generated aggregator index — re-exports API functions and provides fetch* aliases for get* names");
  lines.push("");
  Object.keys(exportMap).forEach(fn => {
    const names = exportMap[fn];
    const rel = "./" + path.basename(fn, path.extname(fn));
    lines.push(`export { ${names.join(", ")} } from '${rel}';`);
  });
  const aliasLines = [];
  Object.keys(exportMap).forEach(fn => {
    const names = exportMap[fn];
    const rel = "./" + path.basename(fn, path.extname(fn));
    names.forEach(name => {
      if (name.startsWith("get") && name.length > 3 && name[3] === name[3].toUpperCase()) {
        const alias = "fetch" + name.slice(3);
        aliasLines.push(`export { ${name} as ${alias} } from '${rel}';`);
      }
    });
  });
  if (aliasLines.length) {
    lines.push("");
    lines.push("// fetch* aliases for get* exports");
    lines.push(...aliasLines);
  }
  writeFileSafe(indexPath, lines.join("\n") + "\n");
  console.log("Generated src/api/index.js with exports and fetch* aliases.");
}

// 3) Replace imports/usages across src files
const walkFiles = (d) => {
  const out = [];
  (function walk(p){
    fs.readdirSync(p).forEach(name => {
      const full = path.join(p, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(js|jsx|ts|tsx)$/.test(name)) out.push(full);
    });
  })(d);
  return out;
};

const allFiles = walkFiles(srcDir);
const importPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"];?/g;

const changed = [];
allFiles.forEach(file => {
  let txt = readFileSafe(file);
  if (txt === null) return;
  const orig = txt;
  // 3.1 handle import lists referencing an api path
  txt = txt.replace(importPattern, (match, names, fromPath) => {
    // Only care when fromPath includes '/api' or ends with '/api' or contains '/api/'
    if (!/(\b|\/)api(\/|$)/.test(fromPath)) return match;
    const parts = names.split(",").map(p => p.trim()).filter(Boolean);
    const newParts = [];
    const aliasesToCreate = [];
    parts.forEach(p => {
      if (/ as /.test(p)) {
        // keep as-is
        newParts.push(p);
      } else if (/^get[A-Z]/.test(p)) {
        // import original name (so we don't break anything), and create const fetchX = getX below
        newParts.push(p);
        const fetchName = "fetch" + p.slice(3);
        aliasesToCreate.push({orig: p, alias: fetchName});
      } else {
        newParts.push(p);
      }
    });
    let out = `import { ${newParts.join(", ")} } from '${fromPath}';`;
    if (aliasesToCreate.length) {
      const aliasLines = aliasesToCreate.map(a => `const ${a.alias} = ${a.orig};`).join("\n");
      out += "\n" + aliasLines;
    }
    return out;
  });

  // 3.2 replace standalone getX word usages with fetchX when not preceded by '.' or identifier
  // We use a conservative negative lookbehind for . and word char
  txt = txt.replace(/(?<![\.\w])get([A-Z][A-Za-z0-9_]*)\b/g, "fetch$1");

  if (txt !== orig) {
    writeFileSafe(file, txt);
    changed.push(path.relative(projectRoot, file));
  }
});

console.log("Modified files count:", changed.length);
if (changed.length) console.log("Sample changed files:", changed.slice(0,20));
console.log("Done.");
