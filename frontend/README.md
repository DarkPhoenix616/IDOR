# SecureVault — IDOR Vulnerability Proof of Concept Lab

This project demonstrates a complete, real-world exploitation and mitigation of an **Insecure Direct Object Reference (IDOR)** vulnerability (OWASP Top 10 A01 — Broken Access Control). 

It is designed as a multi-tier web application where authenticated users manage confidential documents. The proof of concept showcases how an attacker can horizontally escalate privileges by manipulating API endpoints to extract unauthorized data, followed by implementing robust architectural defenses to secure the endpoints.

## 🚀 Lab Phases

The project is executed in three distinct phases:

### Phase 1: Vulnerable Environment
- Development of a Spring Boot backend API with endpoints (e.g., `GET /api/documents/<id>`).
- Authentication is handled via JWT, but the backend intentionally lacks object-level authorization checks.
- A React-based frontend simulates a corporate portal where users log in and view their private records.

### Phase 2: Attack Execution & Demonstration
- Access the **Attacker Console** via the frontend UI.
- The attacker utilizes their own valid, low-level JWT to bypass initial gateway authentication.
- An automated polling script targets the predictable, sequential document IDs (`1`, `2`, `3`, etc.).
- Because the backend blindly trusts the requested parameter without verifying ownership, the attacker successfully enumerates and completely exfiltrates the confidential documents belonging to all other users.

### Phase 3: Defense & Mitigation
- **Code-Level Patch (Authorization Matrix):** The backend API is patched so that the middleware accurately validates that `currentUser.id == requested_document.owner_id`.
- **Architectural Patch (UUIDs):** Migrating the database schemas to utilize non-guessable, cryptographically random Universally Unique Identifiers (UUIDs) makes enumeration computationally infeasible.
- When toggling the frontend to **Mitigated Mode**, the attack script is successfully blocked with absolute `403 Forbidden` responses.

## 🛠️ Technology Stack
* **Frontend UI:** React + Vite (Vanilla CSS)
* **Backend API:** Java Spring Boot
* **Database:** Relational Database with mock data

## 💻 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/shlok3640/cybersec-project-frontend.git
   cd cybersec-project-frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the lab locally by navigating your browser to: `http://localhost:5173`

## 🛡️ Educational Disclaimer
**⚠ Warning**: This application is intentionally vulnerable to demonstrate the mechanics of IDOR exploits for academic and educational purposes. **All user accounts and credentials are mock demo data.** Do not reuse passwords from this lab anywhere else.
