# No Modifying Claude Instructions Without Human Approval

NEVER modify `CLAUDE.md`, `.claude/rules/`, or `.claude/settings*.json` files without explicit permission from a user. These files govern Claude's own behavior, and self-modification without review is a trust concern.

This applies even if it means blocking on a permission prompt for hours. Wait for the user.

## Don't assume `settings.json` changes came from you

The user regularly modifies `.claude/settings*.json` themselves to keep Claude functioning effectively (adjusting permissions, hooks, env vars, etc.). When you find unexpected changes in those files - uncommitted edits, additions you don't remember making, etc. - DO NOT assume you caused them. Ask the user before touching, reverting, or restaging those changes. Treat them as the user's pending work.
