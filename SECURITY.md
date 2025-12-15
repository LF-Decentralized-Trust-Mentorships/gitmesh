# Security Policy

## Overview

The security of GitMesh users and contributors is a core priority for the GitMesh community, the Lab Leader, and Alveoli. This document explains how to report vulnerabilities, how we handle security issues, and what you can expect in terms of disclosure and response.

This policy covers:

* **GitMesh Community Edition (CE)** – licensed under the Apache License 2.0
* **GitMesh Enterprise Edition (EE)** – proprietary software owned by **Alveoli**

Unless explicitly stated otherwise, “GitMesh” in this document refers to the specific edition involved (CE or EE) in a security report.

---

## Supported Components

Security fixes are generally provided for:

* The latest stable release of **GitMesh Community Edition (CE)**
* Actively maintained and currently supported releases of **GitMesh Enterprise Edition (EE)**

Older or unmaintained releases may not receive security patches. Users are strongly encouraged to keep their deployments up to date with the latest supported versions.

---

## Reporting a Vulnerability

### For GitMesh Community Edition (CE)

If you discover or suspect a security vulnerability in **GitMesh CE**, do **not** create a public issue or share details in public channels.

Instead, report it privately to:

* **Primary Security Contact – Lab Leader (for CE)**
  **Name:** Ryan Madhuwala
  **Email:** `rawx18.dev@gmail.com`

If a CE issue requires further escalation (for example, it impacts LFDT infrastructure or policies, or involves broader governance concerns), it may be escalated to:

* **Linux Foundation Decentralized Trust (LFDT)** – escalation for **CE-related** issues only
  **Email:** `support@lfdecentralizedtrust.org`

### For GitMesh Enterprise Edition (EE)

If you discover or suspect a security vulnerability in **GitMesh EE**, do **not** report it to the Lab Leader or LFDT.

Instead, report EE issues directly and only to:

* **CTO of Alveoli – Security Contact for EE**
  **Name:** Ronit Raj
  **Email:** `ronitk964@gmail.com`

EE issues are handled solely through Alveoli’s internal security and engineering processes.

---

## Information to Include in a Report

Whether reporting CE or EE issues, please include, where possible:

* A clear description of the issue and its potential impact
* Whether the issue affects **CE** or **EE**, and the relevant version(s)
* Steps to reproduce the issue, including any important configuration details
* Any proof-of-concept or test case you are comfortable sharing privately
* Your contact information so we can follow up with questions if needed

Avoid sending live secrets (such as real private keys or production credentials). If encrypted communication is needed, mention this in your initial email and a secure method can be arranged.

---

## Responsible Disclosure

We ask all reporters to follow responsible disclosure principles:

* Report vulnerabilities **privately and confidentially** through the appropriate channel (CE → Lab Leader / LFDT; EE → Alveoli CTO).
* Allow the relevant team (GitMesh CE maintainers or Alveoli for EE) a reasonable period to investigate, fix, and coordinate disclosures.
* Do not intentionally exploit the vulnerability beyond what is necessary to confirm its existence.
* Do not access, modify, or destroy data that does not belong to you.
* Avoid impacting other users, systems, or environments when testing.

We are committed to working with security researchers and community members who act in good faith to make GitMesh safer.

---

## What to Expect After Reporting

### For CE Reports

When you report a potential vulnerability in GitMesh CE to the Lab Leader, we will make a best effort to:

1. **Acknowledge your report** within a reasonable time.
2. **Triage and assess the issue**, including:

   * Confirming the vulnerability
   * Evaluating its severity and impact
   * Identifying affected components and versions
3. **Develop and test a fix or mitigation** for supported CE versions.
4. **Coordinate a release or remediation**, including updates, configuration guidance, or workarounds.
5. **Inform you of the outcome**, such as:

   * Whether the report is confirmed
   * Which versions are affected
   * High-level remediation steps and intended disclosure approach

If escalation is needed (for example, for broader LFDT concerns), CE issues may be shared with LFDT at `support@lfdecentralizedtrust.org`.

### For EE Reports

When you report a potential vulnerability in GitMesh EE to the CTO of Alveoli, it will be handled through Alveoli’s internal security and product processes. This includes triage, validation, remediation, and any appropriate communication to GitMesh EE operators or customers, managed exclusively by Alveoli.

While specific timelines cannot be guaranteed, all reports are taken seriously and handled in good faith.

---

## Public Security Advisories

### Community Edition (CE)

When a security issue in CE has user-visible impact, the project may publish a public security advisory. Such advisories typically include:

* A short description of the vulnerability
* Affected CE version(s)
* Impact and severity
* Remediation and upgrade instructions
* Credits to the reporter, if they wish to be acknowledged

