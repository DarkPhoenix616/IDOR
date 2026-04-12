# IDOR POC - Complete Implementation Status

## ✅ PHASE 1: ENVIRONMENT SETUP & VULNERABLE IMPLEMENTATION - COMPLETE

### What's Been Delivered:

#### 1. **User Authentication System** ✅
- Email-based user registration
- BCrypt password hashing
- JWT token generation (24-hour expiry)
- Stateless authentication
- Security filtering on all requests

#### 2. **Database Layer** ✅
- MySQL database (Docker containerized)
- User table with email, password, names
- Documents table with user_id relationship
- Auto-schema generation via Hibernate
- Pre-loaded test data

#### 3. **REST API Endpoints** ✅
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get JWT token
- `GET /api/documents/user/{userId}` - Get user's documents
- `GET /api/documents/{documentId}` - Get document by ID (VULNERABLE)

#### 4. **IDOR Vulnerability** ✅
- Sequential document IDs (101, 102, 103, 104)
- No object-level authorization checks
- Any authenticated user can access any document
- Enumeration possible via brute-force
- Ready for Phase 2 exploitation demo

---

## 📋 Database Deployment Options

### **For Immediate Deployment (Today)**

#### Option A: Docker Volume (Simplest)
```bash
# Start locally with persistent volume
docker volume create idor-mysql-data
docker compose up -d

# Deploy to server:
# Same docker-compose.yml with named volume
# Data persists even if container restarts
```

#### Option B: Amazon RDS (Recommended for Cloud)
```
Benefits:
- Managed service (no maintenance)
- Automatic backups
- High availability
- Scalable
- Security groups for access control

Setup time: 5-10 minutes
Cost: ~$0/month (free tier eligible)
```

#### Option C: Azure Database for MySQL
```
Similar to RDS but on Azure infrastructure
Setup time: 5-10 minutes
Cost: ~$0/month (free tier eligible)
```

#### Option D: VPS with MySQL Server
```
Self-managed on your server
Setup time: 15-20 minutes
Cost: Depends on VPS provider
```

---

## 🔑 Authentication Flow

### Registration
```
User → POST /api/auth/register 
  ↓
Backend validates email uniqueness
  ↓
Password hashed with BCrypt
  ↓
User saved to database
  ↓
Response: User ID, email, names
```

### Login
```
User → POST /api/auth/login
  ↓
Email lookup in database
  ↓
Password comparison (BCrypt verify)
  ↓
If valid: Generate JWT token
  ↓
Response: JWT token + user info
```

### Protected Resource Access
```
User (with JWT) → GET /api/documents/user/1
  ↓
JwtAuthenticationFilter validates token
  ↓
Extract userId from token
  ↓
Set as principal in SecurityContext
  ↓
DocumentController accesses documents
  ↓
Response: User's documents
```

---

## 🚨 IDOR Vulnerability Details

### Current State (Vulnerable):
```
When Alice calls: GET /api/documents/103

1. JWT validation: ✅ Alice is authenticated
2. Authorization check: ❌ MISSING - No check if Alice owns doc 103
3. Result: Returns Bob's Bank Statement to Alice

This is the IDOR vulnerability we're demonstrating!
```

### What Gets Exposed:
- All user documents (with sequential ID enumeration)
- Sensitive data (financial, medical records)
- Other users' private information
- Proof of horizontal privilege escalation

---

## 📦 Pre-loaded Test Credentials

All test users have password: `password`

| Email | User ID | Documents |
|-------|---------|-----------|
| alice@example.com | 1 | 101, 102 |
| bob@example.com | 2 | 103, 104 |
| admin@example.com | 3 | None |

---

## 🎯 Phase 2: Attack Execution (Ready for Next Step)

When you're ready, we need to build:

1. **Frontend UI (React)** - Container A
   - Login page
   - Document viewer
   - User dashboard

2. **Python Attacker Script** - Container D
   - Auto-login functionality
   - Document enumeration (brute-force IDs)
   - Batch download capability
   - Attack report generation

3. **Container Orchestration**
   - All 4 containers networked together
   - Shared volumes for data
   - Health checks and dependencies

