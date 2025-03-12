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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const simple_git_1 = __importDefault(require("simple-git"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const git = (0, simple_git_1.default)();
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
        const clientID = '<Your-Client-ID>';
        const clientSecret = '<Your-Client-Secret>';
        const redirectUri = 'http://localhost:3000/callback';
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}`;
        vscode.env.openExternal(vscode.Uri.parse(authUrl));
        const tokenUrl = 'https://github.com/login/oauth/access_token';
        const server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/callback')) {
                const query = url.parse(req.url, true).query;
                const code = query.code;
                try {
                    const response = yield (0, node_fetch_1.default)(tokenUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({
                            client_id: clientID,
                            client_secret: clientSecret,
                            code: code,
                        }),
                    });
                    const tokenData = yield response.json();
                    const accessToken = tokenData.access_token;
                    vscode.window.showInformationMessage('GitHub Authenticated!');
                    res.end('Authentication successful! You can close this window.');
                    server.close();
                    return accessToken;
                }
                catch (error) {
                    vscode.window.showErrorMessage('Authentication Failed');
                    console.error(error);
                    res.end('Authentication failed.');
                    server.close();
                }
            }
        }));
        server.listen(3000, () => {
            console.log('Listening on http://localhost:3000');
        });
    });
}
let timer;
function startActivityTracking() {
    vscode.workspace.onDidChangeTextDocument(event => {
        console.log('File changed:', event.document.fileName);
    });
    timer = setInterval(commitActivitySummary, 30 * 60 * 1000);
}
function commitActivitySummary() {
    return __awaiter(this, void 0, void 0, function* () {
        const commitMessage = 'Summary of work for the last 30 minutes';
        try {
            yield git.add('.');
            yield git.commit(commitMessage);
            yield git.push('origin', 'main');
            vscode.window.showInformationMessage('Committed activity summary');
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to commit activity summary');
            console.error(error);
        }
    });
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('codetrackr.initializeRepo', initializeLocalRepo), vscode.commands.registerCommand('codetrackr.startTracking', startActivityTracking), vscode.commands.registerCommand('codetrackr.authenticateWithGitHub', authenticateWithGitHub) // added command
    );
    let disposable = vscode.commands.registerCommand('codetrackr.getCommitFromGithub', () => {
        vscode.window.showInformationMessage('Get Commit from GitHub command executed.');
        // ...command implementation...
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    if (timer) {
        clearInterval(timer);
    }
}
