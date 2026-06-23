#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = resolve(__dirname, '../src/lib/server.js');

// Start the server
const child = spawn('node', [serverPath], {
    stdio: 'inherit',
});

child.on('error', (error) => {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    child.kill('SIGTERM');
});

process.on('SIGINT', () => {
    child.kill('SIGINT');
});
