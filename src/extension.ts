import * as vscode from 'vscode';
import fetch from 'node-fetch';
import simpleGit from 'simple-git';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as http from 'http';

const envPath = 'C:\\Users\\Kiana\\OneDrive - 4FRONT\\Desktop\\codetrackr\\.env';

if (!fs.existsSync(envPath)) {
    console.error('🚨 ERROR: .env file missing at', envPath);
} else {
    dotenv.config({ path: envPath });
    console.log('✅ .env file loaded successfully!');
}

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/callback';

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing GitHub OAuth configuration in .env file.');
}

const git = simpleGit();
let activityTimer: NodeJS.Timeout | undefined;

async function authenticateWithGitHub() {
    vscode.window.showInformationMessage('Opening GitHub OAuth page...');
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo`;
    vscode.env.openExternal(vscode.Uri.parse(authUrl));

    // Start a local server to capture the authorization code
    const server = http.createServer(async (req, res) => {
        const parsedUrl = new URL(req.url || '', `http://${req.headers.host}`);
        const code = parsedUrl.searchParams.get('code');
        const error = parsedUrl.searchParams.get('error');

        if (error) {
            vscode.window.showErrorMessage('GitHub OAuth error: ' + error);
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('GitHub OAuth error: ' + error);
            return;
        }

        if (code) {
            // Send response to the user
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('Authorization successful! You can close this page.');

            // Exchange the authorization code for an access token
            try {
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
                    // Pass the access token to further steps
                    await initializeGitRepo(data.access_token);
                } else {
                    vscode.window.showErrorMessage('Failed to get access token.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`GitHub authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else {
            vscode.window.showErrorMessage('No authorization code provided.');
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('No authorization code provided.');
        }
    });

    server.listen(3000, 'localhost', () => {
        console.log('Listening on http://localhost:3000 for GitHub OAuth callback...');
    });

    // Inform the user that the process is ready
    vscode.window.showInformationMessage('Please complete the GitHub OAuth process in your browser.');
}

async function initializeGitRepo(accessToken: string) {
    try {
        const { Octokit } = await import('@octokit/rest');
        const octokit = new Octokit({ auth: accessToken });

        const response = await octokit.repos.createForAuthenticatedUser({
            name: 'codetracking',
            private: true,
        });

        const repoUrl = response.data.clone_url;
        vscode.window.showInformationMessage(`GitHub repository created: ${repoUrl}`);

        await git.init();
        await git.addRemote('origin', repoUrl);
        vscode.window.showInformationMessage('Local Git repository initialized and remote added.');
    } catch (error) {
        vscode.window.showErrorMessage(`Error initializing Git repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Error details:', error);
    }
}

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
            await git.add('.');  // Stage all changes
            await git.commit(`Auto-commit: ${new Date().toLocaleString()}`);  // Commit with timestamp
            await git.push('origin', 'main');  // Push to the remote
            vscode.window.showInformationMessage('Activity summary committed.');
        } catch (error) {
            vscode.window.showErrorMessage(`Error committing activity summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, commitInterval * 60 * 1000);

    vscode.window.showInformationMessage('Activity tracking started.');
}

// 🔹 Activate Extension
export function activate(context: vscode.ExtensionContext) {
    console.log("CodeTrackr extension activating...");

    vscode.window.showInformationMessage('CodeTrackr extension activated!');

    const command = vscode.commands.registerCommand('codetrackr.initialize', async () => {
        console.log("✅ codetrackr.initialize command executed.");
        try {
            await authenticateWithGitHub();
        } catch (error) {
            console.error("❌ Initialization error:", error);
            vscode.window.showErrorMessage('An error occurred during initialization.');
        }
    });

    context.subscriptions.push(command);

    console.log("✅ CodeTrackr initialize command registered.");
}

// 🔹 Deactivate Extension
export function deactivate() {
    if (activityTimer !== undefined) {
        clearInterval(activityTimer);
        vscode.window.showInformationMessage('Activity tracking stopped.');
    }
}
