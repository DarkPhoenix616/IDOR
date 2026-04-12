# 🚀 Quick Start Guide - IDOR POC with Frontend

## Complete Setup Guide

This guide covers running the entire IDOR POC including the new React frontend, backend, and database.

---

## Option 1: Docker Compose (Recommended - Easiest)

### Prerequisites
- Docker Desktop installed and running
- Port 3000, 8080, 3307 available

### Steps

1. **Navigate to project root**:
```bash
cd /home/prakhar/Desktop/IDOR
```

2. **Build and start all services**:
```bash
docker-compose -f docker-compose.yml up --build
```

   This will:
   - Build the React frontend
   - Build the Spring Boot backend
   - Start MySQL database
   - Start all services

3. **Wait for startup** (takes ~1-2 minutes first time):
```
✓ MySQL ready
✓ Backend ready  
✓ Frontend ready
```

4. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **Database**: localhost:3307

5. **Demo Credentials**:
   - Email: `alice@test.com`
   - Password: `Password123`

6. **Stop all services**:
```bash
docker-compose -f docker-compose.yml down
```

---

## Option 2: Local Development (Manual)

### Prerequisites

- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven

### Backend Setup

1. **Start MySQL** (if using local MySQL):
```bash
# Using Docker just for MySQL
docker run --name idor-mysql \
  -e MYSQL_DATABASE=idor_db \
  -e MYSQL_USER=myuser \
  -e MYSQL_PASSWORD=secret \
  -e MYSQL_ROOT_PASSWORD=verysecret \
  -p 3307:3306 \
  -d mysql:latest
```

2. **Build backend**:
```bash
cd backend
./mvnw clean package -DskipTests
```

3. **Run backend**:
```bash
./mvnw spring-boot:run
```

   Backend will be available at: http://localhost:8080

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Start frontend**:
```bash
npm start
```

   Frontend will be available at: http://localhost:3000

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Database: localhost:3307

---

## 🧪 Testing the IDOR Vulnerability

Once everything is running:

1. **Register a new user** (or use demo credentials)
2. **Login** with your credentials
3. **Go to "Explore IDOR Vulnerability" tab**
4. **Try accessing document IDs** like: 1, 2, 3, 4, etc.
5. **Notice**: You can access ANY document regardless of ownership!

### Example Test API Call

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "Password123"
  }'

# 2. Copy the token from response
# 3. Use token to access any document
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://localhost:8080/api/documents/1
```

You'll get back documents owned by OTHER users! That's the IDOR vulnerability.

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Port 3000)      │
│  - Login / Register                     │
│  - View Documents                       │
│  - IDOR Vulnerability Demo              │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTP Requests
                   ▼
┌─────────────────────────────────────────┐
│   Spring Boot Backend (Port 8080)       │
│  - JWT Authentication                   │
│  - Document API (Vulnerable!)           │
│  - User Management                      │
└──────────────────┬──────────────────────┘
                   │
                   │ Database Queries
                   ▼
┌─────────────────────────────────────────┐
│    MySQL Database (Port 3307)           │
│  - Users table                          │
│  - Documents table                      │
│  - Mock data with IDOR vector           │
└─────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Docker Issues

**Container won't start**:
```bash
# Check logs
docker-compose logs frontend
docker-compose logs backend

# Rebuild without cache
docker-compose -f docker-compose.yml up --build --no-cache
```

**Port already in use**:
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9    # Frontend
lsof -ti:8080 | xargs kill -9    # Backend
lsof -ti:3307 | xargs kill -9    # Database
```

### Frontend Issues

**CORS errors**:
- Ensure backend is running on port 8080
- Check `.env` file has correct `REACT_APP_API_URL`

**API not responding**:
```bash
# Test backend
curl http://localhost:8080/api/auth/login
```

### Backend Issues

**Database connection error**:
- Check MySQL is running: `docker ps | grep mysql`
- Verify credentials in `application.properties`

**Port 8080 already in use**:
```bash
lsof -ti:8080 | xargs kill -9
./mvnw spring-boot:run
```

---

## 📝 Project Structure

```
IDOR/
├── frontend/              # React web application
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── backend/               # Spring Boot API
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── compose.yaml
├── docker-compose.yml     # Main compose file
└── QUICK_START.md        # This file
```

---

## 🎓 What You'll Learn

- **IDOR Vulnerability**: How missing authorization checks enable attacks
- **JWT Authentication**: Modern token-based authentication
- **React Development**: Building frontend apps
- **Spring Boot**: Creating REST APIs
- **Docker**: Containerizing applications
- **Security**: Why authentication ≠ authorization

---

## 📚 Additional Resources

- [Frontend README](./frontend/README.md)
- [Backend README](./README.md)
- [Attack Guide](./ATTACK_GUIDE.md)
- [JWT Implementation Details](./JWT_IMPLEMENTATION_SUMMARY.md)

---

## 💡 Next Steps

After understanding the IDOR vulnerability, consider:

1. **Advanced Features**:
   - Add rate limiting
   - Implement proper authorization checks
   - Add encryption

2. **Automated Testing**:
   - Create a Python attack script
   - Generate exploitation reports

3. **Defense**:
   - Fix the IDOR vulnerability
   - Implement role-based access control
   - Add comprehensive logging

---

## 🆘 Need Help?

Check the logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

Try accessing the APIs directly:
```bash
curl http://localhost:8080/api/auth/login
curl http://localhost:3000
```

---

**Happy Learning! 🎉**
