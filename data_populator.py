#!/usr/bin/env python3
"""
Data Population Script
Creates multiple users and documents for IDOR vulnerability testing
"""

import requests
import json
import time
import argparse
from datetime import datetime, timedelta

class DataPopulator:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.created_users = []
        self.created_documents = []
    
    def log(self, message):
        """Print log message"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
    
    def register_user(self, email, password, first_name, last_name):
        """Register a new user"""
        url = f"{self.base_url}/api/auth/register"
        payload = {
            "email": email,
            "password": password,
            "firstName": first_name,
            "lastName": last_name
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            if response.status_code == 201:
                data = response.json()
                user_id = data.get('userId')
                self.created_users.append({'id': user_id, 'email': email, 'password': password})
                self.log(f"[+] User created: {email} (ID: {user_id})")
                return user_id
            else:
                self.log(f"[-] Failed to create user {email}: {response.status_code}")
                return None
        except Exception as e:
            self.log(f"[-] Error creating user {email}: {str(e)}")
            return None
    
    def login_user(self, email, password):
        """Login and get token"""
        url = f"{self.base_url}/api/auth/login"
        payload = {"email": email, "password": password}
        
        try:
            response = self.session.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                token = response.json().get('token')
                return token
            return None
        except:
            return None
    
    def create_document(self, email, password, title, content):
        """Create a document as a specific user"""
        # Login first
        token = self.login_user(email, password)
        if not token:
            self.log(f"[-] Failed to login as {email}")
            return None
        
        # Create document
        url = f"{self.base_url}/api/documents/create"
        headers = {'Authorization': f'Bearer {token}'}
        payload = {"title": title, "content": content}
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code == 201:
                data = response.json()
                doc_id = data.get('id') or data.get('documentId')
                self.created_documents.append({'id': doc_id, 'title': title, 'owner_email': email})
                self.log(f"[+] Document created: '{title}' by {email}")
                return doc_id
            else:
                self.log(f"[-] Failed to create document: {response.status_code}")
                return None
        except Exception as e:
            self.log(f"[-] Error creating document: {str(e)}")
            return None
    
    def populate_data(self, num_users=5, docs_per_user=10):
        """Populate database with test data"""
        self.log(f"\n{'='*60}")
        self.log(f"STARTING DATA POPULATION")
        self.log(f"{'='*60}")
        self.log(f"Target: {self.base_url}")
        self.log(f"Users to create: {num_users}")
        self.log(f"Documents per user: {docs_per_user}\n")
        
        # Create users
        for i in range(1, num_users + 1):
            email = f"user{i}@example.com"
            password = f"Password{i}@2024"
            first_name = f"TestUser{i}"
            last_name = f"Account{i}"
            
            user_id = self.register_user(email, password, first_name, last_name)
            
            if user_id:
                # Create documents for this user
                for j in range(1, docs_per_user + 1):
                    title = f"Document {j} from User {i}"
                    content = f"Test document #{j} by {first_name} {last_name}. Created on {datetime.now().isoformat()}. This is sensitive data."
                    
                    self.create_document(email, password, title, content)
                    time.sleep(0.5)  # Rate limiting
        
        # Print summary
        self.log(f"\n{'='*60}")
        self.log(f"DATA POPULATION COMPLETED")
        self.log(f"{'='*60}")
        self.log(f"Total users created: {len(self.created_users)}")
        self.log(f"Total documents created: {len(self.created_documents)}")
        self.log(f"\nCreated Users:")
        for user in self.created_users:
            self.log(f"  - ID: {user['id']}, Email: {user['email']}, Password: {user['password']}")
        self.log(f"\nCreated Documents:")
        for doc in self.created_documents:
            self.log(f"  - ID: {doc['id']}, Title: {doc['title']}, Owner: {doc['owner_email']}")
        self.log(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(
        description='Populate database with test data for IDOR testing'
    )
    parser.add_argument('-u', '--url', required=True, help='Base URL of the application')
    parser.add_argument('--users', type=int, default=5, help='Number of users to create (default: 5)')
    parser.add_argument('--docs', type=int, default=10, help='Documents per user (default: 10)')
    
    args = parser.parse_args()
    
    populator = DataPopulator(args.url)
    populator.populate_data(args.users, args.docs)


if __name__ == '__main__':
    main()
