#!/usr/bin/env node

/**
 * Auto-commit watcher for Labour Management System
 * Monitors for file changes and automatically commits them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_PATH = path.resolve(__dirname);
const CHECK_INTERVAL = 5000; // 5 seconds
const IGNORE_PATTERNS = ['.git', 'node_modules', '.DS_Store', '*.log'];

let lastCommitTime = Date.now();

function getModifiedFiles() {
    try {
        const result = execSync('git status --porcelain', { cwd: REPO_PATH }).toString();
        return result.trim().split('\n').filter(line => line);
    } catch (err) {
        return [];
    }
}

function commitChanges() {
    try {
        const files = getModifiedFiles();
        if (files.length === 0) return;

        console.log(`\n📝 Changes detected at ${new Date().toLocaleString()}`);
        files.forEach(file => console.log(`  ${file}`));

        execSync('git add -A', { cwd: REPO_PATH });
        
        const timestamp = new Date().toLocaleString();
        const commitMsg = `Auto-commit: ${timestamp}`;
        execSync(`git commit -m "${commitMsg}"`, { cwd: REPO_PATH });
        
        console.log(`✅ Committed successfully!\n`);
        lastCommitTime = Date.now();
    } catch (err) {
        // Silent fail - likely nothing to commit
    }
}

console.log('🚀 Auto-commit watcher started');
console.log(`📂 Repository: ${REPO_PATH}`);
console.log(`⏱️  Check interval: ${CHECK_INTERVAL/1000}s`);
console.log('📌 Waiting for changes...\n');

// Start watching
setInterval(commitChanges, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✋ Watcher stopped');
    process.exit(0);
});
