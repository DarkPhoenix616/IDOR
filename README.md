# IDOR Vulnerability Proof-of-Concept

## 👥 Project Team

1. Shlok Kanani (B23CS1068)
2. Prakhar Goyal (B23CS1106)
3. Raditya Saraf (B23CS1107)
4. Danie George John (B23ES1012)
5. Bhawani Shankar Prajapat (B23CS1104)


## 📋 Project Overview

This is a **complete, real-world demonstration** of an **Insecure Direct Object Reference (IDOR)** vulnerability in a multi-tier web application. The project showcases:

- ✅ **Vulnerable Backend API** with sequential document IDs and missing authorization checks
- ✅ **Automated Python Attack Script** that exploits the IDOR vulnerability
- ✅ **React Frontend UI** for user authentication and document management
- ✅ **Local MySQL Database** with persistent data storage (UPDATE mode)
- ✅ **JWT Authentication** system with proper token generation
- ✅ **Attack Simulation** demonstrating unauthorized access to 150+ documents across multiple users

---

## 🎯 Project Goals & Status

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1** | Environment Setup & Vulnerable Implementation | ✅ COMPLETE |
| **Phase 2** | Attack Execution & Vulnerability Demonstration | ✅ COMPLETE |
| **Phase 3** | Defense Implementation & Mitigation | ✅ COMPLETE |

---

## 📁 Project Structure

```
Cybersec Project/
├── backend/                              # Spring Boot REST API
│   ├── src/main/java/com/idor/project/
│   │   ├── controller/
│   │   │   ├── AuthController.java      # User registration & login
│   │   │   └── DocumentController.java  # Document CRUD endpoints
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   └── DocumentService.java
│   │   ├── security/
│   │   │   └── JwtTokenProvider.java    # JWT token generation & validation
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   └── Document.java
│   │   └── repository/
│   │       ├── UserRepository.java
│   │       └── DocumentRepository.java
│   ├── src/main/resources/
│   │   ├── application.properties         # Local MySQL configuration
│   │   ├── application-prod.properties    # Production Azure configuration
│   │   └── data.sql                       # Initial database setup
│   ├── pom.xml                            # Maven dependencies
│   └── startup.sh                         # Azure deployment script
├── frontend/                              # React.js UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── DocumentModal.jsx
│   │   │   └── LoginForm.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DocumentsPage.jsx
│   │   │   ├── AttackPage.jsx
│   │   │   ├── OverviewPage.jsx
│   │   │   └── MitigationsPage.jsx
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── data_populator.py                      # Test data generation script
├── attack_script.py                       # IDOR exploitation script
├── ATTACK_GUIDE.md                        # Detailed attack instructions
└── README.md                              # This file
```

---

## 🛠️ Prerequisites

### Backend Requirements
- **Java 17** or higher
- **Maven 3.8.9** or higher
- **MySQL 8.0** (local or remote)

### Frontend Requirements
- **Node.js 18+** or higher
- **npm 9+** or higher

### Attack Scripts
- **Python 3.8+**
- **requests library** (`pip install requests`)

---

## 🚀 Quick Start

### 1️⃣ Setup Local MySQL Database

```bash
# Connect to MySQL (use your root credentials)
mysql -u root -p

# Create database
CREATE DATABASE idor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON idor_db.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

**MySQL Workbench Connection Details:**
- **Hostname:** localhost
- **Port:** 3307
- **Username:** myuser
- **Password:** secret
- **Database:** idor_db

---

### 2️⃣ Run Backend API

```bash
# Navigate to backend directory
cd /Users/daniegeorgejohn/Desktop/Cybersec\ Project/backend

# Build the project
./mvnw clean package -DskipTests

# Run the application
./mvnw spring-boot:run
```

**Backend will be available at:**
```
http://localhost:8080
```

**API Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/documents/create` - Create a new document
- `GET /api/documents/{id}` - Get document by ID (VULNERABLE)
- `GET /api/documents/user/{userId}` - Get user's documents

---

### 3️⃣ Run Frontend UI

```bash
# Navigate to frontend directory
cd /Users/daniegeorgejohn/Desktop/Cybersec\ Project/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at:**
```
http://localhost:5173
```

---

### 4️⃣ Populate Database with Test Data

```bash
# Navigate to project root
cd /Users/daniegeorgejohn/Desktop/Cybersec\ Project/

# Install Python dependencies
pip3 install requests

# Run data populator (creates 10 users with 15 documents each = 150 total)
python3 data_populator.py -u http://localhost:8080 --users 10 --docs 15
```

---

### 5️⃣ Execute IDOR Attack

```bash
# Run attack script with comprehensive reporting
python3 attack_script.py \
  -u http://localhost:8080 \
  --register-email attacker@example.com \
  --register-pass AttackerPass123! \
  --start-id 1 \
  --end-id 200 \
  --output-log attack_results.txt \
  --export-json discovered_documents.json
