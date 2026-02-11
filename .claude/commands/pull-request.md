---
description: Create a pull request on GitHub between the current branch and its parent branch. Commits pending changes, generates a description from the diff, and uses the repo's PR template.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The `$ARGUMENTS` may contain a target branch override (e.g., `develop`) or `--draft` to create a draft PR.

## Outline

Create a pull request on GitHub for the current branch.

### Execution Steps

1. **Get current branch and detect base branch**:

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

   - If `$ARGUMENTS` contains a branch name, use it as the base
   - Otherwise, default to `main`
   - If current branch IS the base branch, abort with an error

2. **Check for uncommitted changes**:

   ```bash
   git status --short
   ```

   - If there are staged or unstaged changes, ask the user whether to commit them before proceeding
   - Use `/conventional-commit` conventions for the commit message

3. **Ensure branch is pushed to remote**:

   ```bash
   git log origin/<current-branch>..<current-branch> --oneline
   ```

   - If there are unpushed commits, push with `git push -u origin <current-branch>`
   - If the branch has no upstream, push with `-u` to set tracking

4. **Check for existing PR**:

   ```bash
   gh pr view --json number,url,state 2>/dev/null
   ```

   - If an open PR already exists, report its URL and ask if the user wants to update it instead

5. **Analyze the diff** between base and current branch:

   ```bash
   git log <base>..HEAD --oneline
   git diff <base>...HEAD --stat
   ```

   Read the actual changed files to understand the full scope of changes. Don't just rely on commit messages — review the code diff to write an accurate description.

6. **Read the PR template**:

   Read `.github/PULL_REQUEST_TEMPLATE.md` and fill in every section:

   - **Summary**: 1-3 sentences describing what the PR does and why
   - **Type of Change**: Check the appropriate box (only one)
   - **Changes**: Bullet list of meaningful changes (not file-by-file, but logical groupings)
   - **How to Test**: Concrete steps a reviewer can follow to verify
   - **Screenshots / Videos**: Remove section if no UI changes
   - **Checklist**: Check items that apply, leave unchecked if not verified

7. **Create the PR**:

   ```bash
   gh pr create --title "<title>" --body "<body from template>" [--draft]
   ```

   - Title: Short (under 70 characters), imperative mood (e.g., "Add photo upload flow")
   - Use `--draft` if `$ARGUMENTS` contains `--draft`
   - Pass the body via HEREDOC to preserve formatting

8. **Report completion**:

   ```markdown
   ## Pull Request Created

   **PR**: [#number](url)
   **Title**: <title>
   **Base**: <base> ← <current-branch>
   **Status**: [Draft | Ready for review]
   ```

### Flags

| Flag      | Description                          |
| --------- | ------------------------------------ |
| `--draft` | Create as a draft pull request       |
| `<branch>`| Override the target/base branch      |

### Error Handling

- **On base branch**: "You're on `main`. Check out a feature branch first."
- **No commits ahead of base**: "Branch `<branch>` has no new commits compared to `<base>`. Nothing to open a PR for."
- **No remote**: "No remote configured. Add a remote with `git remote add origin <url>`."
- **Existing open PR**: Report URL and ask whether to update or skip.
- **Push fails**: Report the error and suggest `git pull --rebase` if behind remote.
- **`gh` not authenticated**: "GitHub CLI is not authenticated. Run `gh auth login` first."
