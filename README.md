<div align="center">

<picture>
   <source srcset="public/light_logo.png" media="(prefers-color-scheme: dark)">
   <img src="public/dark_logo.png" alt="GitMesh Logo" width="250">
</picture>

# GitMesh Community Edition

[![OpenSource License](https://img.shields.io/badge/License-Apache%20License-orange.svg?style=for-the-badge)](LICENSE.md)
[![Contributors](https://img.shields.io/github/contributors/LF-Decentralized-Trust-labs/gitmesh.svg?style=for-the-badge&logo=git)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/graphs/contributors)
[![Alpha Release](https://img.shields.io/badge/Status-Alpha%20Version-yellow.svg?style=for-the-badge)](#)
[![Join Weekly Dev Call](https://img.shields.io/badge/Join%20Weekly%20Dev%20Call-Zoom-blue.svg?style=for-the-badge&logo=zoom)](https://zoom-lfx.platform.linuxfoundation.org/meeting/96608771523?password=211b9c60-b73a-4545-8913-75ef933f9365)
[![Join Discord](https://img.shields.io/badge/Join%20us%20on-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/xXvYkK3yEp)
[![OpenSSF Best Practices](https://img.shields.io/badge/OpenSSF-Silver%20Best%20Practices-silver.svg?style=for-the-badge&logo=opensourceinitiative)](https://www.bestpractices.dev/projects/10972)

**Code with purpose, Integrate with confidence**

[![Documentation](https://img.shields.io/badge/Documentation-000000?style=flat&logo=readthedocs)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/README.md) 
[![Join Community](https://img.shields.io/badge/Join_Community-000000?style=flat&logo=discord)](https://discord.gg/xXvYkK3yEp)
[![OSS Website](https://img.shields.io/badge/OSS_Website-000000?style=flat&logo=vercel)](https://www.gitmesh.dev) 
[![Join Waitlist](https://img.shields.io/badge/Join_Waitlist-000000?style=flat&logo=mailchimp)](https://www.alveoli.app)

</div>

---

## What is GitMesh?

**GitMesh** watches thousands of signals across GitHub, Reddit, X, Discord, Stack Overflow, and beyond, then correlates them with your team's actual capacity and sprint progress. Instead of manually triaging feedback or guessing priorities, you get auto-generated GitHub issues ranked by impact, ICP fit, and competitive gaps. It maps work to the right engineers, syncs milestones across your stack, and even guides implementation so your team ships what users need, not just what they asked for.

Our mascot (Meshy/Mesh Wolf) reflects GitMesh's core: agile, resilient, and unstoppable together. Like a pack, we thrive on teamwork—efficient and powerful in unison.

---

## Installation

<div align="center">
<picture>
   <source srcset="public/meshy.png" media="(prefers-color-scheme: dark)">
   <img src="public/mesh.png" alt="GitMesh Mascot" width="250">
</picture>
</div>

### Prerequisites

**Node.js** is required to run the application.

1. Visit the [Node.js Download Page](https://nodejs.org/en/download/)
2. Download the "LTS" (Long Term Support) version for your operating system
3. Run the installer, accepting the default settings
4. Verify Node.js is properly installed:
   - **Windows Users**: Press `Windows + R`, type `sysdm.cpl`, press Enter, go to "Advanced" tab → "Environment Variables", and check if `Node.js` appears in the "Path" variable
   - **Mac/Linux Users**: Open Terminal, type `echo $PATH`, and look for `/usr/local/bin` in the output
5. Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
6. Install [Git](https://git-scm.com/downloads)

### Quick Start

```bash
git clone [YOUR_REPO]
cd scripts
./cli dev
```

The application will be available at `http://localhost:8081`

---

## CLI Commands

### Development Commands

| Command | Description |
|---------|-------------|
| `./cli prod` | Start all services (production mode) |
| `./cli dev` | Start with development mode (hot reloading) |
| `./cli clean-dev` | Clean start with development mode |

### Backend-Only Commands

| Command | Description |
|---------|-------------|
| `./cli prod-backend` | Start backend services only (production) |
| `./cli dev-backend` | Start backend with development mode |
| `./cli clean-dev-backend` | Clean start backend with development mode |

### E2E Testing

| Command | Description |
|---------|-------------|
| `./cli start-e2e` | Start services for E2E testing |
| `./cli start-be` | Start backend for testing |

### Scaffold Management

| Command | Description |
|---------|-------------|
| `./cli scaffold up` | Start infrastructure services |
| `./cli scaffold down` | Stop infrastructure services |
| `./cli scaffold destroy` | Remove all volumes and data |
| `./cli scaffold reset` | Destroy and restart infrastructure |
| `./cli scaffold up-test` | Start test infrastructure |

### Database Operations

| Command | Description |
|---------|-------------|
| `./cli scaffold create-migration <name>` | Create new migration files |
| `./cli scaffold migrate-up` | Apply database migrations |
| `./cli db-backup <name>` | Backup database to file |
| `./cli db-restore <name>` | Restore database from backup |

### Service Management

| Command | Description |
|---------|-------------|
| `./cli service <name> up` | Start a specific service |
| `./cli service <name> down` | Stop a specific service |
| `./cli service <name> restart` | Restart a specific service |
| `./cli service <name> logs` | View service logs |
| `./cli service <name> status` | Check service status |
| `./cli service list` | List all running services |
| `./cli service up-all` | Start all services |

### Build Commands

| Command | Description |
|---------|-------------|
| `./cli build <service> [version]` | Build a service image |
| `./cli build-and-push <service> [version]` | Build and push to registry |

### Utility Commands

Kill all Docker containers:

```bash
docker rm -f $(docker ps -aq)
```

### Staying Updated

To get the latest changes from the repository:

1. **Save Your Local Changes** (if any):
   ```bash
   git stash
   ```

2. **Pull Latest Updates**:
   ```bash
   git pull
   ```

3. **Restore Your Local Changes** (if any):
   ```bash
   git stash pop
   ```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

[![LFX Active Contributors](https://insights.linuxfoundation.org/api/badge/active-contributors?project=lf-decentralized-trust-labs&repos=https://github.com/LF-Decentralized-Trust-labs/gitmesh)](https://insights.linuxfoundation.org/project/lf-decentralized-trust-labs/repository/lf-decentralized-trust-labs-gitmesh)

[![GitMesh CE Governance](https://github.com/LF-Decentralized-Trust-labs/gitmesh/actions/workflows/gov-sync.yml/badge.svg)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/actions/workflows/gov-sync.yml)

### Quick Contributing Steps

1. Fork the repository
2. Create a new branch: `git checkout -b type/branch-name`
3. Make your changes
4. Sign and commit your changes: `git commit -s -m 'Add some amazing feature'`
5. Push to the branch: `git push origin type/branch-name`
6. Submit a signed pull request

[![Complete Roadmap](https://img.shields.io/badge/View%20our-Roadmap-blue?style=for-the-badge&logo=github&logoColor=white)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/blob/main/ROADMAP.md)

Mesh & Meshy are excited to see what amazing contributions you'll bring to the GitMesh community!

---

## Our Maintainers

<table width="100%">
  <tr align="center">
    <td valign="top" width="33%">
      <a href="https://github.com/RAWx18" target="_blank">
        <img src="https://avatars.githubusercontent.com/RAWx18?s=150" width="120" alt="RAWx18"/><br/>
        <strong>RAWx18</strong>
      </a>
      <p>
        <a href="https://github.com/RAWx18" target="_blank">
          <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/>
        </a>
        <a href="https://www.linkedin.com/in/ryanmadhuwala" target="_blank">
          <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn"/>
        </a>
        <a href="mailto:the.ryan@gitmesh.dev">
          <img src="https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white" alt="Email"/>
        </a>
      </p>
    </td>
    <td valign="top" width="33%">
      <a href="https://github.com/parvm1102" target="_blank">
        <img src="https://avatars.githubusercontent.com/parvm1102?s=150" width="120" alt="parvm1102"/><br/>
        <strong>parvm1102</strong>
      </a>
      <p>
        <a href="https://github.com/parvm1102" target="_blank">
          <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/>
        </a>
        <a href="https://linkedin.com/in/mittal-parv" target="_blank">
          <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn"/>
        </a>
        <a href="mailto:mittal@gitmesh.dev">
          <img src="https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white" alt="Email"/>
        </a>
      </p>
    </td>
    <td valign="top" width="33%">
      <a href="https://github.com/Ronit-Raj9" target="_blank">
        <img src="https://avatars.githubusercontent.com/Ronit-Raj9?s=150" width="120" alt="Ronit-Raj9"/><br/>
        <strong>Ronit-Raj9</strong>
      </a>
      <p>
        <a href="https://github.com/Ronit-Raj9" target="_blank">
          <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub"/>
        </a>
        <a href="https://www.linkedin.com/in/ronitraj-ai" target="_blank">
          <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn"/>
        </a>
        <a href="mailto:ronii@gitmesh.dev">
          <img src="https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white" alt="Email"/>
        </a>
      </p>
    </td>
  </tr>
</table>

---

## Community & Support

<div align="center">

[![Join Discord](https://img.shields.io/badge/Join%20us%20on-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/xXvYkK3yEp)

### Support Channels

| Channel | Typical Response Time | Best For |
|---------|----------------------|----------|
| [Discord](https://discord.gg/xXvYkK3yEp) | Real-time | Quick questions, community discussions |
| [Email Support](mailto:gitmesh.oss@gmail.com) | 24–48 hours | Technical issues, detailed bug reports |
| [Twitter / X](https://x.com/gitmesh_oss) | Online | Tagging the project, general updates, public reports |
| [GitHub Issues](https://github.com/LF-Decentralized-Trust-labs/gitmesh/issues) | 1–3 days | Bug reports, feature requests, feedback |

</div>

---

## Project Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| **Total Commits** | ![Commits](https://img.shields.io/github/commit-activity/t/LF-Decentralized-Trust-labs/gitmesh) |
| **Pull Requests** | ![PRs](https://img.shields.io/github/issues-pr/LF-Decentralized-Trust-labs/gitmesh) |
| **Issues Resolved** | ![Issues](https://img.shields.io/github/issues-closed/LF-Decentralized-Trust-labs/gitmesh) |
| **Latest Release** | ![Release](https://img.shields.io/github/v/release/LF-Decentralized-Trust-labs/gitmesh) |

<br>

<a href="https://www.star-history.com/#LF-Decentralized-Trust-labs/gitmesh&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=LF-Decentralized-Trust-labs/gitmesh&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=LF-Decentralized-Trust-labs/gitmesh&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=LF-Decentralized-Trust-labs/gitmesh&type=Date" width="700" />
  </picture>
</a>

</div>

---

<div align="center">

<a href="https://www.lfdecentralizedtrust.org/">
  <img src="https://www.lfdecentralizedtrust.org/hubfs/LF%20Decentralized%20Trust/lfdt-horizontal-white.png" alt="Supported by the Linux Foundation Decentralized Trust" width="220"/>
</a>

**A Lab under the [Linux Foundation Decentralized Trust](https://www.lfdecentralizedtrust.org/)** – Advancing open source innovation.

</div>