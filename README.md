# 🌍 Online Tourist Planner
## Full Stack Web Application
### Spring Boot + ReactJS + MySQL

---

## 📋 Project Overview

A complete enterprise-level full stack application for managing travel packages, vehicle booking, and admin analytics.

**Tech Stack:** Java 17 | Spring Boot 3.2 | Spring Security (JWT) | Spring Data JPA | Hibernate | ReactJS | MySQL | Maven

---

## 🏗️ Project Structure

```
otp/
├── backend/             ← Spring Boot project
│   ├── pom.xml
│   └── src/main/java/com/otp/touristplanner/
│       ├── TouristPlannerApplication.java
│       ├── entity/       (User, Role, Vehicle, TourPackage, Booking, VehicleSchedule)
│       ├── repository/   (UserRepo, RoleRepo, VehicleRepo, PackageRepo, BookingRepo)
│       ├── dto/          (LoginRequest, RegisterRequest, JwtResponse, BookingRequest/Response)
│       ├── service/      (AuthService, VehicleService, PackageService, BookingService, EmailService, AdminService)
│       ├── controller/   (AuthController, VehicleController, PackageController, BookingController, AdminController, ReportController)
│       ├── security/     (JwtUtils, AuthTokenFilter, UserDetailsImpl, UserDetailsServiceImpl)
│       ├── config/       (SecurityConfig, DataInitializer)
│       └── exception/    (GlobalExceptionHandler)
│
├── frontend/            ← React App
│   ├── package.json
│   └── src/
│       ├── App.js        (Router setup)
│       ├── context/      (AuthContext with JWT management)
│       ├── services/     (api.js - Axios instance)
│       ├── components/   (UserLayout, AdminLayout)
│       └── pages/
│           ├── Login.js, Register.js
│           ├── user/  (UserDashboard, PackageListing, PackageDetails, BookingPage, MyBookings)
│           └── admin/ (AdminDashboard, VehicleManagement, PackageManagement, BookingManagement, ReportsPage)
│
└── database/
    └── schema.sql        ← MySQL schema reference
```

---

## ⚙️ Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+ & npm
- MySQL 8.0+

---

## 🚀 Setup Instructions

### Step 1: Database Setup

```sql
CREATE DATABASE tourist_planner_db;
```

> **Note:** Hibernate will auto-create tables on first run via `spring.jpa.hibernate.ddl-auto=update`

### Step 2: Configure Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root          # Your MySQL username
spring.datasource.password=root          # Your MySQL password

# Optional: Email (for booking confirmation)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password   # Generate App Password in Gmail settings
```

### Step 3: Run the Backend

```bash
cd otp/backend
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

✅ On first run, the DataInitializer seeds:
- Admin user: `admin` / `admin123`
- Test user: `user1` / `user123`
- 5 sample vehicles
- 6 travel packages (Goa, Kerala, Rajasthan, Manali, Andaman, Varanasi)

### Step 4: Run the Frontend

```bash
cd otp/frontend
npm install
npm start
```

Frontend starts at: **http://localhost:3000**

---

## 👤 Default Accounts

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| User  | user1    | user123   |

---

## 🔗 API Endpoints

| Method | Endpoint                         | Access       | Description                 |
|--------|----------------------------------|--------------|-----------------------------|
| POST   | /api/auth/login                  | Public       | Login + get JWT              |
| POST   | /api/auth/register               | Public       | Register new user            |
| GET    | /api/packages/public/all         | Public       | Browse all active packages   |
| GET    | /api/packages/public/{id}        | Public       | Package details              |
| GET    | /api/packages/public/search      | Public       | Search by destination        |
| GET    | /api/vehicles/available          | Auth         | Get available vehicles       |
| GET    | /api/vehicles/available?startDate=..&endDate=.. | Auth | Vehicles available for dates |
| POST   | /api/bookings                    | Auth         | Create booking               |
| GET    | /api/bookings/my-bookings        | Auth         | My bookings                  |
| PUT    | /api/bookings/{id}/cancel        | Auth         | Cancel booking               |
| POST   | /api/vehicles                    | Admin        | Add vehicle                  |
| PUT    | /api/vehicles/{id}               | Admin        | Update vehicle               |
| DELETE | /api/vehicles/{id}               | Admin        | Delete vehicle               |
| POST   | /api/packages                    | Admin        | Add package                  |
| GET    | /api/bookings/all                | Admin        | All bookings                 |
| GET    | /api/admin/dashboard             | Admin        | Analytics data               |
| GET    | /api/reports/summary             | Admin        | Reports summary              |
| GET    | /api/reports/bookings/excel      | Admin        | Download Excel report        |

---

## 📧 Email Configuration (Optional)

To enable booking confirmation emails:
1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Update `application.properties` with your Gmail and App Password

---

## 📖 Swagger API Documentation

Available at: **http://localhost:8080/swagger-ui.html**

---

## ✨ Features Summary

- 🔐 **JWT Authentication** with role-based access (ADMIN / USER)
- 🗺️ **Package Browsing** with search and filters
- 🚌 **Vehicle Booking** with date conflict prevention
- 💳 **Simulated Payment** (credit card form)
- 📧 **Email Notifications** (booking confirmation)
- 📊 **Admin Analytics** with Recharts (revenue, vehicle usage, popular packages)
- 📥 **Excel Report Export** via Apache POI
- 🛡️ **Global Exception Handling** with standardized error responses
- 🌱 **Auto Data Seeding** on first startup
