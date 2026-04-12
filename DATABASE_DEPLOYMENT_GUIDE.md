# Database Setup Guide for IDOR POC - Deployment

## Overview
Your backend now uses JWT authentication with email-based registration. For deployment, you need a proper MySQL database setup that's accessible from your production environment.

---

## **LOCAL DEVELOPMENT (What you have now)**

### Current Setup:
- **Database**: MySQL running in Docker container
- **Port**: 3307 (mapped to 3306 inside container)
- **Database**: `idor_db`
- **User**: `myuser` / **Password**: `secret`
- **Connection String**: `jdbc:mysql://localhost:3307/idor_db`

### To Start Local Database:
```bash
cd backend
docker compose up -d
```

---

## **PRODUCTION DEPLOYMENT OPTIONS**

You have several options for production deployment:

### **Option 1: Amazon RDS (Recommended for Cloud)**

1. **Create RDS Instance**:
   - Go to AWS RDS Console
   - Create new MySQL instance (Version 8.0+)
   - DB Instance Identifier: `idor-poc-db`
   - Master Username: `admin`
   - Master Password: (Strong password - store securely)
   - DB Name: `idor_db`
   - Publicly Accessible: Yes (for initial setup, restrict later)
   - Multi-AZ: No (for POC)

2. **Update Spring Boot Configuration** for production:
   ```properties
   spring.datasource.url=jdbc:mysql://<RDS_ENDPOINT>:3306/idor_db
   spring.datasource.username=admin
   spring.datasource.password=<YOUR_STRONG_PASSWORD>
   ```

3. **Security Group Rules**:
   - Allow inbound on port 3306 from your application server's security group
   - Restrict to only your application servers

---

### **Option 2: Azure Database for MySQL (Alternative Cloud)**

1. **Create Azure MySQL Database**:
   - Server name: `idor-poc-server`
   - Admin username: `mysqladmin`
   - Password: (Strong password)
   - Pricing Tier: Basic or Standard

2. **Connection Details**:
   ```properties
   spring.datasource.url=jdbc:mysql://<AZURE_SERVER>.mysql.database.azure.com:3306/idor_db?useSSL=true&requireSSL=true
   spring.datasource.username=mysqladmin@<AZURE_SERVER>
   spring.datasource.password=<YOUR_PASSWORD>
   ```

---

### **Option 3: Docker Container with Persistent Volume (Docker Swarm/Kubernetes)**

1. **Create named volume**:
   ```bash
   docker volume create idor-mysql-data
   ```

2. **Update docker-compose.yaml for production**:
   ```yaml
   services:
     mysql:
       image: 'mysql:8.0'
       environment:
         - MYSQL_DATABASE=idor_db
         - MYSQL_USER=idor_user
         - MYSQL_PASSWORD=<STRONG_PASSWORD>
         - MYSQL_ROOT_PASSWORD=<ROOT_STRONG_PASSWORD>
       volumes:
         - idor-mysql-data:/var/lib/mysql
       ports:
         - '3306:3306'
       healthcheck:
         test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
         timeout: 20s
         retries: 10
   volumes:
     idor-mysql-data:
       driver: local
   ```

---

### **Option 4: On-Premises/VPS MySQL Server**

