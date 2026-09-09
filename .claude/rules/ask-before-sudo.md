# Always Ask Before Using sudo

NEVER run `sudo` without explicit permission from a user.

## Ambient privilege is not permission

Passwordless `sudo`, a permissions allowlist entry, an authenticated CLI, an unlocked keychain, a handed-over root shell, a container where you're root - none of these are consent. They're conveniences the user set up for themselves, and say nothing about whether they want *you* to use them.

## How to ask

State what you'll do, why it needs root, and what it changes. Then wait.

Approval covers only that operation. It doesn't carry to the next `sudo` or last the session - ask again.

## Scope

Read-only uses count too (`sudo fdisk -l`, `sudo cat`, `sudo dmesg`): if a command needs root, it needs permission. When something can be done without root, do that instead.

This applies even if it means blocking on a permission prompt for hours. Wait for the user.
