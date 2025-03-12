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
const rest_1 = require("@octokit/rest");
class GitHubService {
    constructor(authToken) {
        this.octokit = new rest_1.Octokit({ auth: authToken });
    }
    getCommits(repoOwner, repoName) {
        return __awaiter(this, void 0, void 0, function* () {
            const commits = yield this.octokit.repos.listCommits({
                owner: repoOwner,
                repo: repoName
            });
            return commits.data.map((commit) => ({
                message: commit.commit.message,
                author: commit.commit.author.name
            }));
        });
    }
}
module.exports = GitHubService;
