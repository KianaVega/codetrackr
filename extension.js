// Rename this file to extension.mjs if using JavaScript
const someModule = require('some-module');
const anotherModule = require('another-module');
const { someFunction } = require('./someModule.mjs');
const { fetchCommits } = require('./github.mjs'); // Ensure the imported file is also an ES module

export function activate(context) {
  // ...existing code...
  fetchCommits()
    .then(commits => {
      // ...existing code...
    })
    .catch(error => {
      console.error('Failed to fetch commits from GitHub', error);
    });
  // ...existing code...
}

export function deactivate() {
  // ...existing code...
}
