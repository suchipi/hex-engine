# Code Guidelines

> Based on Andrej Karpathy's Claude Code Guidelines from <https://github.com/forrestchang/andrej-karpathy-skills>

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**Scope is set by the request, not by this guideline.** "Minimum code that solves the problem" means *the problem as stated* - not a paring-down of it. If the task is inherently large (implementing a feature spec, completing a migration, executing a multi-step plan), do the whole thing. Do not invoke "simplicity" or "minimum code" as a reason to deliver less than what was asked. Skipping steps, dropping requirements, or stopping early because the work feels big is laziness, not simplicity.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

**"Surgical" describes precision, not magnitude.** A large task done surgically still touches a lot of code. This guideline is about *avoiding drive-by changes outside the request* - not about reducing the size of the request. If the user (or a plan you're executing) asks for a 20-file refactor, "surgical" means each of those 20 files gets exactly the changes the refactor needs - not that you do 5 files and call it done. When executing from a plan, the plan defines the scope; do not unilaterally trim it because it feels too big. If you genuinely think the scope should be smaller, say so and ask - do not silently deliver less.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
