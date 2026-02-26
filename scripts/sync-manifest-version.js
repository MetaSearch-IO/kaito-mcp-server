#!/usr/bin/env node

// Sync the version field from package.json into manifest.json

import { readFileSync, writeFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));

manifest.version = pkg.version;

writeFileSync("manifest.json", JSON.stringify(manifest, null, 2) + "\n");
