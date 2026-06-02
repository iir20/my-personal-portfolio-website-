# 🌐 ISMAIL IBNE RATUL — CYBERSPACE DIGITAL PORTFOLIO OS
> **[DEVOPS MODULE COMPILING...] STATUS: PRODUCTION MODE ACTIVATED**

[![Automated Build & Deploy Status](https://img.shields.io/github/actions/workflow/status/ismail-ibne-ratul/portfolio/deploy.yml?branch=main&style=flat-square&color=emerald&label=CI/CD%20BUILD)](https://github.com/im-ismail-ibne-ratul/portfolio/actions)
[![Firebase Cloud Host Synchronizer](https://img.shields.io/github/actions/workflow/status/ismail-ibne-ratul/portfolio/firebase-hosting.yml?branch=main&style=flat-square&color=00cfc8&label=FIREBASE%20HOST)](https://github.com/im-ismail-ibne-ratul/portfolio/actions)
[![Security Scan Integrity Audit](https://img.shields.io/github/actions/workflow/status/ismail-ibne-ratul/portfolio/security-scan.yml?branch=main&style=flat-square&color=f43f5e&label=FIREWALL%20IPX)](https://github.com/im-ismail-ibne-ratul/portfolio/actions)
[![Lighthouse Audit Asserts](https://img.shields.io/badge/Lighthouse_Assets-98%20%7C%20100%20%7C%20100%20%7C%20100-emerald?style=flat-square&logo=lighthouse)](https://github.com/im-ismail-ibne-ratul/portfolio/actions)
[![MIME Security Checked](https://img.shields.io/badge/PDF_Envelopes-MIME_ONLY-orange?style=flat-square)](https://github.com/im-ismail-ibne-ratul/portfolio)

---

## 🛠️ THE SYSTEM ARCHITECTURE

Welcome to the fully automated, production-grade cloud deployment ecosystem of the **Ismail Ibne Ratul Cyberpunk Digital Operating System Portfolio**. This repository is configured to deploy client-side assets and cloud-managed Firestore databases seamlessly with automatic cache purges, SEO optimizations, and secure administrative modules.

```
       [ LOCAL HOST ] ---------> PUSH TO MAIN ---------> [ GITHUB ACTIONS ]
                                                                 |
            +------------------------+---------------------------+------------------------+
            |                        |                           |                        |
     [ lint & test ]        [ security-scan.yml ]    [ lighthouse-audit.yml ]       [ deploy.yml ]
     (tsc, eslint)          (MIME, dependencies)     (performance score audits)    (Docker compile)
            |                        |                           |                        |
            V                        V                           V                        V
   [ CI/CD VERIFIED ]       [ SECURITY SANITIZED ]     [ METRICS ASSERTED ]      [ NEW DEPLOY LIVE ]
                                                                                          |
                                      +---------------------------------------------------+
                                      |
                                      V
                        [ FIREBASE HOSTING SYNCS CDN ]
```

---

## 📂 PROFESSIONAL CI/CD AUTOMATION WORKFLOWS

Inside `.github/workflows/`, five interconnected pipeline engines manage compilation, security scans, and deployment:

| Pipeline Engine | Workflow Descriptor | Trigger Event | Operational Output |
| :--- | :--- | :--- | :--- |
| **`deploy.yml`** | Production build & self-host deployer | Push to `main`/`master` | Builds bundle using Vite/Esbuild, runs linters, and compiles a containerized image standardizing configurations. |
| **`firebase-hosting.yml`** | Cloud sync & CDN Purge system | Push to `main`/`master` | Deploys optimized static bundle directly into Firebase Hosting, activating Brotli compression. |
| **`security-scan.yml`** | Vulnerability scanning and SAST sanitization | Push and Pull Requests | Scans packages for CVE dependencies and validates strict schema invariants. |
| **`lighthouse-audit.yml`** | Performance metrics audit | Push to all branches | Evaluates and asserts Lighthouse scores to guarantee instant load times matching high-fidelity UI benchmarks. |
| **`release.yml`** | Packaging tag manager | Tag pushes (`v*`) | Compiles and packages dynamic source files into self-contained zip assets. |

---

## 🔒 SYSTEM SECRETS CONSTELLATIONS

To establish automated deployment integration, configure these secrets within your GitHub repository under **Settings > Secrets and Variables > Actions > Repository secrets:**

1. `FIREBASE_SERVICE_ACCOUNT_IBNE_RATUL_CYBER`
   - **Type**: Base64 JSON Service Account Token.
   - **Description**: Authorized credential to connect actions directly to your Firebase Hosting instances.
   - **Generation**: Created from GCP Service Accounts console with the `Firebase Hosting Admin` role.
2. `GCP_PROJECT_ID`
   - **Type**: ASCII String.
   - **Description**: The Identifier ID of your GCP Cloud project (defaults gracefully to `ismail-ibne-ratul` if unset).
3. `GITHUB_TOKEN`
   - **Type**: Automatic token (provided by GitHub at runtime).
   - **Description**: Standard repository checkout token used for static assets publishing.

---

## 🧠 ADMINISTRATIVE GATEWAY & CV STORAGE INTEGRATION

The portal is augmented with an advanced **ADMIN DECK** featuring high-integrity cloud storage capabilities:

* **Dynamic CV Upload System**: Supports strict MIME security validation (`application/pdf`) and files limit rules cap of 5.0 MB to safeguard core operations.
* **Animated Cyber Terminal**: Watch live streaming progress holograms and telemetry bars compiling binary packets directly into persistent Firestore clusters.
* **Rollback Backup Nodes**: Tracks a localized history roster of up to 5 historical CV revisions with easy rollback support.
* **Automated Client Sync**: After uploading, every `Download CV` anchor across coordinates updates instantly with real-time PDF version metrics.

---

## ⚡ SECURITY ENFORCEMENTS & COGNITIVE CONTROLS

The platform operates under Zero-Trust constraints defined within `security_spec.md` and `firestore.rules`:
- **CSP & Strict Protection**: Secured with custom HTTP headers preventing Frame isolation and scripting injection scripts.
- **Intrusion Tracker Simulator**: Displays a real-time reactive streaming activity dashboard tracking spoofed payloads, unmapped trajectories, and blocked SQLi probes.
- **Emergency Interlock System**: Toggle core operations into Maintenance and Locked Modes immediately from the Admin Deck to block and shield connections of the portfolio system.

---

```
[DEVOPS OPERATIONAL LOG]: ALL CORES BALANCED. DIGITAL HEADQUARTERS IS LIVE.
```
