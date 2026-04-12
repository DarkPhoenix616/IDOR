# JWT Authentication Implementation - Summary

## What Was Implemented

### 1. **User Entity Update**
- Changed from `username` to `email` (unique identifier)
- Added: `firstName`, `lastName`, `createdAt` fields
- Email is now unique constraint in database
- Passwords will be hashed using BCrypt

### 2. **Authentication System**
- **JWT Token Generation**: Stateless authentication
- **Password Hashing**: BCrypt with salt
- **Token Validation**: Expires in 24 hours (86400000ms)
- **Security Filter**: Validates JWT on every request

### 3. **New API Endpoints**

#### Register New User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201 Created):
{
  "message": "User registered successfully",
  "userId": 4,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWI...",
  "type": "Bearer",
  "userId": 4,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Access Protected Documents
```
GET /api/documents/user/{userId}
Header: Authorization: Bearer <JWT_TOKEN>

GET /api/documents/{documentId}
Header: Authorization: Bearer <JWT_TOKEN>
```

### 4. **Pre-loaded Test Users** (in database)
- Email: `alice@example.com` | Password: `password` (BCrypt hashed)
- Email: `bob@example.com` | Password: `password` (BCrypt hashed)
- Email: `admin@example.com` | Password: `password` (BCrypt hashed)

### 5. **Security Configuration**
- CORS enabled for frontend integration
- CSRF protection disabled (for REST API)
- Stateless sessions (no server-side state)
- Public endpoints: `/api/auth/**`
- Protected endpoints: `/api/documents/**` (requires valid JWT)

### 6. **Database Changes**
- **users table** now has:
  - `email` (UNIQUE, NOT NULL)
  - `password` (NOT NULL, will be hashed)
  - `first_name` (NOT NULL)
  - `last_name` (NOT NULL)
  - `role` (NOT NULL)
  - `created_at` (TIMESTAMP, auto-populated)

---

## How to Test the System

### Step 1: Start the Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Step 2: Register a New User (Postman)
```
POST http://localhost:8080/api/auth/register
Body (JSON):
{
  "email": "testuser@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

### Step 3: Login to Get JWT Token
```
POST http://localhost:8080/api/auth/login
Body (JSON):
{
  "email": "testuser@example.com",
  "password": "TestPassword123!"
}
```

Copy the `token` value from response.

### Step 4: Access Protected Endpoints
```
GET http://localhost:8080/api/documents/user/4
Header: Authorization: Bearer <PASTE_TOKEN_HERE>
```

### Step 5: Test IDOR Vulnerability (Still Present!)
```
GET http://localhost:8080/api/documents/103
Header: Authorization: Bearer <ALICE_TOKEN>
```

Alice can still access Bob's document (ID 103) - Vulnerability still intact for Phase 2 demo!

---

## Remaining IDOR Vulnerabilities (For Attack Demo)

The following vulnerabilities still exist:
1. ✅ **Sequential Document IDs** - Attackers can enumerate IDs (101, 102, 103, etc.)
2. ✅ **No Object-Level Authorization** - Can access any document with valid JWT
3. ✅ **No Rate Limiting** - Can brute-force all documents quickly
4. ✅ **Authentication Only** - System verifies user identity but not object ownership

This is PERFECT for your Phase 2 attack demonstration!

---

## Test Credentials (Pre-loaded in Database)

Use password: `password` for all test accounts

- alice@example.com
- bob@example.com  
- admin@example.com

---

## Dependencies Added to pom.xml

1. `spring-boot-starter-security` - Security framework
2. `jjwt-api:0.12.3` - JWT token generation
3. `jjwt-impl:0.12.3` - JWT implementation
4. `jjwt-jackson:0.12.3` - JSON support for JWT

---

## Files Created/Modified

### Created:
- `RegisterRequest.java` - Register payload
- `LoginRequest.java` - Login payload
- `LoginResponse.java` - Login response with token
- `JwtTokenProvider.java` - JWT token utilities
- `JwtAuthenticationFilter.java` - JWT validation filter
- `SecurityConfig.java` - Spring Security configuration
- `AuthService.java` - Authentication business logic
- `AuthController.java` - Auth endpoints

### Modified:
- `User.java` - Updated entity with email/firstName/lastName
- `UserRepository.java` - Updated queries for email-based lookup
- `pom.xml` - Added JWT & Security dependencies
- `application.properties` - Added JWT configuration
- `data.sql` - Updated with new user schema

---

## What's Next?

For Phase 2 (Attack Demo):
1. ✅ Backend is ready with JWT auth
2. ⏳ Frontend (React) - Login UI, Document viewer
3. ⏳ Python Attack Script - Auto-login, brute-force documents
4. ⏳ Container orchestration - All 4 containers networked

For Phase 3 (Defense):
1. ⏳ Add authorization checks in DocumentService
2. ⏳ Migrate document IDs to UUIDs
3. ⏳ Add rate limiting middleware
