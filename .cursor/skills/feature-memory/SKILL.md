---
name: feature-memory
description: Maintain temporary, local context about current work to help start new prompts with relevant feature knowledge. Apply when starting fresh sessions, switching contexts, or when user mentions memory, context, or feature state.
---

# Feature Memory Skill

Maintain temporary, local context about your current work. Feature memory helps preserve critical context across sessions, enabling smooth continuation of work without losing important decisions, progress, or blockers.

## Purpose

Feature memory solves the problem of context loss when:

- Starting a new Claude session mid-feature
- Returning to work after a break
- Needing to quickly resume where you left off

## Memory Structure

Each feature memory file follows a structured format tied to the current git branch:

### Required Sections

| Section            | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| **Goal**           | What you're trying to accomplish (1-3 sentences)        |
| **Key Files**      | Critical files for this feature (paths + brief purpose) |
| **Decisions**      | Important technical/design decisions made               |
| **Current Status** | Where you are in the implementation                     |
| **Blockers**       | Current obstacles or pending questions                  |

### Optional Sections

| Section             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| **Custom Notes**    | User-defined context based on their prompt |
| **Related Context** | Links to specs, PRs, issues, etc.          |

## Storage

Memory files are stored at `.claude/memory/[branch-name].md` where:

- `[branch-name]` is derived from current git branch (with `/` replaced by `-`)
- Files are gitignored (local-only context)
- One memory file per branch

## Commands

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `/memory.save`  | Save or update feature memory for current branch |
| `/memory.load`  | Load feature memory into current context         |
| `/memory.clear` | Remove feature memory for current branch         |

## Behavioral Guidelines

### When Saving Memory

1. **Analyze recent work** - Review git diff, recent files, and conversation context
2. **Extract key information** - Identify goals, decisions, status, and blockers
3. **Respect user prompts** - If user provides guidance on what to capture, prioritize that
4. **Be concise** - Memory should be scannable, not exhaustive
5. **Include actionable context** - Focus on what helps resume work

### When Loading Memory

1. **Read and internalize** - Load the memory file completely
2. **Acknowledge context** - Briefly confirm what you understand
3. **Ask clarifying questions** - If memory is stale or unclear, ask
4. **Seamlessly continue** - Don't require user to re-explain unless necessary

### When Context Seems Stale

- Check if files mentioned still exist
- Note any discrepancies between memory and current state
- Suggest updating memory after clarifying current status

## Best Practices

1. **Save frequently** - Update memory after significant decisions or progress
2. **One feature per branch** - Memory is tied to branch, so branch per feature
3. **Clear when done** - Remove memory after feature is merged/complete
4. **Custom prompts** - Use custom guidance to capture domain-specific context

## Example Usage

### Starting Fresh Session

```
User: /memory.load
Claude: *Loads memory, summarizes context*
        "I see you're implementing the document versioning feature.
         You've completed the schema changes and are working on the
         migration. There's a blocker around cascade deletes.
         Ready to continue?"
```

### Saving Progress

```
User: /memory.save
Claude: *Analyzes work, writes structured memory*
        "Memory saved. Captured:
         - Goal: Document versioning
         - Key files: 5 identified
         - Decisions: 3 recorded
         - Status: Migration in progress
         - Blockers: Cascade delete concern"
```

### Custom Capture

```
User: /memory.save "Focus on the API design decisions and auth concerns"
Claude: *Saves with emphasis on requested areas*
```
