---
description: Clean up current feature branch and return to main, ready to start a new feature. Clears memory, handles uncommitted changes, and deletes the feature branch.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The `$ARGUMENTS` may contain `--force` to skip confirmations or `--keep-branch` to avoid deleting the branch.

## Outline

Prepare for a new feature by cleaning up the current branch and returning to main.

### Execution Steps

1. **Get current git branch**:

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

   - If on `main`, ask if user wants to proceed (nothing to clean up)
   - Store branch name for later deletion

2. **Check for memory file**:

   Sanitize branch name by replacing `/` with `-` for the filename.

   - Path: `.claude/memory/[sanitized-branch-name].md`
   - If exists, inform user and ask if they want to clear it
   - If `--force` flag present, clear without asking
   - Use `/memory.clear --force` or equivalent logic

3. **Check for uncommitted changes**:

   ```bash
   git status --short
   ```

   - If there are uncommitted changes, ask user what to do:
     - **Commit them** (offer to run `/commit` flow)
     - **Stash them** (`git stash push -m "WIP: [branch-name]"`)
     - **Discard them** (warn this is destructive)
     - **Abort** (stop the process)

4. **Checkout main**:

   ```bash
   git checkout main
   ```

   - If this fails, report error and stop

5. **Pull latest from main**:

   ```bash
   git pull origin main
   ```

   - If no remote tracking, try `git pull`
   - If pull fails, report error but continue

6. **Delete feature branch** (unless `--keep-branch` flag):

   Ask for confirmation unless `--force` flag present:

   ```markdown
   ## Delete Feature Branch

   **Branch**: [branch-name]
   **Commits**: [number of commits ahead of main]

   Delete this branch? Reply "yes" to delete, or "no" to keep it.
   ```

   On confirmation:

   ```bash
   git branch -D [branch-name]
   ```

   - Use `-D` (force delete) since we've already handled uncommitted changes
   - If deletion fails, report error

7. **Report completion**:

   ```markdown
   ✅ Ready for new feature!

   - Switched to: `main`
   - Pulled latest changes
   - Deleted branch: `[branch-name]`
   - Memory cleared: [yes/no]

   You can now create a new feature branch with:
   ```
   git checkout -b feat/your-feature-name
   ```
   ```

### Flags

| Flag             | Description                         |
| ---------------- | ----------------------------------- |
| `--force`        | Skip all confirmation prompts       |
| `--keep-branch`  | Don't delete the feature branch     |

### Examples

**Basic usage:**
```
/start-fresh
```

**Skip confirmations:**
```
/start-fresh --force
```

**Keep the branch (just switch to main and pull):**
```
/start-fresh --keep-branch
```

### Error Handling

- **Already on main**: "Already on main branch. Nothing to clean up. Pull latest? (yes/no)"
- **Uncommitted changes refused**: "Cancelled. Your changes are preserved on branch '[branch-name]'."
- **Checkout main failed**: Report git error and stop process
- **Branch deletion failed**: "Could not delete branch '[branch-name]'. You may need to delete it manually."
- **No git repo**: "Not inside a git repository."
- **Detached HEAD**: "You're in detached HEAD state. Please checkout a branch first."

### Safety Notes

- This command is **destructive** if user chooses to discard changes
- Always confirm before deleting branches (unless `--force`)
- Memory is only cleared if user confirms (or `--force`)
- Stashed changes can be recovered with `git stash list` and `git stash pop`
