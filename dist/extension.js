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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const rest_1 = require("@octokit/rest");
const node_fetch_1 = __importDefault(require("node-fetch")); // Now TypeScript will recognize the types
const simple_git_1 = __importDefault(require("simple-git"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
// Define GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/callback';
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing GitHub OAuth configuration in .env file.');
}
const git = (0, simple_git_1.default)();
let activityTimer;
// 🔹 GitHub Authentication
function authenticateWithGitHub() {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage('Opening GitHub OAuth page...');
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=repo`;
        vscode.env.openExternal(vscode.Uri.parse(authUrl));
        vscode.window.showInformationMessage('Prompting user for authorization code...');
        const code = yield vscode.window.showInputBox({
            prompt: 'Enter the authorization code from GitHub',
        });
        if (!code) {
            vscode.window.showErrorMessage('No authorization code provided.');
            return null;
        }
        try {
            vscode.window.showInformationMessage('Fetching access token from GitHub...');
            const response = yield (0, node_fetch_1.default)('https://github.com/login/oauth/access_token', {
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
            const data = yield response.json();
            if (data.access_token) {
                vscode.window.showInformationMessage('GitHub authentication successful!');
                return data.access_token;
            }
            else {
                vscode.window.showErrorMessage('Failed to get access token. Please check your credentials.');
                return null;
            }
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`GitHub authentication error: ${error.message}`);
            }
            else {
                vscode.window.showErrorMessage('An unknown error occurred during GitHub authentication.');
            }
            return null;
        }
    });
}
// 🔹 Initialize Git Repository
function initializeGitRepo(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            vscode.window.showInformationMessage('Creating GitHub repository...');
            const octokit = new rest_1.Octokit({ auth: accessToken });
            const response = yield octokit.repos.createForAuthenticatedUser({
                name: 'CodeTracking',
                private: true,
            });
            const repoUrl = response.data.clone_url;
            vscode.window.showInformationMessage(`GitHub repository created: ${repoUrl}`);
            vscode.window.showInformationMessage('Initializing local Git repository...');
            yield git.init();
            yield git.addRemote('origin', repoUrl);
            vscode.window.showInformationMessage('Local Git repository initialized and remote added.');
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error initializing Git repository: ${error.message}`);
            }
            else {
                vscode.window.showErrorMessage('An unknown error occurred while initializing the Git repository.');
            }
            throw error;
        }
    });
}
// 🔹 Start Activity Tracking
function startActivityTracking() {
    vscode.window.showInformationMessage('Starting activity tracking...');
    vscode.workspace.onDidChangeTextDocument((event) => {
        console.log('File changed:', event.document.fileName);
    });
    const config = vscode.workspace.getConfiguration('codetrackr');
    const commitInterval = config.get('commitInterval', 30);
    vscode.window.showInformationMessage(`Commit interval set to: ${commitInterval} minutes`);
    activityTimer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        console.log('Committing activity summary...');
        try {
            yield git.add('.');
            yield git.commit(`Auto-commit: ${new Date().toLocaleString()}`);
            yield git.push('origin', 'main');
            vscode.window.showInformationMessage('Activity summary committed.');
        }
        catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error committing activity summary: ${error.message}`);
            }
            else {
                vscode.window.showErrorMessage('An unknown error occurred while committing the activity summary.');
            }
        }
    }), commitInterval * 60 * 1000);
    vscode.window.showInformationMessage('Activity tracking started.');
}
// 🔹 Activate Extension
function activate(context) {
    vscode.window.showInformationMessage('CodeTrackr extension activated!');
    // Register the initialize command
    context.subscriptions.push(vscode.commands.registerCommand('codetrackr.initialize', () => __awaiter(this, void 0, void 0, function* () {
        try {
            vscode.window.showInformationMessage('Initialize CodeTrackr command triggered');
            const accessToken = yield authenticateWithGitHub();
            if (accessToken) {
                yield initializeGitRepo(accessToken);
                startActivityTracking();
            }
        }
        catch (error) {
            vscode.window.showErrorMessage('An error occurred during initialization.');
        }
    })));
    // Register additional commands if needed
    context.subscriptions.push(vscode.commands.registerCommand('codetrackr.anotherCommand', () => __awaiter(this, void 0, void 0, function* () {
        // Add logic for another command here if needed
        vscode.window.showInformationMessage('Another command triggered!');
    })));
    // Add more commands as necessary
}
exports.activate = activate;
// 🔹 Deactivate Extension
function deactivate() {
    if (activityTimer) {
        clearInterval(activityTimer);
        vscode.window.showInformationMessage('Activity tracking stopped.');
    }
}
exports.deactivate = deactivate;
