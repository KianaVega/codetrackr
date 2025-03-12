import * as vscode from 'vscode';
import { fetchCommits } from './fetchCommits.mjs';

export async function activate(context) {
  try {
    const commits = await fetchCommits('undefined_publisher/codetrackr');
    console.log('Fetched commits:', commits);
  } catch (error) {
    console.error('Failed to fetch commits from GitHub:', error);
  }
}
