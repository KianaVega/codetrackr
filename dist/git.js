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
exports.commitChanges = exports.createGitHubRepo = void 0;
const simple_git_1 = require("simple-git");
const git = (0, simple_git_1.simpleGit)();
function createGitHubRepo(repoName, octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield octokit.repos.createForAuthenticatedUser({
            name: repoName,
        });
        return response.data;
    });
}
exports.createGitHubRepo = createGitHubRepo;
function commitChanges(summary) {
    return __awaiter(this, void 0, void 0, function* () {
        yield git.add('./*');
        yield git.commit(summary);
        yield git.push('origin', 'main');
    });
}
exports.commitChanges = commitChanges;
