---
description: >
  Multi-agent code review for GrindHaven GitHub PRs. Spawns 3 specialized agents
  (code-reviewer, typescript-pro, architect-reviewer) in parallel, consolidates
  findings into a report, and optionally posts comments to the PR. Use this skill
  whenever you need to review a pull request, check PR quality before merging, or
  when the user says "review PR", "check this PR", "review before merge", or
  references a PR number they want reviewed. Also use when CLAUDE.md instructs
  running a review before merging.
allowed-tools: >
  Read, Write, Edit, Bash, Glob, Grep, Agent, TaskOutput, AskUserQuestion,
  mcp__plugin_context7_context7__resolve-library-id,
  mcp__plugin_context7_context7__query-docs
argument-hint: <pr-number>
---

# GrindHaven PR Review

Multi-agent parallel code review for GitHub PRs on `antinodes/GrindHaven`. Three
specialized agents review the PR independently, then findings are deduplicated,
verified, and consolidated into a single report.

## Quick Reference

```
/review-pr 5        → review PR #5
/review-pr           → prompts for PR number
```

Produces: `ai-docs/pr-reviews/{pr-number}/review-report.md`

## Constants

- **Repo:** `antinodes/GrindHaven`
- **Working directory:** `ai-docs/pr-reviews/{pr-number}/`
- **Comment template:** `.claude/skills/review-pr/comment-template.md`
- **`{cwd}`** in agent prompts = the project root (absolute path to the repo)

## Phase 1: Setup

1. Parse `$ARGUMENTS` to extract the PR number (a plain integer like `3`).
   If no argument is provided, ask the user for the PR number.

2. Fetch PR metadata and verify the PR exists:
```bash
gh pr view {pr-number} --json title,body,headRefName,baseRefName,files,commits
```
   If this command fails (PR not found, auth issue), report the error and stop.

3. Extract from the JSON response:
   - `title`, `body`
   - `headRefName` → source branch
   - `baseRefName` → target branch
   - `files[].path` → list of changed file paths
   - `commits` → commit list

4. Fetch the source and target branches locally, then generate context files:
```bash
git fetch origin {source} {target} 2>/dev/null
mkdir -p ai-docs/pr-reviews/{pr-number}
git diff origin/{target}...origin/{source} > ai-docs/pr-reviews/{pr-number}/diff.patch
git diff origin/{target}...origin/{source} --stat > ai-docs/pr-reviews/{pr-number}/stats.txt
git log origin/{target}...origin/{source} --oneline > ai-docs/pr-reviews/{pr-number}/commits.txt
```

5. Read the project's `CLAUDE.md` (if it exists) to capture project conventions
   that agents should enforce during review.

6. Write `ai-docs/pr-reviews/{pr-number}/pr-metadata.md` with the PR title, body,
   branches, changed file list, commit log, and relevant project conventions.

## Phase 2: Resolve Context7 Docs

Not every PR touches every part of the stack. Resolve documentation only for
areas the PR actually changes. This keeps agent context focused and avoids noise.

Scan the changed file paths and resolve the matching libraries:

| File pattern | Library to resolve | Query |
|---|---|---|
| `app/models/**`, `database/**` | AdonisJS Lucid | "Lucid ORM models migrations relationships" |
| `app/controllers/**`, `start/routes*`, `app/middleware/**` | AdonisJS HTTP | "HTTP controllers routes middleware" |
| `resources/views/**` | AdonisJS Edge | "Edge templating components layouts" |
| `tests/**` | Japa | "Japa test runner assertions browser" |
| `config/**`, `start/**`, `adonisrc*`, `.env*` | AdonisJS core | "AdonisJS configuration environment providers" |
| `resources/**/*.js` with Alpine patterns | Alpine.js | "Alpine.js directives reactivity" |

