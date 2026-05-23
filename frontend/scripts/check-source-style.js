import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const doubleQuote = String.fromCharCode(34);
const roots = ['js', 'styles', 'index.html', 'vite.config.ts', 'eslint.config.js'];
const allowedExtensions = new Set(['.css', '.html', '.js', '.ts', '.tsx']);
const checks = [
    {
        message: 'double quotes are not allowed',
        test: (line) => line.includes(doubleQuote),
    },
    {
        message: 'use console.error instead of console.log or console.warn',
        test: (line) => /console[.](log|warn)/u.test(line),
    },
    {
        message: 'inline style props are not allowed',
        test: (line) => /style\s*=\s*\{/u.test(line),
    },
    {
        message: 'Recharts contentStyle is an inline style; use className instead',
        test: (line) => /contentStyle\s*=\s*\{/u.test(line),
    },
    {
        message: 'inline if returns are not allowed; use braces',
        test: (line) => /if\s*[(][^\n]+[)]\s*return\b/u.test(line),
    },
];

function getExtension(filePath) {
    const match = /[.][^.]+$/u.exec(filePath);

    if (match === null) {
        return '';
    }

    return match[0];
}

function collectFiles(path) {
    const status = statSync(path);

    if (status.isFile()) {
        const extension = getExtension(path);

        if (allowedExtensions.has(extension)) {
            return [path];
        }

        return [];
    }

    return readdirSync(path).flatMap((entry) => collectFiles(join(path, entry)));
}

const files = roots.flatMap((root) => collectFiles(root));
let hasErrors = false;

for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, index) => {
        checks.forEach((check) => {
            if (check.test(line)) {
                console.error(`${file}:${index + 1}: ${check.message}`);
                hasErrors = true;
            }
        });
    });
}

if (hasErrors) {
    process.exitCode = 1;
}
