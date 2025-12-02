{
  "name": "GitMesh AI Agent Development Guidelines",
  "description": "Configuration for Continue.dev when working on GitMesh Community Edition",
  "context": {
    "project": "GitMesh - Git collaboration network with intelligent backlog generation",
    "edition": "Community Edition (Apache License 2.0, LFDT governed)",
    "restriction": "Never use, modify, or incorporate Enterprise Edition code"
  },
  "rules": [
    {
      "category": "editions",
      "items": [
        "All code is Community Edition unless explicitly marked as Enterprise Edition",
        "Enterprise Edition is proprietary to Alveoli and must never be modified",
        "Report EE code immediately to rawx18.dev@gmail.com or ronitk964@gmail.com"
      ]
    },
    {
      "category": "technology_stack",
      "items": [
        "TypeScript and JavaScript: Use modern ES6+ patterns",
        "Python: Follow PEP 8 with type hints",
        "Bash: POSIX-compliant with proper error handling",
        "Match language and style conventions of existing files"
      ]
    },
    {
      "category": "development_philosophy",
      "items": [
        "Prioritize backlog intelligence, routing accuracy, and sprint planning quality",
        "Write practical, well-tested code solving real problems",
        "Speed matters but never at cost of security or stability",
        "Favor clarity over cleverness, maintain backward compatibility"
      ]
    },
    {
      "category": "security",
      "items": [
        "Never weaken authentication, authorization, or access controls",
        "Never expose sensitive data through logs, errors, or API responses",
        "Never commit secrets, credentials, private keys, or sensitive configuration",
        "Handle user data responsibly following stated privacy policies",
        "Report CE security issues to rawx18.dev@gmail.com",
        "Report EE security issues to ronitk964@gmail.com"
      ]
    },
    {
      "category": "stability",
      "items": [
        "Never break existing features without justification and approval",
        "Run existing tests before submitting changes",
        "Add tests for new functionality",
        "Ensure configuration changes are backward compatible",
        "Maintain performance in critical code paths"
      ]
    },
    {
      "category": "code_quality",
      "items": [
        "Write clean, maintainable code with meaningful names",
        "Structure code logically with low coupling and high cohesion",
        "Test core logic, component integration, and critical workflows",
        "Document public APIs, complex algorithms, and configuration options",
        "Keep pull requests focused on one problem or feature"
      ]
    },
    {
      "category": "vibe_coding",
      "items": [
        "Configuration files live in .vibe directory and are version controlled",
        "Symlinks are created locally and not committed",
        "Edit files in .vibe, not the symlinks",
        "Do not commit .symlinks reference file",
        "Do not modify .vibe structure without understanding impact on all AI tools"
      ]
    },
    {
      "category": "prohibited",
      "items": [
        "Never modify, copy, or incorporate Enterprise Edition code",
        "Never weaken security controls or expose sensitive data",
        "Never commit secrets, credentials, or private keys",
        "Never break existing features without explicit approval",
        "Never bypass tests or ignore test failures",
        "Never introduce unnecessary dependencies without justification",
        "Never hardcode values that should be configurable",
        "Never ignore error conditions or fail silently"
      ]
    },
    {
      "category": "contribution",
      "items": [
        "Comply with Apache License 2.0 for all contributions",
        "Write clear commit messages explaining what changed and why",
        "Open pull requests with descriptions and test evidence",
        "Be responsive to code review feedback",
        "Engage constructively with maintainers and contributors",
        "Respect governance processes and role assignments",
        "Follow Code of Conduct aligned with LFDT principles"
      ]
    }
  ],
  "contacts": {
    "ce_lab_leader": "rawx18.dev@gmail.com",
    "alveoli_cto": "ronitk964@gmail.com"
  },
  "license": "Apache License 2.0",
  "governance": "Linux Foundation Decentralized Trust"
}