**Always resolve AdonisJS core** (with query "AdonisJS v7 application structure
conventions") regardless of which files changed — it provides the foundational
patterns all agents need.

Make all `resolve-library-id` calls in parallel — they're independent. For each
resolved library, call `query-docs` with the query string. Pass the returned
documentation snippets to agents in their prompts.

If a resolve call fails (library not found), skip it — agents can still review
using their built-in knowledge. Note the failure in pr-metadata.md.

## Phase 3: Launch 3 Review Agents

Spawn ALL 3 agents in a **single message** with `run_in_background: true`. Each
agent writes findings to `ai-docs/pr-reviews/{pr-number}/{agent-name}-findings.md`.

**Large PRs (20+ files):** Tell agents to prioritize files with the most additions
and focus on non-trivial changes. Config file updates, lockfile changes, and
auto-generated files can usually be skimmed rather than deeply reviewed.

Every agent prompt must include:
- The diff file path and project root (absolute paths)
- The PR metadata (title, description, branches)
- The changed files list
- Relevant Context7 documentation from Phase 2
- Project conventions from CLAUDE.md (if any)
- The output file path
- The finding format and severity definitions (below)

Build the `{finding_format_block}` variable below and append it to every agent prompt:

```
Write your findings to {cwd}/ai-docs/pr-reviews/{pr-number}/{agent-name}-findings.md.

Use this format for each finding:

## [{severity}] {title}
**File:** `{file_path}:{line_number}`
**Description:** {description}
**Recommendation:** {recommendation}

Severity levels:
- CRITICAL — Security vulnerability, data loss risk, or production-breaking bug
- HIGH — Logic error, performance issue, or significant maintainability concern
- MEDIUM — Code quality issue, missing validation, or deviation from project patterns
- LOW — Style nit, minor improvement, or documentation gap

Only report genuine issues. Do not pad with style nits unless they cause real problems.
Read the diff file first, then read actual source files for any finding you want to
report. If a finding references a line number, verify it exists in the current source.
```

### Agent 1: code-reviewer

```
subagent_type: code-reviewer
name: pr-{pr-number}-code-reviewer
run_in_background: true
```

**Prompt:**
```
Review PR #{pr-number} on branch {source} targeting {target} for code quality and security.

The full diff is at {cwd}/ai-docs/pr-reviews/{pr-number}/diff.patch
The diff stats are at {cwd}/ai-docs/pr-reviews/{pr-number}/stats.txt
The commit log is at {cwd}/ai-docs/pr-reviews/{pr-number}/commits.txt
Project root is at {cwd}.

Context7 documentation:
{context7_docs}

Project conventions:
{claude_md_conventions}

Focus on:
1. Logic errors — off-by-one bugs, race conditions, null/undefined hazards
2. Error handling — missing try/catch, unhandled promise rejections, silent failures
3. Resource leaks — event listeners not cleaned up, subscriptions not unsubscribed
4. Dead code — unreachable branches, redundant conditions
5. Security — XSS, SQL injection via raw queries, mass assignment via request.all(),
   path traversal, improper input validation
6. AdonisJS-specific — VineJS validation on all user input, bouncer policies on
   protected actions, Shield middleware (CSRF, CSP, HSTS)

Key changed files:
{changed_files}

Cross-reference with Context7 docs when checking API usage patterns.

{finding_format_block}
```

### Agent 2: typescript-pro

```
subagent_type: typescript-pro
name: pr-{pr-number}-typescript-pro
run_in_background: true
```

**Prompt:**
```
Review PR #{pr-number} on branch {source} targeting {target} for TypeScript quality.

The full diff is at {cwd}/ai-docs/pr-reviews/{pr-number}/diff.patch
The diff stats are at {cwd}/ai-docs/pr-reviews/{pr-number}/stats.txt
The commit log is at {cwd}/ai-docs/pr-reviews/{pr-number}/commits.txt
Project root is at {cwd}.

Context7 documentation:
{context7_docs}

Project conventions:
{claude_md_conventions}

Focus on:
1. Type safety — use of `any`, missing generics, type assertions that hide errors
2. Type narrowing — insufficient null checks, incorrect type guards
3. AdonisJS patterns — controller DI with @inject(), Lucid model typing,
   VineJS schema inference, HttpContext typing
4. Interface design — overly permissive types, missing readonly, Partial vs Required
5. Import hygiene — runtime imports where type-only would suffice (import type)
6. Edge template data — verify types passed to view.render() match what templates expect

Key changed files (focus on .ts files and .edge template data):
{changed_files}

{finding_format_block}
```

### Agent 3: architect-reviewer

```
subagent_type: architect-reviewer
name: pr-{pr-number}-architect-reviewer
run_in_background: true
```

**Prompt:**
```
Review PR #{pr-number} on branch {source} targeting {target} for architecture quality.

The full diff is at {cwd}/ai-docs/pr-reviews/{pr-number}/diff.patch
The diff stats are at {cwd}/ai-docs/pr-reviews/{pr-number}/stats.txt
The commit log is at {cwd}/ai-docs/pr-reviews/{pr-number}/commits.txt
Project root is at {cwd}.

Context7 documentation:
{context7_docs}

Project conventions:
{claude_md_conventions}

Focus on:
1. Layering — controllers should delegate to services, services to models. Flag
   controllers with >30 lines of business logic or direct model queries.
2. God class detection:
   - Controllers: >7 methods (warning), >12 (critical)
   - Services: >10 methods (warning), >15 (critical)
   - Models: >15 fields (warning), >25 (critical)
3. SOLID — especially Single Responsibility and Dependency Inversion
4. Coupling — circular dependencies, feature A importing internals of feature B
5. Change scope — does the PR try to do too many unrelated things? Should it be split?
6. Naming and organization — file placement follows AdonisJS conventions,
   consistent naming patterns

Read the diff, stats, and commit log first to understand scope, then read source
files for architectural context.

Key changed files:
{changed_files}

{finding_format_block}
```

## Phase 4: Consolidate Findings

Wait for all 3 background agents to complete (you'll receive task completion
notifications for each). Do not proceed until all 3 have finished and written
their findings files. Then:

1. Read all 3 findings files from `ai-docs/pr-reviews/{pr-number}/`.

2. Parse each finding into: severity, title, file, line, description, recommendation,
   source agent.

3. **Deduplicate:** Group findings that reference the same file within a 5-line range
   and describe the same underlying issue. For duplicates, keep the most detailed
   description and note all agents that independently found it — this is a signal
   the issue is real.

4. **Verify HIGH and CRITICAL findings:** Read the actual source files at the stated
   lines. Confirm the issue exists. Drop findings based on misreading the diff or
   that reference code that doesn't exist. This step prevents false positives from
   eroding trust in the review.

5. **Sort:** CRITICAL → HIGH → MEDIUM → LOW, then by file path within each severity.

6. Write `ai-docs/pr-reviews/{pr-number}/review-report.md`:

```markdown
# Code Review Report — PR #{pr-number}

**Title:** {pr_title}
**Branch:** `{source}` → `{target}`
**Files changed:** {file_count} | **Commits:** {commit_count}
**Review date:** {date}

## Summary

{1-2 paragraph overview: what the PR does and the key findings}

| Severity | Count |
|----------|-------|
| CRITICAL | {n} |
| HIGH     | {n} |
| MEDIUM   | {n} |
| LOW      | {n} |

## Critical Findings

### {title}
**File:** `{file_path}:{line_number}`
**Identified by:** {agent_list}
**Description:** {description}
**Recommendation:** {recommendation}

## High Findings
...

## Medium Findings
...

## Low Findings
...

---

## Agent Coverage

| Agent | Findings | Focus |
|-------|----------|-------|
| code-reviewer | {n} | Logic, errors, security |
| typescript-pro | {n} | Type safety, AdonisJS patterns |
| architect-reviewer | {n} | Architecture, coupling, SOLID |
```

Omit empty severity sections — if there are no CRITICAL findings, don't include
the "Critical Findings" heading at all.

## Phase 5: Post to GitHub

1. Present a summary to the user: total findings by severity, top 3 most important.

2. Ask: **"Post comments to PR #{pr-number}?"** with options:
   - **All** — Post all findings as a single summary comment
   - **High only** — Post only CRITICAL + HIGH findings
   - **Summary only** — Post just the severity counts and overview
   - **None** — Report stays local only

3. If posting, read the comment template from `.claude/skills/review-pr/comment-template.md`
   and format the comment. Write the formatted comment to a temp file to avoid
   shell quoting issues with markdown.

4. Post via:
```bash
gh pr comment {pr-number} --body-file ai-docs/pr-reviews/{pr-number}/gh-comment.md
```

5. Report to the user: how many findings, the report path, and the PR URL.

## When There Are No Findings

If all agents return clean reviews with no findings, that's a valid outcome — say so.
Write a brief review-report.md noting the clean review and skip the posting phase.
Don't invent findings to justify the review process.
