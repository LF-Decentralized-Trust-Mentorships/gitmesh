GitMesh AI Agent Development Guidelines

You are working on GitMesh, a Git collaboration network that correlates market signals with engineering telemetry to automatically generate ranked backlogs, sprint plans, and intelligent work routing across development stacks.

Project Structure and Editions

GitMesh exists in two distinct editions that must never be mixed or confused.

GitMesh Community Edition is the open source version licensed under Apache License 2.0 and governed by the Linux Foundation Decentralized Trust. All code you work with in this repository is Community Edition unless explicitly marked otherwise. CE is designed for open collaboration, experimentation, and adoption aligned with LFDT's mission to advance decentralized trust technologies.

GitMesh Enterprise Edition is proprietary software owned exclusively by Alveoli. It is not open source, not licensed under Apache 2.0, and not intended for unrestricted public use. EE may only be used under valid subscription agreements with Alveoli. You must never modify, access, reverse engineer, copy, incorporate, or redistribute any Enterprise Edition code. All rights, title, and interest in EE, including all intellectual property rights, remain solely with Alveoli.

If you ever encounter code marked as Enterprise Edition, do not use it, execute it, modify it, or incorporate it into Community Edition work. Report any inadvertent presence of EE code immediately to the Lab Leader at rawx18.dev@gmail.com or the CTO of Alveoli at ronitk964@gmail.com. Remove any such material from all systems, repositories, forks, mirrors, backups, and distributions immediately upon discovery.

Technology Stack and Languages

The GitMesh codebase appears to use multiple technologies based on the repository structure. The setup script is written in Bash for Unix-like systems. The project includes configuration for various development tools and likely contains backend services, frontend components, and infrastructure code. When writing code, match the language and style conventions of the file you are modifying. TypeScript and JavaScript files should follow modern ES6+ patterns. Python code should be clean, type-hinted where appropriate, and follow PEP 8 guidelines. Shell scripts should be POSIX-compliant where possible and include proper error handling.

Development Philosophy

GitMesh CE development prioritizes shipping features that improve backlog intelligence, routing accuracy, sprint planning quality, and developer experience. Changes should be practical, well-tested, and focused on solving real problems for teams using GitMesh to plan and execute work. Speed and flow matter, but never at the cost of security, stability, or breaking existing functionality.

Write code as a professional software engineer would write it. Avoid unnecessary complexity. Favor clarity over cleverness. Document non-obvious behavior. Test your changes. Ensure backward compatibility unless explicitly breaking changes are required and approved. Respect existing patterns and architectural decisions in the codebase. When introducing new patterns, ensure they are justified and well-documented.

Security and Stability Requirements

Security is non-negotiable in GitMesh development. Never weaken authentication, authorization, or access control mechanisms. Never expose sensitive data through logging, error messages, or API responses. Never commit secrets, credentials, private keys, or configuration files containing sensitive information. Handle user data responsibly and in accordance with stated privacy policies. Follow secure coding practices for input validation, output encoding, and protection against common vulnerabilities.

Report security vulnerabilities through responsible disclosure. For Community Edition issues, contact the Lab Leader at rawx18.dev@gmail.com. For Enterprise Edition issues, contact the CTO of Alveoli at ronitk964@gmail.com. Never disclose security issues publicly before they have been triaged and addressed.

Maintain stability by ensuring your changes do not break existing features. Run existing tests before submitting changes. Add new tests for new functionality. Verify that configuration changes are backward compatible or provide clear migration paths. Ensure that performance-sensitive code paths remain performant. Avoid introducing regressions in critical workflows like backlog generation, sprint planning, or work routing.

Contribution Standards

All contributions to GitMesh CE must comply with the Apache License 2.0. You must have the right to contribute the code you submit. Respect third-party licenses and intellectual property rights. Properly attribute code, ideas, and resources from external sources. Do not incorporate code from GitMesh Enterprise Edition or any other proprietary source without explicit written permission and appropriate licensing.

Follow the project's contribution guidelines. Write clear commit messages that explain what changed and why. Open pull requests with concise descriptions, link to related issues, and include test evidence where appropriate. Be responsive to feedback during code review. Engage constructively with maintainers and other contributors.

Governance and role assignments are managed through the contributor system defined in governance documentation. Newbie Contributors handle early fixes and documentation. Active Contributors ship features and bug fixes regularly. Core Contributors review and maintain subsystems. Principal Contributors provide long-term technical direction. CE Maintainers coordinate releases, ensure quality, and maintain separation between CE and EE. Respect these roles and the decisions made through established governance processes.

Code Quality and Testing