---

## 🛡️ Phase 3: Defense Implementation (Future)

Ready to implement when needed:

1. **Code-Level Authorization**
   ```java
   if (!document.getOwner().getId().equals(currentUserId)) {
       return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
   }
   ```

2. **UUID Migration**
   ```sql
   ALTER TABLE documents MODIFY COLUMN id CHAR(36);
   -- Replace sequential IDs with UUIDs
   ```

3. **Rate Limiting**
   - Limit requests per IP per minute
   - Implement WAF rules

---

## 🚀 Quick Start Guide

### Start Backend (Local)
```bash
cd backend
docker compose up -d      # Start MySQL
./mvnw spring-boot:run   # Start Spring Boot
```

### Test with Postman

**1. Login Alice**
```
POST http://localhost:8080/api/auth/login
{"email":"alice@example.com","password":"password"}
```

**2. Access Bob's Document (IDOR)**
```
GET http://localhost:8080/api/documents/103
Header: Authorization: Bearer <TOKEN>
```

### Result
Alice successfully retrieves Bob's sensitive data → **Vulnerability Confirmed**

---

## 📊 Project Structure

```
backend/
├── src/main/java/com/idor/project/
│   ├── controller/
│   │   ├── AuthController.java
│   │   └── DocumentController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   └── DocumentService.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── DocumentRepository.java
│   ├── payload/
│   │   ├── User.java
│   │   ├── Document.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── LoginResponse.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── SecurityConfig.java
│   └── ProjectApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── data.sql
└── pom.xml
```

---

## ✨ Key Implementation Details

### JWT Configuration
- Secret Key: Configurable in application.properties
- Expiration: 24 hours (86400000ms)
- Algorithm: HMAC-SHA512
- Claims: userId, email, issuedAt, expiration

### Password Security
- Algorithm: BCrypt with default strength (10)
- Never stored in plain text
- Hashed at registration time
- Compared securely at login

### Database
- MySQL 8.0+
- Automatic schema creation
- Auto-increment IDs (sequential for IDOR demo)
- Foreign key relationships

---

## 🎓 What This Demonstrates

### Security Concepts Covered:
1. ✅ User authentication (JWT)
2. ✅ Password hashing (BCrypt)
3. ✅ IDOR vulnerability (Sequential IDs + No AuthZ)
4. ✅ Horizontal privilege escalation
5. ✅ Broken access control

### Technologies Used:
1. Spring Boot (REST API)
2. Spring Security (Authentication)
3. JWT (Token generation)
4. Hibernate/JPA (ORM)
5. MySQL (Database)
6. Docker (Containerization)

---

## 📋 Deployment Checklist

### Before Deployment:
- [ ] Database credentials secured (environment variables)
- [ ] JWT secret key secured
- [ ] SSL/TLS certificates configured
- [ ] CORS origins whitelisted
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Health check endpoints ready

### For Production:
- [ ] Use managed database (RDS/Azure)
- [ ] Enable SSL/TLS for database connection
- [ ] Store secrets in secure vault (AWS Secrets Manager, etc.)
- [ ] Set up monitoring and alerts
- [ ] Configure auto-backup and disaster recovery
- [ ] Restrict database access via security groups

---

## 🤝 Next Steps

1. **Test the current setup** with Postman (see TESTING_JWT_IDOR.md)
2. **Choose database deployment option** (see DATABASE_DEPLOYMENT_GUIDE.md)
3. **Deploy to production** (when ready)
4. **Build Phase 2 components** (Frontend + Attack Script)
5. **Execute attack demo** (Prove the IDOR vulnerability)
6. **Implement Phase 3 defenses** (Authorization + UUID migration)

---

## 📞 Support

If you encounter issues:
1. Check application logs: `./mvnw spring-boot:run` (check console output)
2. Verify database: `docker ps` (ensure mysql container is running)
3. Test endpoints: Use TESTING_JWT_IDOR.md as reference
4. Check configuration: Review application.properties for typos

---

**Phase 1 is COMPLETE and READY for Phase 2 deployment!** 🎉
