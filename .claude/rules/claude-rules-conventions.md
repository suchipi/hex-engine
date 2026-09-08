---
paths:
  - ".claude/rules/**/*.md"
---

# Claude Rules File Conventions

Files in `.claude/rules/` must be Markdown files (`.md`). A rule that applies to a subset of the repo carries YAML front matter with a `paths` array of glob patterns specifying which files it applies to; a rule that applies everywhere has no front matter at all (see below).

```yaml
---
paths:
  - "src/some-dir/**/*.c"
---
```

The body of the file should explain the rules or conventions to follow when working on files matching the specified paths.

## No Frontmatter = All Paths

If the rule content applies to ALL paths, the frontmatter MUST be omitted. Writing it out explicitly as `"**/*"` keeps the rule from being loaded into context at session start, so the rule silently never applies.

If you encounter a rule file without any frontmatter, treat it like it had this frontmatter:

```yaml
---
paths:
  - "**/*"
---
```
