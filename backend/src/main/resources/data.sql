-- Idempotent data initialization - only inserts if data doesn't exist
INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, created_at) 
VALUES (1, 'alice@example.com', '$2a$10$slYQmyNdGzin7olVN3p5be0DlH.PKZbv5H8KnzzVgXXbVxzy2QIDG', 'Alice', 'Smith', 'USER', NOW());

INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, created_at) 
VALUES (2, 'bob@example.com', '$2a$10$slYQmyNdGzin7olVN3p5be0DlH.PKZbv5H8KnzzVgXXbVxzy2QIDG', 'Bob', 'Johnson', 'USER', NOW());

INSERT IGNORE INTO users (id, email, password, first_name, last_name, role, created_at) 
VALUES (3, 'charlie@example.com', '$2a$10$slYQmyNdGzin7olVN3p5be0DlH.PKZbv5H8KnzzVgXXbVxzy2QIDG', 'Charlie', 'Brown', 'USER', NOW());

-- Documents for Alice (User ID: 1)
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (1, 'Alice W2 Form - 2025', 'Employee Tax Form - SSN: 123-45-6789, Annual Income: $85,000, Deductions: $12,000', 1);
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (2, 'Alice Medical History', 'Patient Name: Alice Smith, Medical Conditions: Hypertension, Current Medications: Lisinopril 10mg daily, Last Visit: 2026-03-15', 1);
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (3, 'Alice Bank Account Details', 'Account Number: 4532-1098-7654-3210, Balance: $45,230.75, Credit Score: 785, Monthly Income: $7,083', 1);

-- Documents for Bob (User ID: 2)
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (4, 'Bob Q1 Salary Details', 'Q1 Salary: $25,000, Bonus: $5,000, Taxes Withheld: $7,200, Direct Deposit Account: 9876543210', 2);
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (5, 'Bob Insurance Policy', 'Policy Number: INS-2024-00567, Coverage: $500,000, Premium: $150/month, Beneficiary: Jane Johnson', 2);
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (6, 'Bob Investment Portfolio', 'Stocks: 50 shares Apple, 30 shares Google, Cash: $15,000, Total Value: $125,450', 2);

-- Documents for Charlie (User ID: 3)
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (7, 'Charlie Company Access Codes', 'Office Door Code: 4729, Server Room: B12-SrvRm-PA$$, WiFi: CompanyNet / P@ssw0rd2024', 3);
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (8, 'Charlie Personal Notes', 'Complaint about Manager John Smith - performance review scheduled for April. Consider changing jobs.', 3);
INSERT IGNORE INTO documents (id, title, content, user_id) VALUES (9, 'Charlie Home Address', 'Residential Address: 789 Oak Street, Springfield, IL 62701, Phone: (555) 123-4567', 3);
