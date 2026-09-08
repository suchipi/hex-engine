# Write Tests That Cannot Be Flaky

A flaky test depends on something it does not control, and a green rerun cannot prove otherwise. Design that out as you write it: control each such input from outside the code under test, without replacing what the test exists to cover, and assert only on what the system guarantees.

The usual culprits: real time and elapsed duration, async completion, randomness, iteration or arrival order, state shared with other tests or earlier runs, the network, locale, timezone, cwd, and environment variables.

If something cannot be controlled, say so. Rerun to expose variance, never to get past it, and NEVER hide it behind retries, longer sleeps, or wider tolerances. A flaky test is a failing test.
