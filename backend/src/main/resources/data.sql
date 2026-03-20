-- Users
INSERT INTO users (id, username, password, role) VALUES (1, 'alice', 'password123', 'USER');
INSERT INTO users (id, username, password, role) VALUES (2, 'bob', 'password456', 'USER');
INSERT INTO users (id, username, password, role) VALUES (3, 'admin', 'adminpass', 'ADMIN');

-- Documents for Alice
INSERT INTO documents (id, title, content, user_id) VALUES (101, 'Alice W2 Form', 'SSN: 123-45-678, Income: $50,000', 1);
INSERT INTO documents (id, title, content, user_id) VALUES (102, 'Alice Medical Record', 'Condition: Asthma, Medication: Albuterol', 1);

-- Documents for Bob
INSERT INTO documents (id, title, content, user_id) VALUES (103, 'Bob Bank Statement', 'Account: 987654321, Balance: $12,500', 2);
INSERT INTO documents (id, title, content, user_id) VALUES (104, 'Bob Tax Return', 'Owe: $1,200', 2);
