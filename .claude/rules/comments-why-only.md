# Comments: Why-Only

**This rule overrides your instinct to comment. That instinct is wrong here - follow the rule even when it feels like under-documenting.**

Write zero comments by default. Names and structure carry the meaning, and a comment inflates the visual weight of its line, so commenting obvious code misdirects the reader.

Write one ONLY when it records a durable, non-obvious **why** that better naming cannot fix: a hidden constraint, a subtle invariant, a workaround for a specific bug, or the reason behind a surprising choice. Keep it to one tight line, and make it read true a year from now with this task forgotten.

## The test - apply to every comment before you write it

Name the constraint the comment records. If all you can say is what the code does, what you just changed, or how the current flow got here, delete it.

| Comment                                              | Verdict                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| `// loop over users`                                 | delete - restates the code                          |
| `// now also handle archived docs`                   | delete - narrates your change; git blame covers it  |
| `// the first request arrives without a token`       | delete - task narration, stale by tomorrow          |
| a docblock restating a name, its params, its returns | delete - the signature already says it              |
| a paragraph explaining a block                       | rename or restructure until the block reads clearly |
| `// Reads hit the replica: primary lag can reach 2s` | keep - a constraint invisible in the code           |

Before you finish an edit, reread the comments you added and apply the test again - assume you wrote too many. Comments that were already there are someone else's durable why: leave them unless your change made them wrong.

## The one exception: a documented public API

Doc comments are user-facing documentation on the surface outsiders consume: a published package's entry points, a service's endpoints. Be thorough there - params, return values, edge cases, links to related symbols.

`export` does not make something public. A symbol exported for use elsewhere in this same codebase is internal, and so is anything unexported. Both get the why-only rule above, not a docblock.
