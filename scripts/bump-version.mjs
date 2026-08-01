#!/usr/bin/env node
// Runs from the pre-push git hook. Bumps version.json's minor version and
// appends a changelog entry (from the subjects of the commits about to be
// pushed) to src/data/changelog.json, then folds both into a new commit
// before the push proceeds. No-ops if there's nothing new to push.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const range = process.argv[2];
if (!range) process.exit(0);

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const versionPath = path.join(repoRoot, "version.json");
const changelogPath = path.join(repoRoot, "src/data/changelog.json");

let subjects;
try {
  subjects = execSync(`git log ${range} --pretty=%s --no-merges`, {
    encoding: "utf8",
    cwd: repoRoot,
  })
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    // Don't let a previous auto-bump commit show up as its own changelog note.
    .filter((s) => !s.startsWith("chore: bump version to v"));
} catch {
  subjects = [];
}

if (subjects.length === 0) {
  process.exit(0);
}

const versionData = JSON.parse(readFileSync(versionPath, "utf8"));
const [major, minor] = versionData.version.split(".").map(Number);
const nextVersion = `${major}.${minor + 1}`;

versionData.version = nextVersion;
writeFileSync(versionPath, JSON.stringify(versionData, null, 2) + "\n");

const changelog = JSON.parse(readFileSync(changelogPath, "utf8"));
changelog.push({
  version: nextVersion,
  date: new Date().toISOString().slice(0, 10),
  notes: subjects,
});
writeFileSync(changelogPath, JSON.stringify(changelog, null, 2) + "\n");

execSync(`git add ${JSON.stringify(versionPath)} ${JSON.stringify(changelogPath)}`, {
  cwd: repoRoot,
});
execSync(`git commit -m "chore: bump version to v${nextVersion}"`, {
  cwd: repoRoot,
  stdio: "inherit",
});

console.log(`[bump-version] v${nextVersion}`);
