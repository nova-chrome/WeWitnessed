---
description: Load feature memory into context to resume work with relevant knowledge about goal, key files, decisions, status, and blockers for the current git branch.
---

## Outline

Load feature memory to resume work with full context.

### Execution Steps

1. **Get current git branch**:

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

   Sanitize the branch name by replacing `/` with `-` for the filename.

2. **Set memory file path**: `.claude/memory/[sanitized-branch-name].md`

3. **Check if memory exists**:

   - If file doesn't exist, report no memory found
   - Suggest running `/memory.save` first

4. **Read memory file**: Load full content into context

5. **Validate memory freshness**:

   - Check "Last updated" timestamp
   - Verify key files mentioned still exist
   - Note any discrepancies between memory and current state

6. **Internalize and summarize**:
   Present a concise summary to user:

   ```markdown
   ## Memory Loaded: [Feature Name]

   **Goal**: [One sentence summary]

   **Status**: [Current state summary]

   **Key Context**:

   - [Most important decision or fact]
   - [Second most important]
   - [Third if relevant]

   **Blockers**: [Any active blockers, or "None"]

   **Ready to continue?** [Ask if anything needs clarification]
   ```

7. **Handle stale memory**:

   - If files missing: "Some key files no longer exist. Memory may be outdated."
   - If very old (>7 days): "This memory is [N] days old. Would you like to update it?"

8. **Transition to work**:
   - After summary, wait for user direction
   - Don't assume next action; let user guide

### Output Format

```markdown
---
## Feature Memory Loaded

**Feature**: [name]
**Last Updated**: [date]
**Branch**: [branch name]

### Quick Summary

[2-3 sentences covering goal and current status]

### Key Points

- **Goal**: [What you're building]
- **Status**: [Where you are]
- **Next logical step**: [Based on status and blockers]

### Active Blockers

[List any blockers, or "None"]

---

Ready to continue. What would you like to work on?
```

### Error Handling

- **No memory found**:

  ```
  No memory found for branch "[branch-name]".

  Run `/memory.save` to create memory for current work.
  ```

- **Memory directory missing**: Create it and report no memories exist yet

- **No git repo**: Warn user that memory requires a git repository for branch detection

- **Detached HEAD**: Warn user and suggest checking out a branch first
