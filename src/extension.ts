import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
import fetch from 'node-fetch';
import simpleGit, { SimpleGit } from 'simple-git';

const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
const GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET';
const GITHUB_REDIRECT_URI = 'http://localhost:3000/callback';

const git: SimpleGit = simpleGit();
let activityTimer: NodeJS.Timeout | undefined;

async function authenticateWithGitHub() {
    vscode.window.showInformationMessage('Opening GitHub OAuth page...');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo`;
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    vscode.window.showInformationMessage('Prompting user for authorization code...');
    const code = await vscode.window.showInputBox({ prompt: 'Enter the authorization code from GitHub' });

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
                code,
            }),
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
        vscode.window.showErrorMessage(`GitHub authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
}

async function initializeGitRepo(accessToken: string) {
    try {
        vscode.window.showInformationMessage('Creating GitHub repository...');
        const octokit = new Octokit({ auth: accessToken });
        const response = await octokit.repos.createForAuthenticatedUser({
            name: 'CodeTracking',
            private: true,
        });

        const repoUrl = response.data.clone_url;
        vscode.window.showInformationMessage(`GitHub repository created: ${repoUrl}`);
        await git.init();
        await git.addRemote('origin', repoUrl);
    } catch (error) {
        vscode.window.showErrorMessage(`Error initializing Git repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function startActivityTracking() {
    vscode.window.showInformationMessage('Starting activity tracking...');
    vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('File changed:', event.document.fileName);
    });

    const config = vscode.workspace.getConfiguration('codetrackr');
    const commitInterval = config.get<number>('commitInterval', 30);
    
    activityTimer = setInterval(async () => {
        try {
            await git.add('.');
            await git.commit(`Auto-commit: ${new Date().toLocaleString()}`);
            await git.push('origin', 'main');
        } catch (error) {
            vscode.window.showErrorMessage(`Error committing: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, commitInterval * 60 * 1000);
}

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('CodeTrackr extension activated!');

    context.subscriptions.push(
        vscode.commands.registerCommand('codetrackr.initialize', async () => {
            try {
                const accessToken = await authenticateWithGitHub();
                if (accessToken) {
                    await initializeGitRepo(accessToken);
                    startActivityTracking();
                }
            } catch {
                vscode.window.showErrorMessage('An error occurred during initialization.');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('codetrackr.anotherCommand', () => {
            vscode.window.showInformationMessage('Another command triggered!');
        })
    );
}

export function deactivate() {
    if (activityTimer) {
        clearInterval(activityTimer);
    }
}
