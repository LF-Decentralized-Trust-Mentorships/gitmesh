# GitMesh Community Edition — Governance (CE)

## Purpose
This document defines the contributor roles, assignment rules, promotion/demotion process, activity policy, and governance operations for GitMesh Community Edition (CE). CE is governed within the LF Decentralized Trust workflow and follows the contribution, review, and assignment processes defined in the LFDT project.

## Roles (CE)
- **Newbie Contributor** — Starts with small tasks, documentation, and first PRs.
- **Active Contributor** — Regular contributor with growing responsibility and roadmap visibility.
- **Core Contributor** — Proven contributor trusted with code reviews and higher-impact tasks.
- **Principal Contributor** — Long-term, high-impact contributor considered for maintainer or core roles; eligible for special consideration for long-term positions such as maintainer or Founding Engineer track and ESOP allocation.

## Who Assigns Roles (summary)
- Each tier is promoted by the tier immediately above it.
  - Newbie ← assigned by Active Contributors
  - Active ← assigned by Core Contributors
  - Core ← assigned by Principal Contributors
- **Principal Contributors** — nominated and assigned by CE Maintainers. Maintainers may consult Core Contributors, but maintainers make CE Principal assignments.

## Promotion & Nomination Process
1. **Nomination**
   - A candidate is nominated by one or more contributors from the tier above (written nomination on the CE governance issue tracker).
   - Nomination must reference: contribution history, key PRs/issues, impact, and any relevant reviews.

2. **Review**
   - The nominating tier reviews the candidate against criteria (see Criteria section).
   - For Principal nomination, CE Maintainers perform the review and decide.

3. **Decision**
   - If the reviewing tier approves, the role change is posted as an issue/PR to the governance tracker and applied to the contributors registry.
   - All role changes are visible in `contributors.yaml` and release notes.

## Criteria (minimums)
- **Newbie Contributor**
  - At least 1 merged PR or a documented contribution.
  - Note: Once achieved, the Newbie designation is recorded and cannot be revoked (see permanence rule).
- **Active Contributor**
- 5+ meaningful contributions over a 90-day window or equivalent sustained activity (recommended but not mandatory for promotion).
- **Core Contributor**
  - Demonstrated code quality across multiple components, regular code reviews, and ownership of at least one subsystem for 3+ months.
- **Principal Contributor**
  - Sustained multi-quarter impact, leadership in community initiatives, deep technical ownership, and willingness to mentor.

## Inactivity, Demotion, and Reactivation
- **Inactivity flag**
    - If no recorded activity (PRs, reviews, comments on governance issues) for **90 days**, user is flagged as `inactive` in the registry.
- **Demotion**
    - **180 days** of inactivity -> demotion by one tier (except Newbie tag which remains on record).
    - Demotion is performed by the tier that would normally assign the role (e.g., Core Contributors can demote Active Contributors) with notification and published rationale.
    - **Note**: Time-based demotion is not mandatory for upper roles (Core Contributor and above). Principal Contributors, CE Maintainers, or Governance Council may execute demotion in special cases at their discretion, regardless of the standard timeframes, with documented rationale.
- **Removal**
    - **365 days** of inactivity -> role can be removed from active lists but historical record retained in `contributors.yaml`.
    - **Note**: Time-based removal is not mandatory for upper roles (Core Contributor and above). Principal Contributors, CE Maintainers, or Governance Council may execute removal in special cases at their discretion, regardless of the standard timeframes, with documented rationale.
- **Reactivation**
    - Any contribution (even a single PR) will clear the `inactive` flag and restore the user to the appropriate tier per the current promotion rules. Newbie status, once earned, remains as a permanent historical badge.

## Conflicts, Appeals, and Veto
- **Conflict resolution**
  - Start with an issue in the governance tracker describing the dispute.
  - CE Maintainers mediate; if unresolved, escalate to the Governance Council.
- **Appeals**
  - Affected contributor may file a formal appeal; CE Maintainers convene a review panel within 21 days.
- **Veto**
  - Governance Council may veto any CE decision with a public rationale. Veto should be exceptional and recorded.

## Privileges & Responsibilities by Role
- **Newbie Contributor**
  - Privileges: contributor mention, basic issue assignment, contributor listing.
  - Responsibilities: follow contribution guidelines and tests.
- **Active Contributor**
  - Privileges: roadmap discussion access, assignment to larger tasks.
  - Responsibilities: timely PR reviews and issue ownership.
- **Core Contributor**
  - Privileges: review rights, ability to assign Active and Newbie roles, can nominate for Principal.
  - Responsibilities: enforce code standards, mentor Active contributors.
- **Principal Contributor**
  - Privileges: assign Core/Active/Newbie roles (per policy), lead significant CE initiatives, eligible to propose maintainer candidates.
  - Responsibilities: long-term stewardship, security and release participation, liaison with EE when necessary.

## Maintainers
- CE Maintainers hold operational responsibilities:
  - Issue triage, label policies, merging policy for CE,
  - Principal selection (as above),
  - Ensuring no conflict with EE proprietary lines.
- Maintainers must document decisions and record reasons in the governance tracker.

## Governance Records & Registry
- All role changes, nominations, promotions, demotions, and appeals must be recorded as issues/PRs in LFDT GitMesh repo and reflected in `governance/contributors.yaml`.
- `contributors.yaml` is the canonical source for current roles and statuses.

### Automated Governance Sync
The governance system includes an automated sync workflow that:
- **Auto-syncs contributor activity** from GitHub (merged PRs, reviews, comments) daily
- **Maintains historical records** in `governance/history/` directory:
  - `ledger.yaml` - Global chronological log of all governance events
  - `history/users/{username}.yaml` - Per-user contribution and role change history
- **Tracks activity status** - Automatically flags contributors as inactive after 90 days of no activity
- **Newbie auto-onboarding** - Automatically assigns "Newbie Contributor" role to users with their first merged PR
- **Creates PRs for review** - All automated updates are submitted as PRs for maintainer review before merging

The sync workflow runs:
- Daily at midnight UTC (via scheduled cron)
- On pushes to main branch
- On merged PRs that modify `governance/contributors.yaml`
- Manually via workflow dispatch

All governance automation is transparent, auditable, and designed to support (not replace) human decision-making. Maintainers review and approve all automated updates before they take effect.

## Badging, Recognition, and ESOP Pathways
- Badges and public recognition follow role assignment.
- Eligibility for the Founding Engineer track and reserved ESOP pool is determined by Alveoli Founding Team and CE Maintainers, based on documented sustained impact and alignment with core engineering values. Final appointment for company-level equity requires Governance Council approval.

## Code of Conduct
- All participants must follow the project Code of Conduct (link in repo). Breaches may lead to role restrictions or removal.

## Updates to this Policy
- CE governance updates are made via PR in the gitmesh repo. Substantive changes require a 14-day comment period and a recorded decision.

## Development of Governance Structure
- The governance structure for GitMesh Community Edition is currently under development by the GitMesh engineering team.
- Final decisions regarding the governance framework rest with the CE Maintainers, who retain the authority to block or modify any aspect of the governance policies as deemed necessary.
- Changes to the governance structure can be implemented immediately if required, ensuring that the framework remains adaptable and responsive to the needs of the community and project evolution.
- All stakeholders are encouraged to provide feedback during this development phase to foster a collaborative and inclusive governance model.
