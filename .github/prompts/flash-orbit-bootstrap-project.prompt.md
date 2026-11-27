# Flash Orbit — Repository Bootstrap and Agent Setup

Inspect this repository before making changes.

## Goal
Prepare the repository for disciplined development of Flash Orbit, a multi-tenant commerce,
inventory, and financial-management SaaS.

## Instructions
1. Inspect the complete top-level structure, package manifests, framework, dependencies,
   scripts, existing documentation, tests, and CI configuration.
2. Do not replace or overwrite useful existing instructions.
3. Create or carefully update:
   - `.github/copilot-instructions.md`
   - `.github/agents/flash-orbit-orchestrator.agent.md`
   - `.github/agents/flash-orbit-product-architect.agent.md`
   - `.github/agents/flash-orbit-frontend-engineer.agent.md`
   - `.github/agents/flash-orbit-qa-reviewer.agent.md`
   - `.github/agents/flash-orbit-security-reviewer.agent.md`
4. Preserve the repository's actual stack and conventions. Do not install packages or change
   application code as part of this setup.
5. Add a concise `docs/engineering-workflow.md` describing the task lifecycle:
   Inspect → Plan → Approve → Implement → Validate → Review → Report.
6. If the repository is empty, document that fact and recommend a stack separately; do not
   initialize the app until approved.
7. Check that agent frontmatter is valid and all paths are correct.

## Output
Summarize the repository findings, files created or updated, any conflicts, and how to select
the agents in GitHub Copilot Chat. Do not begin feature implementation.
