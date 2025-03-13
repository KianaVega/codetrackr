import * as vscode from 'vscode';
import fetch from 'node-fetch';
import simpleGit, { SimpleGit } from 'simple-git';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Debugging: Log environment variables
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET);
console.log('GITHUB_REDIRECT_URI:', process.env.GITHUB_REDIRECT_URI);

// Define GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/callback';

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing GitHub OAuth configuration in .env file.');
}

const git: SimpleGit = simpleGit();
let activityTimer: NodeJS.Timeout | undefined;

// 🔹 GitHub Authentication
async function authenticateWithGitHub() {
    vscode.window.showInformationMessage('Opening GitHub OAuth page...');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo`;
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    vscode.window.showInformationMessage('Prompting user for authorization code...');
    const code = await vscode.window.showInputBox({
        prompt: 'Enter the authorization code from GitHub',
    });

    if (!code) {
        vscode.window.showErrorMessage('No authorization code provided.');
        return null;
    }

    try {
        vscode.window.showInformationMessage('Fetching access token from GitHub...');
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
            }),
        });

        const data = await response.json();
        if (data.access_token) {
            vscode.window.showInformationMessage('GitHub authentication successful!');
            return data.access_token;
        } else {
            vscode.window.showErrorMessage('Failed to get access token. Please check your credentials.');
            return null;
        }
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`GitHub authentication error: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred during GitHub authentication.');
        }
        return null;
    }
}

// 🔹 Initialize Git Repository
async function initializeGitRepo(accessToken: string) {
    try {
        vscode.window.showInformationMessage('Creating GitHub repository...');
        const { Octokit } = await import('@octokit/rest'); // Use dynamic import
        const octokit = new Octokit({ auth: accessToken });
        const response = await octokit.repos.createForAuthenticatedUser({
            name: 'CodeTracking',
            private: true,
        });

        const repoUrl = response.data.clone_url;
        vscode.window.showInformationMessage(`GitHub repository created: ${repoUrl}`);

        vscode.window.showInformationMessage('Initializing local Git repository...');
        await git.init();
        await git.addRemote('origin', repoUrl);
        vscode.window.showInformationMessage('Local Git repository initialized and remote added.');
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error initializing Git repository: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred while initializing the Git repository.');
        }
        throw error;
    }
}

// 🔹 Start Activity Tracking
function startActivityTracking() {
    vscode.window.showInformationMessage('Starting activity tracking...');

    vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('File changed:', event.document.fileName);
    });

    const config = vscode.workspace.getConfiguration('codetrackr');
    const commitInterval = config.get<number>('commitInterval', 30);
    vscode.window.showInformationMessage(`Commit interval set to: ${commitInterval} minutes`);

    activityTimer = setInterval(async () => {
        console.log('Committing activity summary...');
        try {
            await git.add('.');
            await git.commit(`Auto-commit: ${new Date().toLocaleString()}`);
            await git.push('origin', 'main');
            vscode.window.showInformationMessage('Activity summary committed.');
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error committing activity summary: ${error.message}`);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred while committing the activity summary.');
            }
        }
    }, commitInterval * 60 * 1000);

    vscode.window.showInformationMessage('Activity tracking started.');
}

// 🔹 Activate Extension
export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('CodeTrackr extension activated!');

    // Register the initialize command
    context.subscriptions.push(
        vscode.commands.registerCommand('codetrackr.initialize', async () => {
            try {
                vscode.window.showInformationMessage('Initialize CodeTrackr command triggered');
                const accessToken = await authenticateWithGitHub();
                if (accessToken) {
                    await initializeGitRepo(accessToken);
                    startActivityTracking();
                }
            } catch (error) {
                vscode.window.showErrorMessage('An error occurred during initialization.');
            }
        })
    );

    // Register additional commands if needed
    context.subscriptions.push(
        vscode.commands.registerCommand('codetrackr.anotherCommand', async () => {
            // Add logic for another command here if needed
            vscode.window.showInformationMessage('Another command triggered!');
        })
    );

    // Add more commands as necessary
}

// 🔹 Deactivate Extension
export function deactivate() {
    if (activityTimer) {
        clearInterval(activityTimer);
        vscode.window.showInformationMessage('Activity tracking stopped.');
    }
}