1. **Install MySQL 8.0+**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mysql-server mysql-client
   
   # macOS
   brew install mysql
   ```

2. **Create Database and User**:
   ```sql
   CREATE DATABASE idor_db;
   CREATE USER 'idor_user'@'%' IDENTIFIED BY '<STRONG_PASSWORD>';
   GRANT ALL PRIVILEGES ON idor_db.* TO 'idor_user'@'%';
   FLUSH PRIVILEGES;
   ```

3. **Update Spring Boot Configuration**:
   ```properties
   spring.datasource.url=jdbc:mysql://<SERVER_IP>:3306/idor_db
   spring.datasource.username=idor_user
   spring.datasource.password=<STRONG_PASSWORD>
   ```

---

## **RECOMMENDED PRODUCTION SETUP**

For your POC deployment TODAY, I recommend:

### **Best Option: Docker Container + Cloud Storage**
1. Deploy your Spring Boot app as a Docker container
2. Use **Amazon RDS** or **Azure Database for MySQL** (managed service)
3. This eliminates database management overhead

### **Steps**:

1. **Create RDS Instance** (AWS):
   ```
   - Engine: MySQL 8.0.28+
   - Instance Class: db.t3.micro (free tier eligible)
   - Storage: 20 GB
   - Multi-AZ: Off
   - Publicly Accessible: Yes (for now)
   ```

2. **Get Connection Endpoint** from AWS console (something like):
   ```
   idor-poc-db.c9akciq32.us-east-1.rds.amazonaws.com:3306
   ```

3. **Update application-prod.properties**:
   ```properties
   spring.datasource.url=jdbc:mysql://idor-poc-db.c9akciq32.us-east-1.rds.amazonaws.com:3306/idor_db?useSSL=false&allowPublicKeyRetrieval=true
   spring.datasource.username=admin
   spring.datasource.password=YourStrongPassword123!
   spring.jpa.hibernate.ddl-auto=validate
   ```

4. **Activate production profile** when deploying:
   ```bash
   java -jar backend.jar --spring.profiles.active=prod
   ```

---

## **DATABASE MIGRATION (From Local to Production)**

### **Step 1: Export Current Data** (if needed)
```bash
docker exec backend-mysql-1 mysqldump -u myuser -psecret idor_db > idor_db_backup.sql
```

### **Step 2: Import to Production**
```bash
mysql -h <PROD_HOST> -u admin -p idor_db < idor_db_backup.sql
```

---

## **SECURITY BEST PRACTICES FOR PRODUCTION**

1. **Never commit passwords to Git**:
   ```bash
   # Use environment variables
   export DB_PASSWORD=your_secure_password
   export DB_URL=jdbc:mysql://your-host:3306/idor_db
   ```

2. **Use application-prod.properties** with environment variable substitution:
   ```properties
   spring.datasource.url=${DB_URL}
   spring.datasource.username=${DB_USER}
   spring.datasource.password=${DB_PASSWORD}
   ```

3. **Enable SSL/TLS connections**:
   ```properties
   spring.datasource.url=jdbc:mysql://host:3306/idor_db?useSSL=true&serverTimezone=UTC
   ```

4. **Restrict Database Access**:
   - Only allow connections from your application server
   - Use security groups/firewall rules
   - Disable public internet access in production

5. **Backup Strategy**:
   - Enable automated daily backups (RDS does this)
   - Test restoration procedures regularly

---

## **QUICK DEPLOYMENT CHECKLIST**

- [ ] Choose deployment database option (RDS/Azure/VPS/Docker)
- [ ] Create database and user credentials
- [ ] Get connection endpoint/URL
- [ ] Update application-prod.properties with credentials
- [ ] Store credentials securely (environment variables, secrets manager)
- [ ] Test connection before deployment
- [ ] Enable SSL/TLS encryption
- [ ] Set up database backups
- [ ] Configure firewall/security groups
- [ ] Deploy application with correct profile activated

---

## **FOR TODAY'S DEPLOYMENT**

1. **If deploying to AWS**:
   - Use RDS MySQL instance
   - Application connects via endpoint
   - Credentials stored in environment variables

2. **If deploying to Docker container**:
   - Use named volume for persistence
   - Network your containers together
   - Use `.env` file for secrets

3. **Connection Test Command**:
   ```bash
   mysql -h <YOUR_HOST> -u <YOUR_USER> -p<YOUR_PASSWORD> -D idor_db
   ```

---

## **USER AUTHENTICATION TEST FLOW**

With the new JWT system, users must:

1. **Register** (Create Account):
   ```bash
   POST /api/auth/register
   {
     "email": "newuser@example.com",
     "password": "SecurePassword123!",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Login** (Get JWT Token):
   ```bash
   POST /api/auth/login
   {
     "email": "newuser@example.com",
     "password": "SecurePassword123!"
   }
   Response:
   {
     "token": "eyJhbGciOiJIUzUxMiJ9...",
     "type": "Bearer",
     "userId": 4,
     "email": "newuser@example.com"
   }
   ```

3. **Access Protected Resources** (with JWT):
   ```bash
   GET /api/documents/user/4
   Header: Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
   ```

---

## **NEXT STEPS**

Once you have the production database set up:
1. Update application.properties with production credentials
2. Deploy Spring Boot backend to your cloud/server
3. Build and deploy React frontend (Container A)
4. Create Python attacker script (Container D)
5. Test end-to-end workflow

For immediate deployment today, I recommend using **Docker with named volumes** for simplicity, then migrating to a managed database service later.
