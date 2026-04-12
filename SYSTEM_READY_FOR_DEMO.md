# IDOR Lab - System Ready for Demo

## ✅ System Status
- **Backend API**: Running on http://localhost:8080
- **Frontend UI**: Running on http://localhost:3001
- **Database**: MySQL persisting all data
- **All Data**: Stored in local database and fully accessible

---

## 📊 Persisted Test Data

### Users Created
| User | Email | Password | ID |
|------|-------|----------|-----|
| Alice Smith | alice@company.com | AlicePass123 | 22 |
| Bob Johnson | bob@company.com | BobPass123 | 23 |
| Charlie Brown | charlie@company.com | CharliePass123 | 24 |

### Documents Persisted in Database

#### Alice's Documents (Owner ID: 22)
- **Document #141**: "HACKED - W2 Form Modified by Unauthorized User"
  - Content: WARNING message showing it was modified by attacker
  - Original: Alice W2 Tax Form with SSN, income, deductions

- **Document #142**: "Alice Medical Records"
  - Content: Patient conditions, medications, checkup dates
  - Sensitive HIPAA-protected information

- **Document #143**: "Alice Bank Account"
  - Content: Bank account number, balance ($45,230.75), credit score (785)
  - Sensitive financial information

#### Bob's Documents (Owner ID: 23)
- **Document #144**: "Bob Investment Portfolio"
  - Content: Stock holdings ($12,450), bonds ($45,000), cash ($15,000)
  - Total portfolio value: $72,450

- **Document #145**: "Bob Salary Details Q1 2026"
  - Content: Base salary ($25k/month), bonuses, tax withholdings
  - Direct deposit information

#### Charlie's Documents (Owner ID: 24)
- **Document #146**: "Charlie Office Access Codes" (Status: May be deleted in demo)
  - Content: Main door code (4729), server room password, WiFi credentials
  - Critical security credentials

---

## 🚀 Frontend Demo Workflow

### Step 1: Login
1. Go to http://localhost:3001
2. Click Login tab
3. Use any user credentials (e.g., alice@company.com / AlicePass123)

### Step 2: View Your Documents
1. "My Documents" tab shows documents owned by logged-in user
2. Each document displays:
   - Document title
   - Content preview
   - Document ID

### Step 3: Explore System (Read Vulnerability)
1. Click "Explore System" tab
2. Enter document ID (try: 141, 142, 143, 144, 145)
3. Any authenticated user can access ANY document
4. System shows: "Vulnerability Detected! No authorization check"

### Step 4: Attacker Mode (Write/Delete Vulnerability)
1. Click "Attacker Mode" tab
2. Select attack type:
   - **View**: Read any document by ID
   - **Modify**: Change title and content
   - **Delete**: Permanently remove document
3. Enter target document ID
4. For Modify: Enter new title and content
5. Click attack button - No authorization check!
6. Success message confirms modification/deletion

---

## 💾 Database Operations

### Create New Document
```bash
curl -X POST http://localhost:8080/api/documents/create \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Doc", "content": "Document content"}'
```

### Read Document
```bash
curl -X GET http://localhost:8080/api/documents/141 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### Update Document
```bash
curl -X PUT http://localhost:8080/api/documents/141 \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Modified", "content": "New content"}'
```

### Delete Document
```bash
curl -X DELETE http://localhost:8080/api/documents/141 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### Get User's Documents
```bash
curl -X GET http://localhost:8080/api/documents/user/22 \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

---

## 🔐 Key Vulnerability Points

### ❌ No Ownership Verification
- API authenticates users (JWT token validates WHO you are)
- API does NOT verify authorization (doesn't check WHAT you can access)
- Result: Any logged-in user can access/modify/delete ANY document

### Vulnerable Endpoint Example
```java
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id) {
    return documentService.getDocumentById(id);
    // ❌ NO CHECK: if (document.ownerId != currentUser.id)
}
```

### Secure Implementation Would Be
```java
@GetMapping("/documents/{id}")
public Document getDocument(@PathVariable Long id, @CurrentUser User user) {
    Document doc = documentService.getDocumentById(id);
    if (!doc.getOwnerId().equals(user.getId())) {
        throw new UnauthorizedException("Access Denied");
    }
    return doc;
}
```

---

## 📝 Data Persistence Verification

All documents are:
- ✅ Stored in MySQL database
- ✅ Persist across application restarts
- ✅ Accessible via REST API
- ✅ Modifiable without authorization
- ✅ Deletable without authorization
- ✅ Displayed in frontend UI
- ✅ Associated with correct owner (but not enforced)

---

## 🎯 Presentation Flow (6-7 minutes)

**[0:00-0:30] Overview**
- Explain IDOR vulnerability (authentication vs authorization)
- Show 3 test users with sensitive documents

**[0:30-2:00] READ Attack**
- Login as Bob
- Use Explore System tab
- Access Alice's W2 form (doc #141)
- Show unauthorized access succeeded

**[2:00-4:00] WRITE Attack**
- Go to Attacker Mode
- Select Modify
- Change Alice's W2 form title to "HACKED"
- Show success message
- Login as Alice, verify her document was actually modified

**[4:00-5:30] DELETE Attack**
- Still in Attacker Mode
- Select Delete
- Delete Charlie's access codes (doc #146)
- Document is permanently gone

**[5:30-6:30] Explain Fix**
- Show code: missing ownership check
- Demonstrate what "secure code" would look like
- Emphasize: Always verify authorization

**[6:30-7:00] Q&A Ready**

---

## ✨ System Features

### Frontend Capabilities
- Professional dark theme UI
- Login/Registration system
- Three main tabs for different interactions
- Real-time document viewing
- One-click modify/delete operations
- Clear success/error messages
- Realistic test data

### Backend Capabilities
- JWT token authentication
- Full REST API for CRUD operations
- Database persistence
- User ownership tracking (but not enforced)
- Error handling and validation
- Proper HTTP status codes

### Database
- MySQL with persistent storage
- User credentials management
- Document storage with ownership
- Automatic seed data on startup
- Reliable transaction handling

---

## 🔧 Quick Troubleshooting

**Services not running?**
```bash
cd /home/prakhar/Desktop/IDOR
docker-compose up -d
```

**Need to restart services?**
```bash
docker-compose down
docker-compose up -d
```

**Check logs?**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Access command line to DB?**
```bash
docker-compose exec mysql mysql -u root -proot IDOR_DB
```

---

## 📱 Ready for In-Class Demo!

- ✅ All services running
- ✅ All data persisted locally
- ✅ Frontend and backend fully functional
- ✅ IDOR vulnerability fully demonstrated
- ✅ Read/Write/Delete attacks all working
- ✅ Professional UI for presentation
- ✅ Realistic test data showing impact

**From your browser: http://localhost:3001**
