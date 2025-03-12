"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const rest_1 = require("@octokit/rest");
const nodeFetch = require('node-fetch'); // Rename fetch to avoid conflict
const simpleGit = require('simple-git');
const git = simpleGit();
function initializeLocalRepo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoUrl = yield vscode.window.showInputBox({ prompt: 'Enter GitHub Repository URL' });
            if (!repoUrl) {
                vscode.window.showErrorMessage('GitHub Repository URL is required');
                return;
            }
            yield git.init();
            yield git.addRemote('origin', repoUrl);
            vscode.window.showInformationMessage('Initialized CodeTracking Git Repository');
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to initialize Git repository');
            console.error(error);
        }
    });
}
function authenticateWithGitHub() {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('GitHub Authentication is under development.');
    });
}
function createGitHubRepo(repoName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
            const response = yield octokit.repos.createForAuthenticatedUser({ name: repoName });
            vscode.window.showInformationMessage(`GitHub repository '${repoName}' created successfully.`);
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to create GitHub repository');
            console.error(error);
        }
    });
}
function trackFileChanges() {
    vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('File changed:', event.document.fileName);
    });
}
function generateCommitSummary() {
    const now = new Date();
    return `Commit summary: Work progress as of ${now.toLocaleString()}`;
}
function getCommitsFromGithub() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repoUrl = yield vscode.window.showInputBox({
                prompt: 'Enter GitHub Repository URL (e.g., https://github.com/owner/repo)',
                placeHolder: 'https://github.com/owner/repo'
            });
            if (!repoUrl) {
                vscode.window.showErrorMessage('GitHub Repository URL is required');
                return;
            }
            const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/);
            if (!match) {
                vscode.window.showErrorMessage('Invalid GitHub repository URL.');
                return;
            }
            const owner = match[1];
            const repo = match[2];
            console.log(`Fetching commits for repo: ${owner}/${repo}`);
            const response = yield nodeFetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`
                }
            });
            console.log(`GitHub API response status: ${response.status}`);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const commits = yield response.json();
            console.log(`Fetched commits: ${JSON.stringify(commits, null, 2)}`);
            vscode.window.showInformationMessage(`Fetched ${commits.length} commits from GitHub.`);
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to fetch commits from GitHub.');
            console.error('Error details:', error);
        }
    });
}
let timer = null;
function startActivityTracking() {
    vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('File changed:', event.document.fileName);
    });
    if (!timer) {
        timer = setInterval(commitActivitySummary, 30 * 60 * 1000);
    }
}
function commitActivitySummary() {
    return __awaiter(this, void 0, void 0, function* () {
        const commitMessage = generateCommitSummary();
        try {
            yield git.add('.');
            const branchSummary = yield git.branch();
            const currentBranch = branchSummary.current || 'main';
            yield git.commit(commitMessage);
            yield git.push('origin', currentBranch);
            vscode.window.showInformationMessage('Committed activity summary');
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to commit activity summary');
            console.error(error);
        }
    });
}
function activate(context) {
    console.log('Your extension "codetrackr" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('codetrackr.initializeRepo', initializeLocalRepo), vscode.commands.registerCommand('codetrackr.startTracking', startActivityTracking), vscode.commands.registerCommand('codetrackr.authenticateWithGitHub', authenticateWithGitHub), vscode.commands.registerCommand('codetrackr.getCommits', getCommitsFromGithub));
    let disposable = vscode.commands.registerCommand('codetrackr.getCommits', () => __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('Fetching commits from GitHub...');
        // Add your logic to fetch commits here.
    }));
    context.subscriptions.push(disposable);
    startActivityTracking(); // Ensuring tracking starts when extension is activated
}
exports.activate = activate;
function getCommitsFromGitHub() {
    return __awaiter(this, void 0, void 0, function* () {
        // Implement your logic to fetch commits from GitHub
        return [];
    });
}
function deactivate() {
    console.log('Your extension "codetrackr" has been deactivated');
    if (timer) {
        clearInterval(timer);
    }
}
exports.deactivate = deactivate;
module.exports = {
    activate,
    deactivate
};
