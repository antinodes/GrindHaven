# GitHub PR Comment Templates

## Summary Comment

```markdown
## Code Review — PR #{pr_number}

**Branch:** `{source}` → `{target}`
**Files changed:** {file_count} | **Commits:** {commit_count}

### Findings

| Severity | Count            |
| -------- | ---------------- |
| CRITICAL | {critical_count} |
| HIGH     | {high_count}     |
| MEDIUM   | {medium_count}   |
| LOW      | {low_count}      |

### Top Findings

{top_findings_list}

### Agents

| Agent               | Focus                          | Findings |
| ------------------- | ------------------------------ | -------- |
| code-reviewer       | Logic, errors, security        | {count}  |
| typescript-reviewer | Type safety, AdonisJS patterns | {count}  |
| architect-reviewer  | Architecture, coupling, SOLID  | {count}  |

---

_Full report: `ai-docs/pr-reviews/{pr_number}/review-report.md`_
```

## Individual Finding (for "All" mode)

```markdown
**[{severity}] {title}**
_File: `{file_path}:{line_number}` | Found by: {agent_list}_

{description}

**Fix:** {recommendation}
```

## Severity Definitions

- **CRITICAL** — Security vulnerability, data loss risk, or production-breaking bug
- **HIGH** — Logic error, performance issue, or significant maintainability concern
- **MEDIUM** — Code quality issue, missing validation, or deviation from project patterns
- **LOW** — Style nit, minor improvement suggestion, or documentation gap
