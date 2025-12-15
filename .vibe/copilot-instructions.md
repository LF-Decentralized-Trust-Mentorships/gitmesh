# GitMesh AI Agent Development Guidelines for GitHub Copilot

project_context: |
  You are working on GitMesh, a Git collaboration network that correlates market signals 
  with engineering telemetry to automatically generate ranked backlogs, sprint plans, 
  and intelligent work routing across development stacks.

editions:
  community_edition:
    license: Apache License 2.0
    governance: Linux Foundation Decentralized Trust
    description: Open source version for collaboration and experimentation
    usage: All code in this repository is Community Edition unless explicitly marked
  
  enterprise_edition:
    ownership: Alveoli (proprietary)
    license: Subscription-based commercial license
    restriction: Never modify, access, reverse engineer, copy, or redistribute EE code
    reporting: Report EE code presence to rawx18.dev@gmail.com or ronitk964@gmail.com

technology_stack:
  languages:
    - TypeScript (ES6+ patterns)
    - JavaScript (ES6+ patterns)
    - Python (PEP 8, type-hinted)
    - Bash (POSIX-compliant with error handling)
  
  principles:
    - Match language and style conventions of existing files
    - Follow modern patterns and best practices
    - Write clean, maintainable, professional code

development_philosophy:
  priorities:
    - Improve backlog intelligence
    - Enhance routing accuracy
    - Strengthen sprint planning quality
    - Optimize developer experience
  
  constraints:
    - Never compromise security
    - Never break existing functionality
    - Never sacrifice stability for speed
    - Always maintain backward compatibility

security_requirements:
  mandatory:
    - Never weaken authentication or authorization
    - Never expose sensitive data in logs or errors
    - Never commit secrets, credentials, or private keys
    - Handle user data responsibly
    - Follow secure coding practices
  
  reporting:
    ce_issues: rawx18.dev@gmail.com
    ee_issues: ronitk964@gmail.com

code_quality:
  standards:
    - Write clean, maintainable code
    - Use meaningful names for variables and functions
    - Keep coupling low and cohesion high
    - Avoid deep nesting and long functions
    - Extract reusable logic appropriately
  
  testing:
    - Write unit tests for core logic
    - Write integration tests for components
    - Write end-to-end tests for critical workflows
    - Update tests when changing functionality
    - Ensure tests are reliable and fast
  
  documentation:
    - Document public APIs clearly
    - Comment complex algorithms
    - Document configuration options with examples
    - Note breaking changes in pull requests

vibe_coding_system:
  structure: Configuration files in .vibe directory with local symlinks
  modification: Edit .vibe files, not symlinks
  restrictions:
    - Do not commit symlink files
    - Do not commit .symlinks reference file
    - Do not modify .vibe structure without understanding impact

prohibited_actions:
  - Modify or incorporate Enterprise Edition code
  - Weaken security controls
  - Commit secrets or credentials
  - Break existing features without approval
  - Bypass or ignore tests
  - Introduce unnecessary dependencies
  - Hardcode configurable values
  - Ignore error conditions

contribution_expectations:
  - Comply with Apache License 2.0
  - Write clear commit messages
  - Open focused pull requests
  - Be responsive to code review feedback
  - Engage constructively with maintainers
  - Respect governance processes
  - Follow Code of Conduct