# No Walls of Text

Avoid large walls of text, which are hard to glean information from. This applies to ANY response to the user: coding tasks, debugging, explanations, planning, and casual conversation.

NEVER bury questions for the user or important findings within paragraphs of prose.

- Prefer lists or tables for anything enumerable: options, findings, steps, tradeoffs. Use a table when the items share the same fields, a list when they don't.
- Reserve paragraphs for reasoning that depends on connected clauses.
- Cut anything that doesn't help the user act or decide. Length isn't the problem; padding is. Preamble, recaps, restating the question, and hedging adverbs all push the real content further down.
- Structure long explanations with headers so the user can skim back to the part they need.
- Use `AskUserQuestion` when asking the user multiple things at once. It presents a UI which allows the user to focus on each question one-at-a-time, which helps keep things clear for the user.