Advisories for CE may appear in:

* The GitMesh CE GitHub repository (e.g., security advisories, releases, or documentation)
* Public project communication channels

### Enterprise Edition (EE)

For EE, advisories, mitigations, and update information are handled by Alveoli and may be communicated through channels chosen by Alveoli (for example, directly to EE operators or customers). EE issues are not managed or disclosed through CE project channels or LFDT channels unless explicitly stated by Alveoli.

---

## Scope and Out-of-Scope Issues

The following categories are generally **in scope**, when related to GitMesh CE or EE:

* Remote code execution, privilege escalation, or authentication/authorization bypass
* Data exposure or leakage due to GitMesh behavior or insecure defaults
* Security flaws in APIs, protocols, or configurations provided by GitMesh
* Denial of Service vulnerabilities caused directly by GitMesh logic or configuration defaults

The following categories are generally **out of scope**:

* Issues solely in third-party components, unless GitMesh ships a vulnerable version by default
* Social engineering attacks on maintainers, contributors, or users
* Physical security problems
* Issues that assume prior full compromise of the host, environment, or infrastructure
* Non-security bugs, such as general correctness issues, performance problems, or UI glitches

Out-of-scope issues can still be useful as **regular bug reports** (for CE, via GitHub issues; for EE, via Alveoli).

---

## GitMesh CE and GitMesh EE

### GitMesh Community Edition (CE)

GitMesh CE is:

* Licensed under the **Apache License 2.0**
* Free to use, modify, and distribute under the terms of that license
* Intended for open collaboration and innovation aligned with the Linux Foundation Decentralized Trust mission

Security issues for CE must be reported to the **Lab Leader**, and, if necessary, may be escalated to LFDT:

* **CE Security Contact – Lab Leader**: `rawx18.dev@gmail.com`
* **CE Escalation – LFDT**: `support@lfdecentralizedtrust.org`

### GitMesh Enterprise Edition (EE)

GitMesh EE is:

* Proprietary software owned by **Alveoli**
* Not open source and not licensed under Apache License 2.0
* Governed by terms defined by Alveoli for the use of EE

All EE security issues must be reported **only** to the **CTO of Alveoli**:

* **EE Security Contact – CTO of Alveoli**: `ronitk964@gmail.com`

No rights to inspect, modify, or redistribute GitMesh EE are granted beyond those explicitly permitted by Alveoli. All rights, title, and interest in GitMesh EE, including all intellectual property rights, remain solely with Alveoli.

If any GitMesh EE code is ever inadvertently included in or distributed with GitMesh CE, that code remains the exclusive proprietary property of Alveoli. It must not be used, executed, copied, modified, incorporated, or redistributed for any reason. Any such discovery should be reported immediately:

* For CE repositories or artifacts: to the **Lab Leader** (`rawx18.dev@gmail.com`)
* For EE code concerns: to the **CTO of Alveoli** (`ronitk964@gmail.com`)

All recipients must remove the affected material from all systems, repositories, forks, mirrors, backups, and distributions upon discovery. The accidental presence of Enterprise Edition code in any CE repository or distribution does not grant any license or permission to use it in any way.

---

## Third-Party Dependencies

GitMesh depends on a variety of third-party libraries, tools, and services, each governed by their own licenses and security practices.

When a vulnerability is identified in a third-party dependency:

* We assess its impact on GitMesh CE and/or EE.
* Where appropriate, we update the dependency, modify configuration, or implement mitigations.
* If the impact on GitMesh users is significant, we may provide guidance or advisories (for CE via project channels; for EE via Alveoli).

Users should keep GitMesh, underlying operating systems, and related infrastructure up to date.

---

## Contact and Project Links

* **GitMesh CE Security – Lab Leader (Ryan Madhuwala)**
  `rawx18.dev@gmail.com`

* **GitMesh EE Security – CTO of Alveoli (Ronit Raj)**
  `ronitk964@gmail.com`

* **LFDT (Escalation for CE only)**
  `support@lfdecentralizedtrust.org`

* **GitMesh Community Edition Repository**
  [https://github.com/LF-Decentralized-Trust-Mentorships/gitmesh](https://github.com/LF-Decentralized-Trust-Mentorships/gitmesh)

* **Linux Foundation Decentralized Trust**
  [https://www.lfdecentralizedtrust.org](https://www.lfdecentralizedtrust.org)

If you are unsure whether an issue is related to CE or EE, or how best to report it, you are encouraged to contact the appropriate security contact above and briefly describe your setup and edition.

---

*Thank you for helping keep GitMesh and its community secure.*
