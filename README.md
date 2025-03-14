
# CodeTrackr

**CodeTrackr** is a Visual Studio Code (VSCode) extension that helps you track and manage your code changes and GitHub repositories. It integrates seamlessly with GitHub to give you real-time insights into your code's commit history, pull requests, and repository activity.

With **CodeTrackr**, you can easily monitor your repository's status, see recent commits, and manage pull requests—all from within VSCode. This makes it an invaluable tool for developers working on multiple projects or collaborating with teams, as it centralizes Git and GitHub activities in one convenient interface.

## Features

- **Track Commit History**: View a list of commits, branches, and their associated changes.
- **Pull Request Management**: Monitor open pull requests directly within VSCode.
- **Repository Overview**: See a complete overview of your GitHub repositories, including recent activities and status.
- **Seamless Git Integration**: Automatically sync and track Git changes, including commits, branches, and merges.
- **GitHub Authentication**: Connect and authorize the extension with your GitHub account to manage repositories and commits.

---

## Table of Contents

1. [What CodeTrackr Does](#what-codetrackr-does)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [GitHub Integration](#github-integration)
6. [Contributing](#contributing)
7. [License](#license)

---

## What CodeTrackr Does

**CodeTrackr** is designed to streamline your development workflow by integrating Git and GitHub directly into VSCode. Here's what it does:

- **Commit Tracking**: It shows all the recent commits in your repositories and highlights the files changed. You can quickly see which files have been modified, added, or deleted.
  
- **Pull Request Monitoring**: You can track open pull requests associated with your repositories. It provides a quick overview of the pull request status, allowing you to manage them efficiently.

- **Repository Activity**: Stay up to date with repository activity, including commits and changes made by collaborators. You can easily view the current branch, last commit hash, and other important details about the state of your repository.

- **GitHub Integration**: The extension integrates directly with GitHub, providing access to your repositories, pull requests, and commits. You can view all of your GitHub repositories and interact with them without leaving VSCode.

- **Automatic Syncing**: As you make changes to your code, **CodeTrackr** will automatically sync and update repository data, ensuring you're always up-to-date on your project's status.

---

## Installation

To install **CodeTrackr**, follow these steps:

1. **Install VSCode** (if you haven't already) from the [official website](https://code.visualstudio.com/).

2. **Install the CodeTrackr extension**:
    - Open **VSCode**.
    - Go to the **Extensions** view by clicking the Extensions icon in the Activity Bar on the side of the window.
    - Search for **CodeTrackr** and click **Install**.

Alternatively, you can install it using the VSCode CLI:

```bash
code --install-extension KianaVega.codetrackr
```

---

## Configuration

Before you can fully utilize **CodeTrackr**, you'll need to configure it to sync with your GitHub account.

### Step 1: Git Setup

Ensure you have Git installed on your system. You can verify the installation by running the following in your terminal:

```bash
git --version
```

If Git is not installed, download and install it from [Git's official website](https://git-scm.com/).

### Step 2: GitHub Authentication

1. Open **VSCode** and go to the **CodeTrackr** settings.
2. The extension will prompt you to authorize it with your GitHub account.
3. Click on the "Authorize" button, and it will open the GitHub OAuth page in your browser.
4. Log in to GitHub and grant the extension the necessary permissions to access your repositories.
5. After authorization, return to VSCode. You should see a message indicating that the extension is connected to your GitHub account.

### Step 3: Configure GitHub Repository

1. Open your project directory in **VSCode**.
2. Initialize your Git repository if it isn't already initialized:

```bash
git init
```

3. Link your local repository to your GitHub repository:

```bash
git remote add origin https://github.com/your-username/your-repository.git
```

4. Push your code to GitHub:

```bash
git push -u origin master
```

5. Ensure your **CodeTrackr** extension is tracking the correct repository. If the repository is not listed, check the repository URL and try again.

---

## Usage

Once the extension is installed and configured, you can start using it directly within **VSCode**.

### View Repository Activity

- The **CodeTrackr** sidebar will show you a list of all the Git repositories associated with your GitHub account.
- Click on any repository to view its commit history, pull requests, and other repository details.

### Track Commits

- The extension will automatically track commit history, including new commits, merges, and branches.
- You can use the **Git** panel to view changes in files and commit history.

### View Pull Requests

- **CodeTrackr** will display open pull requests related to your repository.
- You can easily monitor and merge pull requests from within VSCode.

### Code Changes and Commit Updates

- As you make changes to your code, **CodeTrackr** will update the status of your repository and commits.
- You can see which files have been modified, added, or deleted.
- After making changes, commit your changes directly from the **VSCode** interface:

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## GitHub Integration

To ensure smooth integration with **GitHub**, make sure you:

- Have linked your GitHub account to the **CodeTrackr** extension.
- Have proper permissions set for your GitHub repositories (e.g., full control of private repositories).
- Set up the repository correctly with a remote URL pointing to GitHub.

If you encounter issues with GitHub authentication or repository syncing, make sure your GitHub credentials are properly configured in your local Git configuration:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## Troubleshooting

- **GitHub authorization issues**: Ensure that you have granted the necessary permissions to the extension when authorizing with GitHub. You can try reauthorizing if needed.
- **Missing repositories**: If your repository is not appearing in the **CodeTrackr** sidebar, ensure that the repository is properly initialized and linked to GitHub.
- **Version conflicts**: If you encounter errors related to version conflicts (e.g., `@types/vscode` version mismatch), refer to the [CodeTrackr setup guide](#configuration) for resolving dependency issues.

---

## Contributing

We welcome contributions to **CodeTrackr**! If you have ideas for new features or improvements, feel free to fork the repository and submit a pull request.

To contribute:

1. Fork the repository on GitHub.
2. Clone the forked repository to your local machine:

```bash
git clone https://github.com/your-username/codetrackr.git
```

3. Create a new branch:

```bash
git checkout -b feature-branch
```

4. Make your changes and commit them:

```bash
git commit -m "Description of changes"
```

5. Push your changes:

```bash
git push origin feature-branch
```

6. Submit a pull request to the main repository.

---

## License

**CodeTrackr** is open-source software licensed under the [MIT License](LICENSE).


