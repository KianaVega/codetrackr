import * as vscode from 'vscode';

// Log a message to confirm the script is running
console.log('Hello, CodeTrackr!');

// Replace 'someFunction' with the correct function name or remove if not needed
// someFunction();

// An example of using the vscode API to display a message in the VS Code output channel
function displayMessage() {
    const outputChannel = vscode.window.createOutputChannel('CodeTrackr');
    outputChannel.appendLine('CodeTrackr extension is running!');
    outputChannel.show();
}

displayMessage();  // Call the function to display the message
