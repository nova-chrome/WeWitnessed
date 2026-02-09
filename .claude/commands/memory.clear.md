---
description: Clear feature memory by removing the memory file for the current git branch. Use when feature is complete or context is no longer needed.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The `$ARGUMENTS` may contain `--force` to skip confirmation.

## Outline

Clear feature memory when no longer needed.

### Execution Steps

1. **Get current git branch**:

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

   Sanitize the branch name by replacing `/` with `-` for the filename.

2. **Set memory file path**: `.claude/memory/[sanitized-branch-name].md`

3. **Check if memory exists**:

   - If file doesn't exist, report nothing to clear

4. **Check for `--force` flag** in `$ARGUMENTS`:

   - If `--force` present, skip confirmation
   - Otherwise, proceed to confirmation step

5. **Confirm before deletion** (unless `--force`):

   ```markdown
   ## Confirm Memory Deletion

   **File**: `.claude/memory/[branch-name].md`
   **Last Updated**: [date from file]
   **Goal**: [extracted from file]

   Are you sure you want to delete this memory?

   Reply "yes" to confirm, or "no" to cancel.
   ```

6. **Wait for confirmation** unless `--force`:

   - On "yes": proceed with deletion
   - On "no": cancel and report
   - On other input: ask for clarification

7. **Delete memory file**:

   ```bash
   rm .claude/memory/[sanitized-branch-name].md
   ```

8. **Report completion**:

   ```markdown
   Memory cleared for branch "[branch-name]".

   If this was a mistake, note that the content cannot be recovered.
   Run `/memory.save` to create new memory.
   ```

### Flags

| Flag      | Description              |
| --------- | ------------------------ |
| `--force` | Skip confirmation prompt |

### Error Handling

- **No memory found**: "No memory exists for branch '[branch-name]'. Nothing to clear."
- **Directory missing**: "No memory directory exists. Nothing to clear."
- **Deletion failed**: Report error with file path and suggest manual deletion
- **No git repo**: Warn user that memory requires a git repository for branch detection
- **Detached HEAD**: Warn user and suggest checking out a branch first
