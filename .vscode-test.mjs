import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
}
// Change
// const vscodeTest = require('vscode-test');

// To
const vscodeTest = require('@vscode/test-electron');
);
