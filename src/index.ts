import * as vscode from 'vscode';
import dotenv from 'dotenv'; // Use ES6 import syntax for dotenv

// Log a message to confirm the script is running
console.log('Hello, CodeTrackr!');

// Load environment variables from .env file
dotenv.config();

// Display the environment variable in the console
const githubClientId = process.env.GITHUB_CLIENT_ID;
console.log(`GitHub Client ID: ${githubClientId}`);
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET);
console.log('GITHUB_REDIRECT_URI:', process.env.GITHUB_REDIRECT_URI);
console.log('Environment Variables:', process.env);

// Function to display a message in the VS Code output channel
function displayMessage() {
    const outputChannel = vscode.window.createOutputChannel('CodeTrackr');
    outputChannel.appendLine('CodeTrackr extension is running!');
    outputChannel.show();
}

displayMessage(); // Call the function to display the message

// Define a simple command to show a message when activated
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('codeTrackr.startTracking', () => {
        vscode.window.showInformationMessage('CodeTrackr is now tracking!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

