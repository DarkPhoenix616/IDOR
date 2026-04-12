# IDOR POC Frontend

A modern React-based web application for demonstrating and exploring Insecure Direct Object Reference (IDOR) vulnerabilities.

## 🎯 Features

- **User Authentication**: Register and login with JWT tokens
- **IDOR Vulnerability Exploration**: Interactive tool to discover how IDOR works
- **Document Access**: View documents and attempt unauthorized access
- **Educational Content**: Learn about IDOR vulnerabilities and mitigation strategies
- **Professional UI**: Dark theme with intuitive navigation

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Bootstrap 5** - Styling
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Local Development

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Create environment file**:
```bash
# Copy example env
cp .env.example .env

# Update if needed
REACT_APP_API_URL=http://localhost:8080/api
```

3. **Start development server**:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Demo Credentials

For testing the IDOR vulnerability:
- **Email**: `alice@test.com`
- **Password**: `Password123`

Try accessing document IDs: 1, 2, 3, 4, etc. - you can access any of them!

## 🐳 Docker Deployment

### Run with Docker Compose (Entire Stack)

From the root directory (`/home/prakhar/Desktop/IDOR/`):

```bash
# Build and start all services
docker-compose -f docker-compose.yml up --build

# Or run in background
docker-compose -f docker-compose.yml up -d --build
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **MySQL**: localhost:3307

### Stop All Services

```bash
docker-compose -f docker-compose.yml down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f mysql
```

## 📚 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   └── Dashboard.jsx   # Main dashboard
│   ├── components/
│   ├── services/
│   │   └── api.js          # API client
│   ├── App.jsx             # Main app component
│   └── index.jsx           # Entry point
├── public/
├── index.html              # HTML template
├── package.json            # Dependencies
├── Dockerfile              # Docker configuration
├── .env                    # Environment variables
└── README.md              # This file
```

## 🔌 API Integration

The frontend communicates with the Spring Boot backend:

### Authentication Endpoints
```
POST /api/auth/register   - Create new user
POST /api/auth/login      - Login user
```

### Document Endpoints
```
GET /api/documents/user/{userId}    - Get user's documents
GET /api/documents/{documentId}     - Get specific document (IDOR!)
```

## 🎓 Educational Sections

The dashboard includes three tabs:

1. **My Documents** - View your own documents
2. **Explore IDOR Vulnerability** - Interactive testing tool
3. **About IDOR** - Educational content about the vulnerability

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8080/api` | Backend API URL |

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend is running on port 8080
- Check `REACT_APP_API_URL` in `.env`
- Verify backend CORS configuration

### API Connection Issues
```bash
# Check backend health
curl http://localhost:8080/api/auth/login

# Check API is responding (should see 400 error with no body)
curl -X POST http://localhost:8080/api/auth/login
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

## 📖 Learning Resources

See the main project documentation:
- [IDOR POC Main README](../README.md)
- [Attack Guide](../ATTACK_GUIDE.md)
- [JWT Implementation](../JWT_IMPLEMENTATION_SUMMARY.md)

## 🔒 Security Note

This application intentionally contains security vulnerabilities for educational purposes. **Do not use in production!**

## 📄 License

Educational Project
