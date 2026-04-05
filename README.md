# GrindHaven

**LLM-native engineering orchestration — with a quest log.**

GrindHaven is a work tracking tool built for engineers who spend their days managing multiple AI coding sessions, ad-hoc requests, and parallel workstreams. It treats LLM agents as first-class participants in your workflow, not afterthoughts.

The name says it all — a haven for the grind. The place where the real work happens: forging software from intent, context, and AI, one session at a time.

---

## The Problem

Modern engineering work is fracturing. A single developer might have three Claude Code sessions running, a Slack thread asking for a "quick fix," a PR review, and a sprint ticket — all in flight simultaneously. Existing tools fail this reality in two ways:

**Traditional project management (Jira, Linear, Asana)** tracks tickets, not actual work. The ticket says "Implement auth flow." It tells you nothing about the three agent sessions that tried different approaches, which one succeeded, or what context was built along the way.

**Gamified todo apps (Habitica, et al.)** add RPG chrome to a checkbox. They don't understand what you're building, can't evaluate progress meaningfully, and treat "buy groceries" and "refactor the payment pipeline" as equivalent tasks.

Neither category knows that LLM agents exist.

## What Makes GrindHaven Different

### LLM agents are tracked entities, not invisible tools

When you spin up a Claude Code session, GrindHaven knows about it. It tracks what the agent is working on, what files it's touching, what branch it's on, and how the work relates to your other active tasks. You stop losing context when you switch between sessions.

### AI-evaluated progress, not self-reported checkboxes

GrindHaven uses LLMs to evaluate task completion, estimate remaining complexity, and score work quality — consistently across your entire workload. It doesn't ask you "is this done?" It looks at the work and tells you where things stand.

### RPG progression that means something

The quest/XP system isn't decoration. Difficulty ratings are derived from actual code complexity. Progress is measured by real output, not by how many times you clicked "complete." When GrindHaven says a task is an S-rank quest, it's because the LLM evaluated the scope and determined it's genuinely hard.

### Built for the "interrupt-driven" engineering day

Ad-hoc requests, context switches, and side quests aren't bugs in your workflow — they're the workflow. GrindHaven models this explicitly with a quest taxonomy: main quests (sprint work), side quests (ad-hoc requests), daily quests (recurring tasks), and raids (cross-team efforts).

## Roadmap

### Phase 1: Personal Session Tracker (MVP)

The immediate pain point. A single engineer tracking their own Claude Code sessions and tasks.

- Track active LLM agent sessions with context summaries
- Capture ad-hoc tasks as side quests without disrupting flow
- Basic quest taxonomy: main quest, side quest, daily quest
- XP and progression tied to completed work
- Local-first, single user

### Phase 2: Team Visibility

Engineering managers and tech leads gain visibility into what their team is actually working on — not what the tickets say, but what the code shows.

- Multi-user support with team views
- Integrate with git hooks to auto-track progress and status
- Quest boards showing real-time team workstreams
- LLM-generated summaries of what each engineer accomplished

### Phase 3: Consistent Evaluation

LLM-powered scoring and evaluation across the team, removing the subjectivity from performance visibility.

- Automated complexity scoring for tasks
- Consistent cross-team evaluation of work output
- Historical progression tracking per engineer
- Integration with existing PM tools (Linear, Jira) as data sources

## Philosophy

GrindHaven is a dev tool first and an RPG second. The gamification exists because progression systems are genuinely good at maintaining motivation over long time horizons — but only when the metrics are real. Fake XP for fake checkboxes is worse than no gamification at all.

The LLM integration is the core differentiator. Every other tool in this space was designed before AI agents became a daily part of engineering work. GrindHaven is built for the world where your most productive "teammate" doesn't have a Slack account.

## Contributing

This project is in early development. More details on contributing will follow as the architecture stabilizes.

## License

[MIT](LICENSE)
