# Azure Deployment Guide for IDOR POC Backend

## Overview
This guide covers deploying your Spring Boot backend to **Azure App Service** with a **MySQL database on Azure Database for MySQL** using secure credential management.

---

## **Phase 1: Prepare Your Application**

### **Step 1.1: Create Application Production Profile**

Create `src/main/resources/application-prod.properties`:

```properties
# Production Database Configuration
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Disable DevTools in production
spring.devtools.restart.enabled=false

# SQL Initialization
spring.sql.init.mode=never

# JWT Configuration
app.jwtSecret=${JWT_SECRET}
app.jwtExpirationInMs=86400000

# Logging
logging.level.root=INFO
logging.level.com.idor.project=INFO
```

### **Step 1.2: Update POM.XML for Production Build**

Ensure your `pom.xml` has the Maven assembly plugin for creating a JAR:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

### **Step 1.3: Build the Application**

```bash
cd /Users/daniegeorgejohn/Desktop/Cybersec\ Project/backend
./mvnw clean package -DskipTests
```

This creates: `target/project-0.0.1-SNAPSHOT.jar`

---

## **Phase 2: Set Up Azure Resources**

### **Step 2.1: Create Azure Resource Group**

```bash
az group create \
  --name idor-poc-rg \
  --location eastus
```

### **Step 2.2: Create Azure Database for MySQL (Flexible Server)**

```bash
az mysql flexible-server create \
  --resource-group idor-poc-rg \
  --name idor-poc-mysql \
  --location eastus \
  --admin-user mysqladmin \
  --admin-password "YourStrongPassword123!@#" \
  --sku-name Standard_B1s \
  --tier Burstable \
  --storage-size 32 \
  --version 8.0 \
  --public-access Enabled
```

