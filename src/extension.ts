import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
const nodeFetch = require('node-fetch'); // Rename fetch to avoid conflict
const simpleGit = require('simple-git');

const git = simpleGit();

async function initializeLocalRepo() {
    try {
        const repoUrl = await vscode.window.showInputBox({ prompt: 'Enter GitHub Repository URL' });
        if (!repoUrl) {
            vscode.window.showErrorMessage('GitHub Repository URL is required');
            return;
        }
        await git.init();
        await git.addRemote('origin', repoUrl);
        vscode.window.showInformationMessage('Initialized CodeTracking Git Repository');
    } catch (error) {
        vscode.window.showErrorMessage('Failed to initialize Git repository');
        console.error(error);
    }
}

async function authenticateWithGitHub() {
    vscode.window.showInformationMessage('GitHub Authentication is under development.');
}

async function createGitHubRepo(repoName: string) {
    try {
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        const response = await octokit.repos.createForAuthenticatedUser({ name: repoName });
        vscode.window.showInformationMessage(`GitHub repository '${repoName}' created successfully.`);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to create GitHub repository');
        console.error(error);
    }
}

function trackFileChanges() {
    vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        console.log('File changed:', event.document.fileName);
    });
}

function generateCommitSummary() {
    const now = new Date();
    return `Commit summary: Work progress as of ${now.toLocaleString()}`;
}

async function getCommitsFromGithub() {
    try {
        const repoUrl = await vscode.window.showInputBox({ 
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

        const response = await nodeFetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });

        console.log(`GitHub API response status: ${response.status}`);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const commits = await response.json();
        console.log(`Fetched commits: ${JSON.stringify(commits, null, 2)}`);
        vscode.window.showInformationMessage(`Fetched ${commits.length} commits from GitHub.`);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to fetch commits from GitHub.');
        console.error('Error details:', error);
    }
}

let timer: NodeJS.Timeout | null = null;

function startActivityTracking() {
    vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        console.log('File changed:', event.document.fileName);
    });

    if (!timer) {
        timer = setInterval(commitActivitySummary, 30 * 60 * 1000);
    }
}

async function commitActivitySummary() {
    const commitMessage = generateCommitSummary();

    try {
        await git.add('.');

        const branchSummary = await git.branch();
        const currentBranch = branchSummary.current || 'main';

        await git.commit(commitMessage);
        await git.push('origin', currentBranch);
        vscode.window.showInformationMessage('Committed activity summary');
    } catch (error) {
        vscode.window.showErrorMessage('Failed to commit activity summary');
        console.error(error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "codetrackr" is now active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('codetrackr.initializeRepo', initializeLocalRepo),
        vscode.commands.registerCommand('codetrackr.startTracking', startActivityTracking),
        vscode.commands.registerCommand('codetrackr.authenticateWithGitHub', authenticateWithGitHub),
        vscode.commands.registerCommand('codetrackr.getCommits', getCommitsFromGithub)
    );

    let disposable = vscode.commands.registerCommand('codetrackr.getCommits', async () => {
        vscode.window.showInformationMessage('Fetching commits from GitHub...');
        // Add your logic to fetch commits here.
    });

    context.subscriptions.push(disposable);

    startActivityTracking(); // Ensuring tracking starts when extension is activated
}

async function getCommitsFromGitHub(): Promise<any[]> {
    // Implement your logic to fetch commits from GitHub
    return [];
}

export function deactivate() {
    console.log('Your extension "codetrackr" has been deactivated');
    if (timer) {
        clearInterval(timer);
    }
}

module.exports = {
    activate,
    deactivate
};


