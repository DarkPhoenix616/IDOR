-- Delete existing data first to avoid duplicates
DELETE FROM documents;
DELETE FROM users;

-- Reset auto-increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE documents AUTO_INCREMENT = 101;

-- Users (password field will be populated via bcrypt encoder in service layer)
-- For testing, we're inserting pre-registered users
-- Passwords should be set via the registration endpoint in production
INSERT INTO users (id, email, password, first_name, last_name, role, created_at) 
VALUES (1, 'alice@example.com', '$2a$10$slYQmyNdGzin7olVN3p5be0DlH.PKZbv5H8KnzzVgXXbVxzy2QIDG', 'Alice', 'Smith', 'USER', NOW());

INSERT INTO users (id, email, password, first_name, last_name, role, created_at) 
VALUES (2, 'bob@example.com', '$2a$10$slYQmyNdGzin7olVN3p5be0DlH.PKZbv5H8KnzzVgXXbVxzy2QIDG', 'Bob', 'Johnson', 'USER', NOW());

INSERT INTO users (id, email, password, first_name, last_name, role, created_at) 
VALUES (3, 'admin@example.com', '$2a$10$slYQmyNdGzin7olVN3p5be0DlH.PKZbv5H8KnzzVgXXbVxzy2QIDG', 'Admin', 'User', 'ADMIN', NOW());

-- Documents for Alice
INSERT INTO documents (id, title, content, user_id) VALUES (101, 'Alice W2 Form', 'SSN: 123-45-678, Income: $50,000', 1);
INSERT INTO documents (id, title, content, user_id) VALUES (102, 'Alice Medical Record', 'Condition: Asthma, Medication: Albuterol', 1);

-- Documents for Bob
INSERT INTO documents (id, title, content, user_id) VALUES (103, 'Bob Bank Statement', 'Account: 987654321, Balance: $12,500', 2);
INSERT INTO documents (id, title, content, user_id) VALUES (104, 'Bob Tax Return', 'Owe: $1,200', 2);
