# Project Progress Report: IDOR Proof-of-Concept

## 1. Current Project Status
We have successfully completed the core backend infrastructure for Phase 1 (Environment Setup & Vulnerable Implementation). The backend API is fully functional, containerized, and successfully demonstrates the underlying Insecure Direct Object Reference (IDOR) vulnerability.

## 2. Completed Milestones
* **Database & Infrastructure:** Configured and dockerized a MySQL database using Docker Compose, ensuring consistent deployment environments.
* **Backend API Development:** Built a Spring Boot REST API with `User` and `Document` entities (payloads), JPA repositories, and service layers.
* **Mock Data Initialization:** Automated the injection of mock users (Alice, Bob) and confidential documents (W2 forms, Bank Statements) into the database upon startup.
* **Vulnerability Verification:** Successfully tested the IDOR vulnerability using raw API calls. 
  * *Legitimate Access:* Verified `GET /api/documents/user/1` returns only Alice's files (IDs 101, 102).
  * *Vulnerability Proof:* Demonstrated that calling `GET /api/documents/103` blindly returns Bob's highly sensitive bank statement without verifying if the requester is authorized to view it.

## 3. Challenges Faced
* **Infrastructure Synchronization:** Encountered issues with Docker volume caching retaining stale database credentials, and Spring Boot attempting to inject SQL data before Hibernate initialized the schemas. Resolved by deferring JPA initialization and rebuilding Docker volumes.
* **Data Serialization:** The current API responses expose sensitive entity data (e.g., hashed passwords and `hibernateLazyInitializer` metadata), which requires Data Transfer Objects (DTOs) implementation to clean up the JSON output.

## 4. Remaining Work & Next Steps
With the foundational backend and vulnerability logic established, our remaining work shifts towards the frontend, attack automation, and architectural cleanup:
* **Frontend Development:** Develop the React-based User Interface (Container A) to provide a visual portal for users to log in and view records natively.
* **Authentication Gateway:** Implement JWT (JSON Web Tokens) to strictly track the "logged-in" user, proving that the API authenticates users but fails to *authorize* object access.
* **Automated Attack Script:** Write the Python script (Container D) to systematically brute-force document IDs and scrape data, simulating a real-world attacker.
* **Defense Implementation (Phase 3):** After the attack demo is finalized, we will implement the authorization matrix and migrate sequential IDs to UUIDs.
* **Refinement:** Polish the codebase, implement DTOs to hide backend structural data, and finalize inter-container networking.