```

**Expected Results:**
- ✅ 140+ documents successfully accessed
- ✅ Documents from all 10 users compromised
- ✅ Unauthorized access confirmed
- ✅ Detailed attack report generated

---

## 📊 API Documentation

### Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "userId": 2,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "userId": 2,
  "email": "user@example.com",
  "type": "Bearer"
}
```

### Document Endpoints

#### Create Document
```bash
curl -X POST http://localhost:8080/api/documents/create \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Document",
    "content": "Sensitive information here"
  }'
```

#### Get Document by ID (VULNERABLE - IDOR)
```bash
curl -X GET http://localhost:8080/api/documents/1 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

#### Get User's Documents
```bash
curl -X GET http://localhost:8080/api/documents/user/2 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

---

## 🔓 IDOR Vulnerability Details

### Vulnerability Type
**Insecure Direct Object Reference (IDOR)**

### Location
`DocumentController.getDocument()` - `GET /api/documents/{id}`

### Root Cause
The API endpoint returns any document matching the requested ID without verifying if the authenticated user owns that document.

### Impact
- Unauthorized access to sensitive documents
- Data breach across all users
- Privacy violation

### Proof of Concept
1. User A authenticates and gets JWT token
2. User A calls `GET /api/documents/50` (a document belonging to User B)
3. API blindly returns User B's document without ownership check
4. User A can enumerate all documents (IDs 1-1000+) and extract complete database

### Attack Statistics
- **Documents Tested:** 200
- **Documents Accessed:** 140+
- **Success Rate:** 70%
- **Users Compromised:** 10
- **Execution Time:** ~2 minutes

---

## 🛡️ Defense Mechanisms

### Code-Level Authorization
The `DocumentController` now includes ownership verification:
```java
@GetMapping("/{id}")
public ResponseEntity<Document> getDocument(@PathVariable Long id, 
                                          @RequestHeader("Authorization") String authHeader) {
    String token = authHeader.substring(7);
    Long userId = jwtTokenProvider.getUserIdFromToken(token);
    
    Optional<Document> document = documentService.getDocumentById(id);
    
    if (document.isPresent() && document.get().getUserId().equals(userId)) {
        return ResponseEntity.ok(document.get());
    }
    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
}
```

### Database Configuration
- **DDL Mode:** `update` - Preserves data across restarts
- **Dialect:** MySQLDialect - Compatible with MySQL 8.0
- **Character Set:** utf8mb4 - Unicode support

---

## 📝 Testing Workflow

### Manual Testing via UI
1. Open http://localhost:5173
2. Register two test users
3. Log in as User 1
4. Create some documents
5. Log in as User 2
6. Try accessing User 1's documents
7. Observe authorization checks working

### Automated Testing
1. Run `data_populator.py` to create test data
2. Run `attack_script.py` to demonstrate IDOR
3. Review `attack_results.txt` for detailed log
4. Check `discovered_documents.json` for extracted data

---

## 🔧 Configuration Files

### application.properties (Local Development)
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/idor_db
spring.datasource.username=myuser
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update
```

### application-prod.properties (Production/Azure)
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
```

---

## 📖 Documentation Files

- **ATTACK_GUIDE.md** - Comprehensive attack execution guide
- **PHASE_1_COMPLETION_REPORT.md** - Phase 1 detailed report
- **JWT_IMPLEMENTATION_SUMMARY.md** - JWT authentication details
- **DATABASE_DEPLOYMENT_GUIDE.md** - Database setup instructions

---

## 📚 Technologies Used

### Backend
- **Spring Boot 4.1.0-M3**
- **Java 17**
- **MySQL 8.0**
- **Hibernate 7.2.7**
- **JJWT 0.12.3** (JWT Library)
- **Spring Security** with BCrypt

### Frontend
- **React.js 18**
- **Vite** (Build tool)
- **CSS3**
- **Axios** (HTTP client)

### Tools & Scripts
- **Python 3.12**
- **Maven 3.8.9**
- **Node.js 18+**
- **MySQL Workbench**

---

## 🎓 Educational Value

This project demonstrates:
1. How IDOR vulnerabilities occur in real applications
2. Why sequential IDs are dangerous in APIs
3. How proper authorization checks prevent exploitation
4. End-to-end vulnerability testing methodology
5. Full-stack web application security

---

## ⚠️ Important Notes

- **This is an educational project for learning purposes only**
- **Never use this for unauthorized access to real systems**
- **Always obtain proper authorization before security testing**
- **This vulnerability is CRITICAL and must be fixed immediately in production**

---

## 🚀 Deployment

For production deployment to Azure App Service, see `startup.sh` and deployment guides in the documentation folder.

---

## 📞 Support

For issues or questions, refer to the detailed documentation files or consult the project team.