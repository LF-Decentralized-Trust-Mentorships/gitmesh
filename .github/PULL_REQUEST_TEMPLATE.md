## PR Title Convention

Use the following prefixes in your PR title:

- `feat:` - New feature (non-breaking change which adds functionality)
- `fix:` - Bug fix (non-breaking change which fixes an issue)
- `docs:` - Documentation update
- `refactor:` - Code refactoring (no functional changes)
- `perf:` - Performance improvement
- `test:` - Test addition or update
- `build:` - CI/CD or build configuration change
- `breaking:` - Breaking change (affects existing functionality)
- `chore:` - Other changes (dependencies, tooling, etc.)

**Example**: `feat: add user authentication module` or `fix: resolve memory leak in data processor`

---

Copy below template
```markdown
## Description

<!-- Provide a clear and concise description of what this PR does -->



## Related Issue

<!-- Use "Fixes", "Resolves", or "Closes" to automatically close the issue when PR is merged -->

Fixes #(issue_number)
<!-- OR -->
Resolves #(issue_number)
<!-- OR -->
Closes #(issue_number)

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] `feat:` New feature
- [ ] `fix:` Bug fix
- [ ] `docs:` Documentation update
- [ ] `refactor:` Code refactoring
- [ ] `perf:` Performance improvement
- [ ] `test:` Test addition or update
- [ ] `build:` CI/CD or build configuration
- [ ] `breaking:` Breaking change
- [ ] `chore:` Other changes

## How I Solved the Issue

<!-- Explain your approach and the solution you implemented -->



## How I Tested It (if appropriate)

<!-- Describe the testing process you followed -->

- [ ] Tested locally
- [ ] Added unit tests
- [ ] Added integration tests
- [ ] Tested in development environment
- [ ] Tested edge cases

**Testing Details**:



## Screenshots (if appropriate)

<!-- Add screenshots or GIFs to demonstrate the changes -->



## Documentation Changes (if appropriate)

<!-- Specify which area of documentation was updated -->

- [ ] README
- [ ] Documentation Website
- [ ] Contributing Guide
- [ ] Roadmap Guide
- [ ] Changelog
- [ ] Other: _____

**Documentation Area**: 



## Breaking Changes (if appropriate)

<!-- If this PR introduces breaking changes, list them here with migration instructions -->



## Additional Notes (if appropriate)

<!-- Add any additional information that reviewers should know -->



## Requests to Maintainers (if appropriate)

<!-- Any specific requests for the maintainers -->

- [ ] Please add `hacktoberfest-accepted` label
- [ ] Please add `good-first-issue` label
- [ ] Please consider for next release
- [ ] Other: _____

---

## Checklist

- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
- [ ] I have checked for any typos or grammatical errors
- [ ] I have previously contributed to this repository (not mandatory)
```
