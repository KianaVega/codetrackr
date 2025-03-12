import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import simpleGit, { SimpleGit } from 'simple-git';
import * as console from 'console';

const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
const GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET';
const GITHUB_REDIRECT_URI = 'http://localhost:3000/callback'; // Update with your redirect URI

const git: SimpleGit = simpleGit();

// 🔹 Authenticate with GitHub using OAuth
async function authenticateWithGitHub() {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo`;
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    // Handle OAuth Callback
    const code = await vscode.window.showInputBox({ 
        prompt: 'Enter the authorization code from GitHub'
    });

    if (!code) {
        vscode.window.showErrorMessage('GitHub authentication failed.');
        return null;
    }

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code
            })
        });

        const data = await response.json();
        if (data.access_token) {
            vscode.window.showInformationMessage('GitHub authentication successful!');
            return data.access_token;
        } else {
            vscode.window.showErrorMessage('Failed to get access token.');
            return null;
        }
    } catch (error) {
        vscode.window.showErrorMessage('GitHub authentication error.');
        console.error(error);
        return null;
    }
}

// 🔹 Initialize Local Git Repository and Push to GitHub
async function initializeGitRepo(accessToken: string) {
    try {
        const repoName = 'CodeTracking';
        const octokit = new Octokit({ auth: accessToken });

        // Create GitHub Repo
        const response = await octokit.repos.createForAuthenticatedUser({
            name: repoName,
            private: true
        });

        const repoUrl = response.data.clone_url;

        // Initialize local Git repo if not already initialized
        const status = await git.status();

        // Check if there's a .git directory to determine if it's a Git repository
        if (status.not_added.length === 0 && status.created.length === 0 && status.modified.length === 0) {
            await git.init();  // Initialize if it's not a git repo
        }
        await git.addRemote('origin', repoUrl);
        
        vscode.window.showInformationMessage('CodeTracking repository initialized!');
    } catch (error) {
        vscode.window.showErrorMessage('Failed to initialize Git repository.');
        console.error(error);
    }
}

// 🔹 Track file changes
function startActivityTracking() {
    vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('File changed:', event.document.fileName);
    });

    let activityTimer: NodeJS.Timeout | undefined;

    const config = vscode.workspace.getConfiguration('codetrackr');
    const commitInterval = config.get<number>('commitInterval', 30);
    const excludePaths = config.get<string[]>('excludePaths', ["node_modules", "dist", ".git"]);

    vscode.workspace.onDidChangeTextDocument((event) => {
        // Skip tracking if file is in an excluded directory
        if (excludePaths.some(path => event.document.fileName.includes(path))) {
            return;
        }
        console.log('Tracked file change:', event.document.fileName);
    });

    // Set commit timer
    if (activityTimer) {
        clearInterval(activityTimer);
    }
    activityTimer = setInterval(commitActivitySummary, commitInterval * 60 * 1000);
    
    async function commitActivitySummary() {
        try {
            const gitStatus = await git.status();
            const filteredFiles = gitStatus.files.filter(file => 
                !excludePaths.some(path => file.path.includes(path))
            ).map(file => file.path);

            if (filteredFiles.length === 0) {
                console.log('No changes to commit.');
                return;
            }

            await git.add(filteredFiles);
            await git.commit(`Auto-commit: ${new Date().toLocaleString()}`);
            await git.push('origin', 'main');

            vscode.window.showInformationMessage('Auto-committed work progress.');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to commit changes.');
            console.error(error);
        }
    }
}

// 🔹 Fetch GitHub Commits
async function getCommitsFromGithub() {
    try {
        const repoUrl = await vscode.window.showInputBox({ 
            prompt: 'Enter GitHub Repository URL',
            placeHolder: 'https://github.com/owner/repo'
        });

        if (!repoUrl) {
            vscode.window.showErrorMessage('GitHub Repository URL is required.');
            return;
        }

        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

        if (!match) {
            vscode.window.showErrorMessage('Invalid GitHub repository URL.');
            return;
        }

        const owner = match[1];
        const repo = match[2];

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const commits = await response.json();
        vscode.window.showInformationMessage(`Fetched ${commits.length} commits from GitHub.`);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to fetch commits.');
        console.error(error);
    }
}

// 🔹 Activate Extension
export function activate(context: vscode.ExtensionContext) {
    console.log('CodeTrackr extension activated!'); // Add this line
    context.subscriptions.push(
        vscode.commands.registerCommand('codetrackr.initialize', async () => {
            console.log('Initialize CodeTrackr command triggered'); // Add this line
            const accessToken = await authenticateWithGitHub();
            if (accessToken) {
                await initializeGitRepo(accessToken);
                startActivityTracking();
            }
        }),

        vscode.commands.registerCommand('codetrackr.getCommits', getCommitsFromGithub)
    );
}

// 🔹 Deactivate Extension
export function deactivate() {
    console.log('CodeTrackr has been deactivated');
}
