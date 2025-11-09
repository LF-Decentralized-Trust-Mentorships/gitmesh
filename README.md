<div align="center">

<picture>
   <source srcset="public/logo/light_logo.png" media="(prefers-color-scheme: dark)">
   <img src="public/logo/dark_logo.png" alt="GitMesh Logo" width="250">
</picture>

**AI-powered Git collaboration network for OSS**

[![OpenSource License](https://img.shields.io/badge/License-Apache%20License-orange.svg?style=for-the-badge)](LICENSE.md)
[![Contributors](https://img.shields.io/github/contributors/LF-Decentralized-Trust-labs/gitmesh.svg?style=for-the-badge&logo=git)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/graphs/contributors)
[![Alpha Release](https://img.shields.io/badge/Status-Alpha%20Version-yellow.svg?style=for-the-badge)](#)
[![Join Weekly Dev Call](https://img.shields.io/badge/Join%20Weekly%20Dev%20Call-Zoom-blue.svg?style=for-the-badge&logo=zoom)](https://zoom-lfx.platform.linuxfoundation.org/meeting/96608771523?password=211b9c60-b73a-4545-8913-75ef933f9365)
[![Join Discord](https://img.shields.io/badge/Join%20us%20on-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/xXvYkK3yEp)
[![OpenSSF Best Practices](https://img.shields.io/badge/OpenSSF-Silver%20Best%20Practices-silver.svg?style=for-the-badge&logo=opensourceinitiative)](https://www.bestpractices.dev/projects/10972)


*Code with purpose, Integrate with confidence*

[![Documentation](https://img.shields.io/badge/Documentation-000000?style=flat&logo=readthedocs)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/README.md) 
[![Join Community](https://img.shields.io/badge/Join_Community-000000?style=flat&logo=discord)](https://discord.gg/xXvYkK3yEp)
[![OSS Website](https://img.shields.io/badge/OSS_Website-000000?style=flat&logo=vercel)](https://www.gitmesh.dev) 
[![Join Waitlist](https://img.shields.io/badge/Join_Waitlist-000000?style=flat&logo=mailchimp)](https://www.alveoli.app)

</div>

---

## </> What is GitMesh?

<div align="center">
   <a href="https://youtu.be/j5ZdorkZVgU" target="_blank">
      <img src="https://img.youtube.com/vi/j5ZdorkZVgU/maxresdefault.jpg" alt="Watch the video" width="350" style="max-width:100%; border-radius:8px;"/>
   </a>
   <br>
   <sub><em>Click the video above to watch demo!</em></sub>
   <br></br>
</div>

**GitMesh** is a Git collaboration network designed to solve open source's biggest challenge: contributor dropout. Our AI-powered platform provides real-time branch-level insights, intelligent contributor-task matching, and automated workflows. It transforms complex codebases into clear, guided contribution journeys—fueling engagement with gamified rewards, bounties, and integration with popular open source support programs.

Our mascot (Meshy/Mesh Wolf) reflects GitMesh's core: agile, resilient, and unstoppable together. Like a pack, we thrive on teamwork — efficient, and powerful in unison.

---

## </> Meet us at

<div align="center">
   <table>
      <tr>
         <td align="center">
            <img src="public/os_japan.avif" alt="Coming Soon" width="300" style="max-width:100%; border-radius:8px; opacity:0.7;"/>
            <br>
            <sub><em>OpenSource Summit Japan • 8-10 Dec 2025</em></sub>
         </td>
         <td align="center">
            <img src="public/os_korea.avif" alt="Coming Soon" width="300" style="max-width:100%; border-radius:8px; opacity:0.7;"/>
            <br>
            <sub><em>OpenSource Summit Korea • 4-5 Nov 2025</em></sub>
         </td>
      </tr>
      <tr>
         <td align="center">
         <a href="https://events.linuxfoundation.org/opensearchcon-korea/">
          <img src="public/OpenSearchCon_Korea.jpg" alt="Coming Soon" width="300" style="max-width:100%; border-radius:8px; opacity:0.7;"/>
            <br>
            <sub><em>OpenSearchCon Korea • 4 Nov 2025</em></sub>
         <a/> 
         </td>
         <td align="center">
         <a href="https://events.linuxfoundation.org/openssf-community-day-korea/ ">
          <img src="public/OpenSSFCommunityDay_Korea.jpg" alt="Coming Soon" width="300" style="max-width:100%; border-radius:8px; opacity:0.7;"/>
            <br>
            <sub><em>OpenSSF Community Day Korea • 4 Nov 2025</em></sub>
         <a/> 
         </td>
      </tr>
   </table>
</div>

---

## </> Installation

<div align="center">
<picture>
   <source srcset="public/mascott/meshy.png" media="(prefers-color-scheme: dark)">
   <img src="public/mascott/mesh.png" alt="GitMesh Mascot" width="250">
</picture>
</div>

### 👾 Prerequisites

Node.js is required to run the application.

1. Visit the [Node.js Download Page](https://nodejs.org/en/download/)
2. Download the "LTS" (Long Term Support) version for your operating system
3. Run the installer, accepting the default settings
4. Verify Node.js is properly installed:
   - **For Windows Users**:
     1. Press `Windows + R`
     2. Type "sysdm.cpl" and press Enter
     3. Go to "Advanced" tab → "Environment Variables"
     4. Check if `Node.js` appears in the "Path" variable
   - **For Mac/Linux Users**:
     1. Open Terminal
     2. Type this command:
        ```bash
        echo $PATH
        ```
     3. Look for `/usr/local/bin` in the output
5. Install Package Manager (pnpm)
   ```bash
   npm install -g pnpm
   ```
6. Install Git: [Download Git](https://git-scm.com/downloads)

### 👾 Quick Start

Choose one of the following methods to get started with GitMesh:

#### Setup Using Git (For Developers)

This method is recommended for developers who want to:
* Stay updated with the latest changes
* Switch between different versions
* Create custom modifications

**Initial Setup**:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/LF-Decentralized-Trust-labs/gitmesh.git
   ```

2. **Navigate to Project Directory**:

   ```bash
   cd gitmesh
   ```

3. **Install Dependencies**:

   ```bash
   pnpm install
   ```

4. **Start the Development Server**:
   ```bash
   pnpm run dev
   ```
5. **Configure Github PAT**:
If you’re running the project for the first time, you’ll need to configure your GitHub Personal Access Token (PAT) to authenticate and connect GitMesh to your GitHub account.

Steps to Generate and Configure PAT
1. Start the GitMesh server and open the provided localhost link.

You’ll be prompted to enter your Personal Access Token.

2. To generate a new token:

- Go to GitHub → Settings → Developer settings → Personal Access Tokens → Tokens (classic)
- Click Generate new token → Generate new token (classic)
- Select the required scopes (typically: repo, user, read:org)
- Click Generate Token
- Copy the generated token (you’ll only see it once)

3. Paste the token into the prompt on localhost when asked.

You can configure GitHub, GitLab, or both in a similar way — just make sure to use the correct platform’s token.
<br>
Tip: Keep your PAT secure. Never share or commit it in any file or codebase.

**Staying Updated**:

To get the latest changes from the repository:

1. **Save Your Local Changes** (if any):

   ```bash
   git stash
   ```

2. **Pull Latest Updates**:

   ```bash
   git pull 
   ```

3. **Update Dependencies**:

   ```bash
   pnpm install
   ```

4. **Restore Your Local Changes** (if any):
   ```bash
   git stash pop
   ```

#### Setup Using Docker

This method is recommended for users who want to:
* Run GitMesh in a containerized environment
* Isolate dependencies from the host system
* Deploy easily in production environments

**Prerequisites**:
- Docker must be installed on your system. [Download Docker](https://www.docker.com/get-started)

**Building Docker Images**:

1. **Build Production Image**:
   ```bash
   pnpm run dockerbuild:prod
   ```
   This creates a production-ready Docker image tagged as `gitmesh-ai:production` and `gitmesh-ai:latest`.

2. **Build Development Image**:
   ```bash
   pnpm run dockerbuild
   ```
   This creates a development Docker image tagged as `gitmesh-ai:development` and `gitmesh-ai:latest`.

**Running Docker Containers**:

1. **Run the Production Container**:
   ```bash
   pnpm run dockerrun
   ```
   This runs the Docker container with:
   - Container name: `gitmesh-ai-live`
   - Port mapping: `5173:5173`
   - Environment variables from `.env.local` file

   **Note**: Make sure you have a `.env.local` file in your project root with the required environment variables before running this command.

2. **Direct Docker Run Command** (Alternative):
   ```bash
   docker run -it -d --name gitmesh-ai-live -p 5173:5173 --env-file .env.local gitmesh-ai
   ```

**Building and Running in One Step**:

For production:
```bash
pnpm run dockerbuild:prod && pnpm run dockerrun
```

For development:
```bash
pnpm run dockerbuild && docker run -it -d --name gitmesh-ai-dev -p 5173:5173 --env-file .env.local gitmesh-ai:development
```

**Important Notes**:
- Ensure you have a `.env.local` file with all required environment variables
- The container exposes the application on port `5173` by default
- To stop the running container: `docker stop gitmesh-ai-live`
- To remove the container: `docker rm gitmesh-ai-live`
- To remove the image: `docker rmi gitmesh-ai`

### 👾 Troubleshooting

#### Git Setup Issues

If you encounter issues:

1. **Clean Installation**:

   ```bash
   # Remove node modules and lock files
   rm -rf node_modules pnpm-lock.yaml

   # Clear pnpm cache
   pnpm store prune

   # Reinstall dependencies
   pnpm install
   ```

2. **Reset Local Changes**:
   ```bash
   # Discard all local changes
   git reset --hard origin/main
   ```

Remember to always commit your local changes or stash them before pulling updates to avoid conflicts.

---

## </> Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

[![LFX Active Contributors](https://insights.linuxfoundation.org/api/badge/active-contributors?project=lf-decentralized-trust-labs&repos=https://github.com/LF-Decentralized-Trust-labs/gitmesh)](https://insights.linuxfoundation.org/project/lf-decentralized-trust-labs/repository/lf-decentralized-trust-labs-gitmesh)

### 👾 Quick Contributing Steps:
1. Fork the repository
2. Create a new branch  
  ```bash
  git checkout -b type/branch-name
  ```
3. Make your changes
4. Sign Commit your changes (`git commit -s -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin type/branch-name`)
6. Submit a signed pull request

[![Complete Roadmap](https://img.shields.io/badge/View%20our-Roadmap-blue?style=for-the-badge&logo=github&logoColor=white)](https://github.com/LF-Decentralized-Trust-labs/gitmesh/blob/main/ROADMAP.md)

Mesh & Meshy are excited to see what amazing contributions you'll bring to the GitMesh community!

---

## </> Our Maintainers

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

## </> Community & Support

<div align="center">

[![Join Discord](https://img.shields.io/badge/Join%20us%20on-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/xXvYkK3yEp)

### 👾 **Support Channels**

| Channel                                                         | Typical Response Time | Best For                                             |
| --------------------------------------------------------------- | --------------------- | ---------------------------------------------------- |
| [Discord](https://discord.gg/xXvYkK3yEp)                     | Real-time             | Quick questions, community discussions               |
| [Email Support](mailto:gitmesh.oss@gmail.com)                 | 24–48 hours           | Technical issues, detailed bug reports               |
| [Twitter / X](https://x.com/gitmesh_oss)                      | Online                | Tagging the project, general updates, public reports |
| [GitHub Issues](https://github.com/LF-Decentralized-Trust-labs/gitmesh/issues) | 1–3 days              | Bug reports, feature requests, feedback              |

</div>

---

## </> Project Statistics

<div align="center">

| Metric | Value |
|--------|-------|
| **Total Commits** | ![Commits](https://img.shields.io/github/commit-activity/t/LF-Decentralized-Trust-labs/gitmesh) |
| **Pull Requests** | ![PRs](https://img.shields.io/github/issues-pr/LF-Decentralized-Trust-labs/gitmesh) |
| **Issues Resolved** | ![Issues](https://img.shields.io/github/issues-closed/LF-Decentralized-Trust-labs/gitmesh) |
| **Latest Release** | ![Release](https://img.shields.io/github/v/release/LF-Decentralized-Trust-labs/gitmesh) |

</div>

<br></br>

<div align="center">
  <a href="https://www.star-history.com/#LF-Decentralized-Trust-labs/gitmesh&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=LF-Decentralized-Trust-labs/gitmesh&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=LF-Decentralized-Trust-labs/gitmesh&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=LF-Decentralized-Trust-labs/gitmesh&type=Date" width="700" />
  </picture>
</a>
</div>

---

<br></br>
<a href="https://www.lfdecentralizedtrust.org/">
  <img src="https://www.lfdecentralizedtrust.org/hubfs/LF%20Decentralized%20Trust/lfdt-horizontal-white.png" alt="Supported by the Linux Foundation Decentralized Trust" width="220"/>
</a>

**A Lab under the [Linux Foundation Decentralized Trust](https://www.lfdecentralizedtrust.org/)** – Advancing open source innovation.
