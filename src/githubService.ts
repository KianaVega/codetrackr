import { Octokit } from '@octokit/rest';

class GitHubService {
    private octokit: any; // <-- Explicitly defining octokit

    constructor(authToken: string) { // <-- Added type
        this.octokit = new Octokit({ auth: authToken });
    }

    async getCommits(repoOwner: string, repoName: string) { // <-- Added types
        const commits = await this.octokit.repos.listCommits({
            owner: repoOwner,
            repo: repoName
        });

        return commits.data.map((commit: any) => ({ // <-- Added commit type
            message: commit.commit.message,
            author: commit.commit.author.name
        }));
    }
}

module.exports = GitHubService;