Write clean, maintainable code that others can understand and extend. Use meaningful variable and function names. Structure code logically. Avoid deep nesting and overly long functions. Extract reusable logic into well-named functions or modules. Keep coupling low and cohesion high.

Test your code before submitting it. Unit tests should cover core logic and edge cases. Integration tests should verify that components work together correctly. End-to-end tests should validate critical user workflows. Update tests when changing existing functionality. Add tests when adding new functionality. Ensure tests are reliable, fast, and easy to understand.

Document your code appropriately. Public APIs should have clear documentation explaining parameters, return values, and expected behavior. Complex algorithms should include comments explaining the approach. Configuration options should be documented with examples. Breaking changes or significant behavioral changes should be noted in pull request descriptions and release notes.

Working with the Vibe Coding System

The repository includes a Vibe Coding setup script that creates symlinks to shared AI agent configurations in the .vibe directory. These configurations help maintain consistency across different AI coding tools like Cursor, Cline, Windsurf, Supermaven, Aider, GitHub Copilot, Sourcegraph Cody, Continue.dev, and Gemini CLI.

The actual configuration files live in .vibe and are version controlled. Symlinks are created locally and are not committed to the repository. If you need to modify AI agent behavior, edit the files in .vibe, not the symlinks. The setup script can be re-run to refresh symlinks if they become broken or outdated.

Do not commit symlink files. They are already listed in .gitignore. Do not commit the .symlinks reference file. It is generated locally for documentation purposes. Do not modify the .vibe directory structure without understanding how it affects all linked AI tools.

Release and Deployment

Releases of GitMesh Community Edition follow the process defined in governance/RELEASE_PROCESS.md. Maintainers decide when to cut releases based on meaningful improvements to backlog quality, routing accuracy, developer experience, or stability. Before a release, there may be a feature freeze to focus on stabilization, regression fixes, documentation, and upgrade guidance.

Security is checked before every release. Changes affecting authentication, authorization, storage, networking, data flows, or integrations are reviewed carefully. High-impact vulnerabilities must be resolved before release. Third-party dependencies should be reasonably up to date and free of known critical issues.

Emergency or security-only releases may be created for critical regressions or serious vulnerabilities. These focus on minimal safe fixes with rapid validation and clear communication. All releases remain strictly Community Edition only, licensed under Apache 2.0, with no proprietary EE code included.

Conduct and Collaboration

GitMesh operates under a Code of Conduct aligned with Linux Foundation Decentralized Trust principles. Treat all participants with respect, empathy, and professionalism. Engage differing viewpoints constructively. Give and receive feedback gracefully. Acknowledge mistakes, take responsibility, and learn from them. Prioritize the collective interests of the community over individual preferences.

Use inclusive and appropriate language. Remain focused on discussions that advance project goals. Support others by offering help or asking questions when needed. Respect the time, effort, and contributions of all participants. Harassment, discrimination, trolling, personal attacks, and other unprofessional behavior are strictly prohibited.

Resolve conflicts through calm discussion and established processes. Escalate unresolved issues to maintainers or LFDT governance channels as appropriate. Follow the reporting procedures defined in the Code of Conduct for serious violations. Participate in good faith with the goal of making GitMesh better for everyone who uses it.

What Not to Do

Never modify, copy, or incorporate GitMesh Enterprise Edition code. Never weaken security controls or expose sensitive data. Never commit secrets, credentials, or private keys. Never break existing features without explicit justification and approval. Never bypass tests or ignore test failures. Never misrepresent your affiliation with LFDT, GitMesh, or Alveoli. Never violate third-party intellectual property rights or licensing terms.

Do not introduce unnecessary dependencies without justification. Do not write code that assumes deployment environments you cannot verify. Do not hardcode values that should be configurable. Do not ignore error conditions or fail silently. Do not write code that only works on a specific platform unless platform-specific behavior is required and documented.

Avoid scope creep in pull requests. Keep changes focused on solving one problem or implementing one feature. Avoid making large refactoring changes without discussion and approval. Avoid introducing breaking changes without clear communication and migration paths. Avoid reinventing solutions to problems that are already solved in the codebase or well-established libraries.

Summary of Expectations

You are working on GitMesh Community Edition, an open source project under Apache License 2.0 and the Linux Foundation Decentralized Trust. Your work should advance the mission of providing intelligent backlog generation, sprint planning, and work routing for development teams. Write secure, stable, well-tested code that improves the GitMesh experience. Respect the boundaries between Community Edition and Enterprise Edition. Follow contribution guidelines, governance processes, and the Code of Conduct. Engage professionally with the community. Protect user data and system security. Ship features that solve real problems. Maintain backward compatibility and stability. Document your work. Test your changes. Collaborate constructively with maintainers and contributors. When in doubt, ask questions before making assumptions.