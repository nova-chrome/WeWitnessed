---
description: Save or update feature memory with structured context about current work. Captures goal, key files, decisions, status, and blockers for the current git branch.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The `$ARGUMENTS` contains optional custom guidance for what to emphasize in the memory.

## Outline

Save or update feature memory to preserve context for future sessions.

### Execution Steps

1. **Get current git branch**:

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

   Sanitize the branch name by replacing `/` with `-` for the filename.

2. **Set memory file path**: `.claude/memory/[sanitized-branch-name].md`

3. **Ensure directory exists**:

   ```bash
   mkdir -p .claude/memory
   ```

4. **Check for existing memory**:

   - If file exists, read current content as baseline
   - Preserve any user-added sections not in default template

5. **Gather context** by analyzing:

   - **Git state**: Run `git diff --stat` and `git status` to see current changes
   - **Recent commits**: Run `git log --oneline -10` to see recent work on this branch
   - **Current conversation**: What files were discussed/modified in this session
   - **Branch name**: Infer feature purpose from branch naming

6. **Extract custom guidance** from `$ARGUMENTS`:

   - If user provided text, treat as guidance for what to emphasize
   - Example: `"Focus on API design decisions"` means expand the Decisions section with API-specific details

7. **Generate memory content** with this structure:

   ```markdown
   # Feature Memory: [Feature Name derived from branch]

   > Last updated: [YYYY-MM-DD HH:MM]
   > Branch: [current-branch]

   ## Goal

   [1-3 sentences describing what this feature accomplishes based on branch name, commits, and context]

   ## Key Files

   | File               | Purpose         |
   | ------------------ | --------------- |
   | `path/to/file1.ts` | [Brief purpose] |
   | `path/to/file2.ts` | [Brief purpose] |

   ## Decisions

   - **[Decision Topic]**: [What was decided and why]
   - **[Decision Topic]**: [What was decided and why]

   ## Current Status

   [2-4 sentences on where implementation stands]

   - [ ] Task in progress
   - [x] Completed task
   - [ ] Upcoming task

   ## Blockers

   - [Current blocker or pending question]
   - [Another blocker if applicable]

   ## Custom Notes

   [Only if user provided custom guidance - capture what they requested]

   ## Related Context

   - Spec: [path if exists in .specify/features/]
   - PR: [link if exists]
   ```

8. **Write memory file**: Save to `.claude/memory/[sanitized-branch-name].md`

9. **Report completion**:
   - Confirm file location
   - Summarize what was captured (bullet list of sections with counts)
   - Remind user to run `/memory.load` in new sessions

### Content Guidelines

- **Goal**: Extract from branch name, spec file, or conversation context
- **Key Files**: Include only truly critical files (max 10), with clear purpose
- **Decisions**: Focus on non-obvious choices that future-you needs to know
- **Status**: Be specific about what's done, in progress, and remaining
- **Blockers**: Include questions that need answers, not just technical issues

### Handling Custom Prompts

When user provides guidance like "Focus on API decisions":

1. Still include all required sections
2. Expand the relevant section (Decisions in this case)
3. Add a "Custom Notes" section with specific details they requested
4. Adjust depth of other sections proportionally

### Error Handling

- **No git repo**: Warn user that memory requires a git repository for branch detection
- **Detached HEAD**: Warn user and suggest checking out a branch first
- **No context to save**: Ask user to describe the feature or provide more info
- **Write failure**: Report error with suggested fix (permissions, path issues)
