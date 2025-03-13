"use strict";
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
exports.authenticateWithGitHub = void 0;
const rest_1 = require("@octokit/rest");
function authenticateWithGitHub() {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new rest_1.Octokit({
            auth: 'your-personal-access-token'
        });
        // Implement OAuth flow if needed
        return octokit;
    });
}
exports.authenticateWithGitHub = authenticateWithGitHub;
