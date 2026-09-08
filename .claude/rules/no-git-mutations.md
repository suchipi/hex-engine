# No Git Mutations Without Human Approval

NEVER run `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git checkout`, `git switch`, `git cherry-pick`, `git revert`, `git stash push`, `git stash pop`, `git stash drop`, or any other git command that modifies repository state without explicit permission from a user.

Read-only git commands (`git log`, `git diff`, `git show`, `git blame`, `git status`, etc.) are fine.

This applies even if it means blocking on a permission prompt for hours. Wait for the user.
