import fetch from 'node-fetch';

export async function fetchCommits(repo) {
  const response = await fetch(`https://api.github.com/repos/${repo}/commits`);
  if (!response.ok) {
    throw new Error(`Failed to fetch commits: ${response.statusText}`);
  }
  return response.json();
}