**Save your MySQL credentials securely** (we'll use them in Azure Key Vault later)

### **Step 2.3: Create Database**

```bash
az mysql flexible-server db create \
  --resource-group idor-poc-rg \
  --server-name idor-poc-mysql \
  --database-name cybersecurity_project_idor_db
```

### **Step 2.4: Configure MySQL Firewall**

Allow Azure services to connect:

```bash
az mysql flexible-server firewall-rule create \
  --resource-group idor-poc-rg \
  --name idor-poc-mysql \
  --rule-name allow-azure-services \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## **Phase 3: Azure Key Vault - Secure Credentials**

### **Step 3.1: Create Azure Key Vault**

```bash
az keyvault create \
  --resource-group idor-poc-rg \
  --name idor-poc-vault \
  --location eastus
```

### **Step 3.2: Store Secrets in Key Vault**

```bash
# Store Database URL
az keyvault secret set \
  --vault-name idor-poc-vault \
  --name DB-URL \
  --value "jdbc:mysql://idor-poc-mysql.mysql.database.azure.com:3306/cybersecurity_project_idor_db?useSSL=true&requireSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true"

# Store Database Username
az keyvault secret set \
  --vault-name idor-poc-vault \
  --name DB-USERNAME \
  --value "mysqladmin"

# Store Database Password
az keyvault secret set \
  --vault-name idor-poc-vault \
  --name DB-PASSWORD \
  --value "YourStrongPassword123!@#"

# Store JWT Secret
az keyvault secret set \
  --vault-name idor-poc-vault \
  --name JWT-SECRET \
  --value "your-super-secret-jwt-key-make-it-long-and-random-at-least-32-chars-12345678"
```

### **Step 3.3: Verify Secrets**

```bash
az keyvault secret list \
  --vault-name idor-poc-vault \
  --output table
```

---

## **Phase 4: Create Azure App Service**

### **Step 4.1: Create App Service Plan**

```bash
az appservice plan create \
  --name idor-poc-plan \
  --resource-group idor-poc-rg \
  --sku B1 \
  --is-linux
```

### **Step 4.2: Create Web App**

```bash
az webapp create \
  --resource-group idor-poc-rg \
  --plan idor-poc-plan \
  --name idor-poc-app \
  --runtime "JAVA|21-java21"
```

---

## **Phase 5: Deploy Application to Azure**

### **Step 5.1: Connect Key Vault to App Service**

Create a system-assigned managed identity:

```bash
az webapp identity assign \
  --resource-group idor-poc-rg \
  --name idor-poc-app
```

Get the identity ID:

```bash
IDENTITY_ID=$(az webapp identity show \
  --resource-group idor-poc-rg \
  --name idor-poc-app \
  --query principalId -o tsv)

echo $IDENTITY_ID
```

### **Step 5.2: Grant App Service Access to Key Vault**

```bash
az keyvault set-policy \
  --name idor-poc-vault \
  --object-id $IDENTITY_ID \
  --secret-permissions get list
```

### **Step 5.3: Configure App Settings**

Add environment variables that reference Key Vault secrets:

```bash
az webapp config appsettings set \
  --resource-group idor-poc-rg \
  --name idor-poc-app \
  --settings \
  SPRING_PROFILES_ACTIVE="prod" \
  DB_URL="@Microsoft.KeyVault(SecretUri=https://idor-poc-vault.vault.azure.net/secrets/DB-URL/)" \
  DB_USERNAME="@Microsoft.KeyVault(SecretUri=https://idor-poc-vault.vault.azure.net/secrets/DB-USERNAME/)" \
  DB_PASSWORD="@Microsoft.KeyVault(SecretUri=https://idor-poc-vault.vault.azure.net/secrets/DB-PASSWORD/)" \
  JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://idor-poc-vault.vault.azure.net/secrets/JWT-SECRET/)"
```

### **Step 5.4: Deploy JAR File**

```bash
# Option 1: Using Azure CLI
az webapp deployment source config-zip \
  --resource-group idor-poc-rg \
  --name idor-poc-app \
  --src target/project-0.0.1-SNAPSHOT.jar

# Option 2: Using FTP (if Option 1 fails)
az webapp up \
  --resource-group idor-poc-rg \
  --name idor-poc-app \
  --runtime "JAVA|21-java21" \
  --jar-path target/project-0.0.1-SNAPSHOT.jar
```

### **Step 5.5: Configure Startup File**

Create `web.config` in your project root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="httpPlatform" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" />
    </handlers>
    <httpPlatform processPath="%JAVA_HOME%\bin\java.exe" arguments="-jar &quot;%HOME%\site\wwwroot\project-0.0.1-SNAPSHOT.jar&quot;" startupTimeLimit="60" requestTimeout="300" />
  </system.webServer>
</configuration>
```

---

## **Phase 6: Verify Deployment**

### **Step 6.1: Check App Service Logs**

```bash
az webapp log tail \
  --resource-group idor-poc-rg \
  --name idor-poc-app
```

### **Step 6.2: Get App URL**

```bash
az webapp show \
  --resource-group idor-poc-rg \
  --name idor-poc-app \
  --query defaultHostName
```

### **Step 6.3: Test API Endpoints**

```bash
# Test registration
curl -X POST "https://idor-poc-app.azurewebsites.net/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST "https://idor-poc-app.azurewebsites.net/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## **Phase 7: HTTPS & Custom Domain (Optional)**

### **Step 7.1: Enable HTTPS**

```bash
# HTTPS is enabled by default on azurewebsites.net domain
# Get your certificate info
az webapp show-binding \
  --resource-group idor-poc-rg \
  --name idor-poc-app
```

### **Step 7.2: Add Custom Domain (Optional)**

```bash
az webapp config hostname add \
  --resource-group idor-poc-rg \
  --webapp-name idor-poc-app \
  --hostname yourdomain.com
```

---

## **Phase 8: Monitoring & Logs**

### **Step 8.1: Enable Application Insights**

```bash
az monitor app-insights component create \
  --app-name idor-poc-insights \
  --location eastus \
  --resource-group idor-poc-rg \
  --application-type web
```

### **Step 8.2: Connect to App Service**

```bash
INSIGHTS_KEY=$(az monitor app-insights component show \
  --app-name idor-poc-insights \
  --resource-group idor-poc-rg \
  --query instrumentationKey -o tsv)

az webapp config appsettings set \
  --resource-group idor-poc-rg \
  --name idor-poc-app \
  --settings "APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=$INSIGHTS_KEY"
```

---

## **Phase 9: Backup & Recovery**

### **Step 9.1: Enable Automated Backups for MySQL**

```bash
az mysql flexible-server backup create \
  --resource-group idor-poc-rg \
  --name idor-poc-mysql \
  --backup-name manual-backup-1
```

### **Step 9.2: Configure Backup Retention**

```bash
az mysql flexible-server update \
  --resource-group idor-poc-rg \
  --name idor-poc-mysql \
  --backup-retention 7
```

---

## **Phase 10: Security Best Practices**

### **✅ Credentials Management**
- ✅ Never commit credentials to Git
- ✅ Use Azure Key Vault for all secrets
- ✅ Use managed identities (no passwords in connection strings)
- ✅ Rotate secrets regularly

### **✅ Network Security**
- ✅ Enable SSL/TLS for database connections (already configured)
- ✅ Restrict database firewall to only Azure services
- ✅ Use private endpoints (optional, for extra security)

### **✅ Application Security**
- ✅ Run with Spring Security enabled
- ✅ Use HTTPS only (enabled by default on Azure)
- ✅ Enable CORS only for trusted domains
- ✅ Keep JWT secret strong and random

### **✅ Monitoring**
- ✅ Enable Application Insights
- ✅ Monitor logs for errors
- ✅ Set up alerts for failures

---

## **Complete Deployment Checklist**

```
Phase 1: Application Preparation
  [ ] Created application-prod.properties
  [ ] Updated POM.XML
  [ ] Built JAR file (mvnw clean package)
  
Phase 2: Azure Resources
  [ ] Created Resource Group
  [ ] Created MySQL Server
  [ ] Created Database
  [ ] Configured Firewall
  
Phase 3: Key Vault
  [ ] Created Key Vault
  [ ] Stored DB_URL
  [ ] Stored DB_USERNAME
  [ ] Stored DB_PASSWORD
  [ ] Stored JWT_SECRET
  
Phase 4: App Service
  [ ] Created App Service Plan
  [ ] Created Web App
  
Phase 5: Deployment
  [ ] Assigned Managed Identity
  [ ] Granted Key Vault access
  [ ] Configured App Settings
  [ ] Deployed JAR file
  [ ] Verified in logs
  
Phase 6: Testing
  [ ] Tested registration endpoint
  [ ] Tested login endpoint
  [ ] Tested document endpoints
  [ ] Verified database connectivity
  
Phase 7: Monitoring
  [ ] Enabled Application Insights
  [ ] Set up log monitoring
  [ ] Configured alerts
  
Phase 8: Cleanup
  [ ] Disabled local DevTools
  [ ] Verified no hardcoded secrets
  [ ] Tested all endpoints one final time
```

---

## **Troubleshooting**

### **Issue: "Access Denied" to Database**
- Check MySQL firewall rules
- Verify credentials in Key Vault
- Ensure managed identity has Key Vault access

### **Issue: App crashes on startup**
- Check logs: `az webapp log tail --resource-group idor-poc-rg --name idor-poc-app`
- Verify environment variables are set
- Check database connectivity

### **Issue: Key Vault secrets not loading**
- Verify managed identity created: `az webapp identity show ...`
- Check Key Vault policy: `az keyvault show-deleted ...`
- Restart app: `az webapp restart ...`

### **Deploy JAR Using Alternative Method**

If deployment fails, use Azure Portal:
1. Go to your App Service
2. Go to "Deployment Center"
3. Choose "Local Git"
4. Set credentials and deploy via Git push

---

## **Final Commands Reference**

```bash
# Get all resources created
az resource list --resource-group idor-poc-rg --output table

# View app logs
az webapp log tail --resource-group idor-poc-rg --name idor-poc-app --lines 100

# Restart app
az webapp restart --resource-group idor-poc-rg --name idor-poc-app

# View app settings
az webapp config appsettings list --resource-group idor-poc-rg --name idor-poc-app

# Delete all resources (cleanup)
az group delete --resource-group idor-poc-rg --yes --no-wait
```

---

## **Your App URLs**

After deployment, your endpoints will be at:

```
https://idor-poc-app.azurewebsites.net/api/auth/register
https://idor-poc-app.azurewebsites.net/api/auth/login
https://idor-poc-app.azurewebsites.net/api/documents/create
https://idor-poc-app.azurewebsites.net/api/documents/{id}
https://idor-poc-app.azurewebsites.net/api/documents/user/{userId}
```

---

**Deployment complete! Your IDOR POC is now live on Azure.** ✅
