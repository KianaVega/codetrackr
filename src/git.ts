import { simpleGit, SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export async function createGitHubRepo(repoName: string, octokit: any) {
    const response = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
    });
    return response.data;
}

export async function commitChanges(summary: string) {
    await git.add('./*');
    await git.commit(summary);
    await git.push('origin', 'main');
}
