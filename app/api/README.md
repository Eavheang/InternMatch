# Intern Match API Documentation

This document provides comprehensive documentation for the Intern Match API endpoints. The API is built with Next.js 15+ and uses Drizzle ORM with PostgreSQL.

## Base URL

```
http://localhost:3000/api
```

## Authentication & Authorization

The API uses **JWT Bearer token authentication** with **middleware-based security** and **role-based access control (RBAC)**.

### 🔐 Authentication Flow

1. **Register/Login** to get a JWT token
2. **Include token** in all protected requests
3. **Middleware automatically** validates tokens and extracts user info
4. **Route-level checks** verify roles and ownership

### 📋 Bearer Token Usage

Include the JWT token in the Authorization header for all protected endpoints:

```bash
Authorization: Bearer <your-jwt-token>
```

**Example:**

```bash
curl -X GET http://localhost:3000/api/company/user-id/job \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 🛡️ Security Features

- **Automatic Token Validation:** Middleware validates JWT tokens globally
- **Role-Based Access Control:** Different permissions for `student` vs `company` roles
- **Ownership Verification:** Users can only access their own resources
- **Stateless Authentication:** JWT tokens contain all necessary user information
- **Token Expiration:** Automatic security through JWT expiration

### 🔒 Protected vs Public Routes

#### **Protected Routes (Require Bearer Token):**

- `/api/auth/me` - User profile
- `/api/company/*` - Company operations
- `/api/students/*` - Student operations
- `/api/job/*` - Job operations (except public GET)

#### **Public Routes (No Token Required):**

- `/api/auth/login` - Login
- `/api/auth/register` - Registration
- `/api/auth/verify-email` - Email verification
- `/api/auth/forgot-password` - Password reset
- `/api/auth/reset-password` - Password reset
- `/api/job` (GET) - Browse jobs
- `/api/company` (GET) - Browse companies
- `/api/students` (GET) - Browse students

### ⚠️ Authentication Errors

**401 Unauthorized:**

```json
{
  "error": "Authorization token required"
}
```

**401 Invalid Token:**

```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden:**

```json
{
  "error": "Only students can apply for jobs"
}
```

**403 Access Denied:**

```json
{
  "error": "Access denied: You can only manage your own company's jobs"
}
```

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
- [Student Endpoints](#student-endpoints)
- [Company Endpoints](#company-endpoints)
- [Job Endpoints](#job-endpoints)
- [Application Endpoints](#application-endpoints)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user (student or company).

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "student", // or "company"
  "firstName": "John", // required for students
  "lastName": "Doe", // required for students
  "companyName": "Tech Corp", // required for companies
  "university": "Stanford University", // optional for students
  "major": "Computer Science", // optional for students
  "industry": "Technology", // optional for companies
  "companySize": "50-200", // optional for companies
  "website": "https://techcorp.com", // optional for companies
  "location": "San Francisco, CA" // optional for both
}
```

**Response:**

```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "student",
    "isVerified": false
  }
}
```

### Login User

**POST** `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "student",
    "isVerified": true,
    "createdAt": "2025-10-23T00:00:00.000Z",
    "profile": {
      "id": "profile-uuid",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Verify Email

**POST** `/api/auth/verify-email`

Verify user email with verification code.

**Request Body:**

```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

### Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

### Reset Password

**POST** `/api/auth/reset-password`

Reset password with reset token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "resetToken": "reset-token",
  "newPassword": "newSecurePassword123"
}
```

### Get Current User

**GET** `/api/auth/me`

Get current authenticated user's profile.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

---

## Student Endpoints

### Get All Students

**GET** `/api/students`

Get a list of verified students (for companies to browse).

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `university` (optional): Filter by university
- `major` (optional): Filter by major
- `skills` (optional): Filter by skills

**Example:**

```
GET /api/students?page=1&limit=20&university=Stanford&major=Computer Science
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "university": "Stanford University",
      "major": "Computer Science",
      "graduationYear": 2025,
      "location": "San Francisco, CA",
      "careerInterest": "Software Engineering",
      "isVerified": true,
      "createdAt": "2025-10-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Get Student Profile

**GET** `/api/students/{studentId}`

Get detailed student profile by student ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "student-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "gmail": "john.doe@gmail.com",
    "phoneNumber": "+1234567890",
    "location": "San Francisco, CA",
    "university": "Stanford University",
    "major": "Computer Science",
    "graduationYear": 2025,
    "gpa": 3.8,
    "resumeUrl": "https://example.com/resume.pdf",
    "careerInterest": "Software Engineering",
    "aboutMe": "Passionate about technology...",
    "createdAt": "2025-10-23T00:00:00.000Z"
  }
}
```

---

## Company Endpoints

### Get All Companies

**GET** `/api/company`

Get a list of verified companies (for students to browse).

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `industry` (optional): Filter by industry
- `companySize` (optional): Filter by company size
- `location` (optional): Filter by location
- `keyword` (optional): Search keyword

**Example:**

```
GET /api/company?page=1&limit=20&industry=Technology&location=San Francisco
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "company-uuid",
      "userId": "user-uuid",
      "companyName": "Tech Corp",
      "industry": "Technology",
      "companySize": "50-200",
      "website": "https://techcorp.com",
      "companyLogo": "https://techcorp.com/logo.png",
      "location": "San Francisco, CA",
      "description": "Leading technology company...",
      "contactName": "John Doe",
      "contactEmail": "john@techcorp.com",
      "isVerified": true,
      "createdAt": "2025-10-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

### Get Company Profile

**GET** `/api/company/{userId}`

Get company profile by user ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "company-uuid",
    "userId": "user-uuid",
    "companyName": "Tech Corp",
    "industry": "Technology",
    "companySize": "50-200",
    "website": "https://techcorp.com",
    "companyLogo": "https://techcorp.com/logo.png",
    "location": "San Francisco, CA",
    "description": "Leading technology company...",
    "contactName": "John Doe",
    "contactEmail": "john@techcorp.com",
    "isVerified": true,
    "profileCreatedAt": "2025-10-23T00:00:00.000Z"
  }
}
```

### Create Job Posting

**POST** `/api/company/{userId}/job`

Create a new job posting for the company. **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only create jobs for their own account.

**Request Body:**

```json
{
  "jobTitle": "Software Engineer Intern",
  "jobDescription": "We are looking for a motivated software engineering intern...",
  "requirements": [
    "Currently enrolled in Computer Science or related field",
    "Experience with JavaScript/TypeScript",
    "Knowledge of React or similar frontend framework",
    "Strong problem-solving skills"
  ],
  "benefits": [
    "Competitive stipend",
    "Mentorship program",
    "Flexible working hours",
    "Career development opportunities"
  ],
  "salaryRange": "$20-25/hour",
  "location": "San Francisco, CA",
  "jobType": "internship",
  "experienceLevel": "entry",
  "aiGenerated": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job-uuid",
    "companyId": "company-uuid",
    "jobTitle": "Software Engineer Intern",
    "jobDescription": "We are looking for a motivated software engineering intern...",
    "status": "draft",
    "requirements": ["Currently enrolled in Computer Science..."],
    "benefits": ["Competitive stipend..."],
    "salaryRange": "$20-25/hour",
    "location": "San Francisco, CA",
    "jobType": "internship",
    "experienceLevel": "entry",
    "aiGenerated": false,
    "createdAt": "2025-10-23T00:00:00.000Z",
    "updatedAt": "2025-10-23T00:00:00.000Z"
  },
  "message": "Job posting created successfully"
}
```

### Get Company Jobs

**GET** `/api/company/{userId}/job`

Get all job postings for a specific company. **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only view their own jobs.

**Query Parameters:**

- `status` (optional): Filter by status (open, closed, draft)
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "company": {
      "id": "company-uuid",
      "companyName": "Tech Corp"
    },
    "jobs": [
      {
        "id": "job-uuid",
        "jobTitle": "Software Engineer Intern",
        "jobDescription": "We are looking for...",
        "status": "open",
        "requirements": ["Currently enrolled..."],
        "benefits": ["Competitive stipend..."],
        "salaryRange": "$20-25/hour",
        "location": "San Francisco, CA",
        "jobType": "internship",
        "experienceLevel": "entry",
        "aiGenerated": false,
        "createdAt": "2025-10-23T00:00:00.000Z",
        "updatedAt": "2025-10-23T00:00:00.000Z",
        "applicationCount": 5
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Update Job Posting

**PUT** `/api/company/{userId}/job/{jobId}`

Update an existing job posting. **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only update their own jobs.

**Request Body:**

```json
{
  "jobTitle": "Senior Software Engineer Intern",
  "jobDescription": "Updated job description...",
  "status": "open",
  "requirements": [
    "Bachelor's degree in Computer Science",
    "3+ years experience with JavaScript/TypeScript"
  ],
  "benefits": ["Competitive salary", "Health insurance", "401k matching"],
  "salaryRange": "$30-35/hour",
  "location": "Remote",
  "jobType": "full-time",
  "experienceLevel": "mid",
  "aiGenerated": true
}
```

### Delete Job Posting

**DELETE** `/api/company/{userId}/job/{jobId}`

Delete a job posting. **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only delete their own jobs.

**Response:**

```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

---

## Job Endpoints

### Get All Jobs

**GET** `/api/job`

Get a list of open job postings (for students to browse).

**Query Parameters:**

- `status` (optional): Filter by status (default: open)
- `jobType` (optional): Filter by job type (full-time, part-time, internship, contract)
- `experienceLevel` (optional): Filter by experience level (entry, mid, senior, executive)
- `location` (optional): Filter by location
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example:**

```
GET /api/job?jobType=internship&experienceLevel=entry&location=San Francisco
```

**Response:**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid",
        "jobTitle": "Software Engineer Intern",
        "jobDescription": "We are looking for...",
        "status": "open",
        "requirements": ["Currently enrolled..."],
        "benefits": ["Competitive stipend..."],
        "salaryRange": "$20-25/hour",
        "location": "San Francisco, CA",
        "jobType": "internship",
        "experienceLevel": "entry",
        "aiGenerated": false,
        "createdAt": "2025-10-23T00:00:00.000Z",
        "updatedAt": "2025-10-23T00:00:00.000Z",
        "company": {
          "id": "company-uuid",
          "companyName": "Tech Corp",
          "industry": "Technology",
          "companySize": "50-200",
          "website": "https://techcorp.com",
          "companyLogo": "https://techcorp.com/logo.png",
          "companyLocation": "San Francisco, CA",
          "description": "Leading technology company..."
        }
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Job Details

**GET** `/api/job/{jobId}`

Get detailed information about a specific job.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "job-uuid",
    "jobTitle": "Software Engineer Intern",
    "jobDescription": "We are looking for...",
    "status": "open",
    "requirements": ["Currently enrolled..."],
    "benefits": ["Competitive stipend..."],
    "salaryRange": "$20-25/hour",
    "location": "San Francisco, CA",
    "jobType": "internship",
    "experienceLevel": "entry",
    "aiGenerated": false,
    "createdAt": "2025-10-23T00:00:00.000Z",
    "updatedAt": "2025-10-23T00:00:00.000Z",
    "applicationCount": 5,
    "company": {
      "id": "company-uuid",
      "companyName": "Tech Corp",
      "industry": "Technology",
      "companySize": "50-200",
      "website": "https://techcorp.com",
      "companyLogo": "https://techcorp.com/logo.png",
      "companyLocation": "San Francisco, CA",
      "description": "Leading technology company...",
      "contactName": "John Doe",
      "contactEmail": "john@techcorp.com"
    }
  }
}
```

### Apply for Job

**POST** `/api/job/{jobId}/apply`

Apply for a specific job posting. **Requires student authentication.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Request Body:**

```json
{
  "coverLetter": "I am very interested in this position because...",
  "aiGeneratedQuestions": [
    "Why are you interested in this role?",
    "What relevant experience do you have?"
  ]
}
```

**Note:** The `studentId` is automatically resolved from the authenticated user's JWT token. No need to include `userId` in the request body.

**Response:**

```json
{
  "success": true,
  "data": {
    "application": {
      "id": "application-uuid",
      "studentId": "student-uuid",
      "jobId": "job-uuid",
      "status": "applied",
      "coverLetter": "I am very interested...",
      "aiGeneratedQuestions": ["Why are you interested..."],
      "appliedAt": "2025-10-23T00:00:00.000Z",
      "updatedAt": "2025-10-23T00:00:00.000Z"
    },
    "job": {
      "id": "job-uuid",
      "jobTitle": "Software Engineer Intern",
      "companyName": "Tech Corp"
    },
    "student": {
      "id": "student-uuid",
      "userId": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@student.com"
    }
  },
  "message": "Application submitted successfully"
}
```

### Check Application Status

**GET** `/api/job/{jobId}/apply`

Check if a student has applied for a specific job. **Requires student authentication.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `studentId` is automatically resolved from the authenticated user's JWT token. No query parameters needed.

**Response:**

```json
{
  "success": true,
  "data": {
    "hasApplied": true,
    "application": {
      "id": "application-uuid",
      "status": "applied",
      "coverLetter": "I am very interested...",
      "appliedAt": "2025-10-23T00:00:00.000Z",
      "updatedAt": "2025-10-23T00:00:00.000Z"
    }
  }
}
```

---

## Application Endpoints

### Get Company Applications

**GET** `/api/company/{userId}/applications`

Get all applications for a company's jobs. **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only view applications for their own jobs.

**Query Parameters:**

- `jobId` (optional): Filter by specific job
- `status` (optional): Filter by application status (applied, shortlisted, rejected, interviewed, hired)
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example:**

```
GET /api/company/db47e167-47c0-4b41-bc84-d16b11b534d5/applications?jobId=job-uuid&status=applied
```

**Response:**

```json
{
  "success": true,
  "data": {
    "company": {
      "id": "company-uuid",
      "companyName": "Tech Corp"
    },
    "applications": [
      {
        "application": {
          "id": "application-uuid",
          "status": "applied",
          "coverLetter": "I am very interested...",
          "aiGeneratedQuestions": ["Why are you interested..."],
          "appliedAt": "2025-10-23T00:00:00.000Z",
          "updatedAt": "2025-10-23T00:00:00.000Z"
        },
        "student": {
          "id": "student-uuid",
          "firstName": "John",
          "lastName": "Doe",
          "gmail": "john.doe@gmail.com",
          "phoneNumber": "+1234567890",
          "location": "San Francisco, CA",
          "university": "Stanford University",
          "major": "Computer Science",
          "graduationYear": 2025,
          "gpa": 3.8,
          "resumeUrl": "https://example.com/resume.pdf",
          "careerInterest": "Software Engineering",
          "aboutMe": "Passionate about technology...",
          "createdAt": "2025-10-23T00:00:00.000Z"
        },
        "user": {
          "email": "john@student.com",
          "isVerified": true
        },
        "job": {
          "id": "job-uuid",
          "jobTitle": "Software Engineer Intern",
          "jobDescription": "We are looking for...",
          "status": "open",
          "location": "San Francisco, CA",
          "jobType": "internship",
          "experienceLevel": "entry",
          "createdAt": "2025-10-23T00:00:00.000Z"
        }
      }
    ],
    "statistics": [
      {
        "status": "applied",
        "count": 5
      },
      {
        "status": "shortlisted",
        "count": 2
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Application Details

**GET** `/api/company/{userId}/applications/{applicationId}`

Get detailed information about a specific application. **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only view applications for their own jobs.

**Response:**

```json
{
  "success": true,
  "data": {
    "application": {
      "id": "application-uuid",
      "studentId": "student-uuid",
      "jobId": "job-uuid",
      "status": "applied",
      "coverLetter": "I am very interested...",
      "aiGeneratedQuestions": ["Why are you interested..."],
      "appliedAt": "2025-10-23T00:00:00.000Z",
      "updatedAt": "2025-10-23T00:00:00.000Z"
    },
    "student": {
      "id": "student-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "gmail": "john.doe@gmail.com",
      "phoneNumber": "+1234567890",
      "location": "San Francisco, CA",
      "university": "Stanford University",
      "major": "Computer Science",
      "graduationYear": 2025,
      "gpa": 3.8,
      "resumeUrl": "https://example.com/resume.pdf",
      "careerInterest": "Software Engineering",
      "aboutMe": "Passionate about technology...",
      "createdAt": "2025-10-23T00:00:00.000Z"
    },
    "user": {
      "email": "john@student.com",
      "isVerified": true
    },
    "job": {
      "id": "job-uuid",
      "jobTitle": "Software Engineer Intern",
      "jobDescription": "We are looking for...",
      "status": "open",
      "location": "San Francisco, CA",
      "jobType": "internship",
      "experienceLevel": "entry",
      "createdAt": "2025-10-23T00:00:00.000Z"
    },
    "company": {
      "companyName": "Tech Corp"
    }
  }
}
```

### Update Application Status

**PUT** `/api/company/{userId}/applications/{applicationId}`

Update the status of an application (shortlist, reject, interview, hire). **Requires company authentication and ownership verification.**

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Note:** The `userId` in the URL must match the authenticated user's ID. Companies can only update applications for their own jobs.

**Request Body:**

```json
{
  "status": "shortlisted"
}
```

**Available Status Values:**

- `"applied"` - Initial status when student applies
- `"shortlisted"` - Company has reviewed and shortlisted the candidate
- `"rejected"` - Company has rejected the application
- `"interviewed"` - Candidate has been interviewed
- `"hired"` - Candidate has been hired

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "application-uuid",
    "studentId": "student-uuid",
    "jobId": "job-uuid",
    "status": "shortlisted",
    "coverLetter": "I am very interested...",
    "aiGeneratedQuestions": ["Why are you interested..."],
    "appliedAt": "2025-10-23T00:00:00.000Z",
    "updatedAt": "2025-10-23T00:00:00.000Z"
  },
  "message": "Application status updated to shortlisted"
}
```

---

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

### Common Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "error": "Missing required fields: email and password are required"
}
```

**401 Unauthorized:**

```json
{
  "error": "Invalid email or password"
}
```

**403 Forbidden:**

```json
{
  "error": "Please verify your email before logging in",
  "requiresVerification": true,
  "email": "user@example.com"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "Job not found"
}
```

**409 Conflict:**

```json
{
  "success": false,
  "error": "You have already applied for this job"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Failed to create job posting",
  "message": "Detailed error description"
}
```

---

## Data Models

### User

```typescript
{
  id: string; // UUID
  email: string;
  password: string; // Hashed
  role: "student" | "company";
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  createdAt: Date;
}
```

### Student

```typescript
{
  id: string; // UUID
  userId: string; // Foreign key to users.id
  firstName: string;
  lastName: string;
  gmail?: string;
  phoneNumber?: string;
  location?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  resumeUrl?: string;
  careerInterest?: string;
  aboutMe?: string;
  createdAt: Date;
}
```

### Company

```typescript
{
  id: string; // UUID
  userId: string; // Foreign key to users.id
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  companyLogo?: string;
  location?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  createdAt: Date;
}
```

### Job Posting

```typescript
{
  id: string; // UUID
  companyId: string; // Foreign key to companies.id
  jobTitle: string;
  jobDescription: string;
  status: "open" | "closed" | "draft";
  requirements?: string[]; // JSON array
  benefits?: string[]; // JSON array
  salaryRange?: string;
  location?: string;
  jobType?: "full-time" | "part-time" | "internship" | "contract";
  experienceLevel?: "entry" | "mid" | "senior" | "executive";
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Application

```typescript
{
  id: string; // UUID
  studentId: string; // Foreign key to students.id
  jobId: string; // Foreign key to jobPostings.id
  status: "applied" | "shortlisted" | "rejected" | "interviewed" | "hired";
  aiGeneratedQuestions?: string[]; // JSON array
  coverLetter?: string;
  appliedAt: Date;
  updatedAt: Date;
}
```

---

## Usage Examples

### Complete Workflow Example

1. **Register as a company:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@techcorp.com",
    "password": "securePassword123",
    "role": "company",
    "companyName": "Tech Corp",
    "industry": "Technology",
    "companySize": "50-200",
    "website": "https://techcorp.com",
    "location": "San Francisco, CA"
  }'
```

2. **Verify email:**

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@techcorp.com",
    "verificationCode": "123456"
  }'
```

3. **Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@techcorp.com",
    "password": "securePassword123"
  }'
```

4. **Create a job posting:**

```bash
curl -X POST http://localhost:3000/api/company/{userId}/job \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt-token}" \
  -d '{
    "jobTitle": "Software Engineer Intern",
    "jobDescription": "We are looking for a motivated software engineering intern...",
    "requirements": ["Currently enrolled in Computer Science"],
    "benefits": ["Competitive stipend"],
    "salaryRange": "$20-25/hour",
    "location": "San Francisco, CA",
    "jobType": "internship",
    "experienceLevel": "entry"
  }'
```

5. **Update job status to open:**

```bash
curl -X PUT http://localhost:3000/api/company/{userId}/job/{jobId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt-token}" \
  -d '{
    "status": "open"
  }'
```

6. **Student applies for job:**

```bash
curl -X POST http://localhost:3000/api/job/{jobId}/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {student-jwt-token}" \
  -d '{
    "coverLetter": "I am very interested in this position...",
    "aiGeneratedQuestions": ["Why are you interested in this role?"]
  }'
```

7. **Student checks application status:**

```bash
curl -X GET http://localhost:3000/api/job/{jobId}/apply \
  -H "Authorization: Bearer {student-jwt-token}"
```

8. **Company views applications:**

```bash
curl -X GET "http://localhost:3000/api/company/{userId}/applications?jobId={jobId}" \
  -H "Authorization: Bearer {company-jwt-token}"
```

9. **Company shortlists candidate:**

```bash
curl -X PUT http://localhost:3000/api/company/{userId}/applications/{applicationId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {company-jwt-token}" \
  -d '{
    "status": "shortlisted"
  }'
```

---

## Notes

### 🔐 Security Implementation

- **Middleware-Based Authentication:** Global JWT token validation via Next.js middleware
- **Automatic User Resolution:** User information automatically extracted from JWT tokens
- **Role-Based Access Control:** Different permissions for `student` vs `company` roles
- **Ownership Verification:** Users can only access/modify their own resources
- **Stateless Architecture:** JWT tokens contain all necessary user information

### 📋 Technical Details

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all primary keys
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Email verification is required before login
- Only verified users can perform most actions

### 🛡️ Security Rules

- **Companies:** Can only manage their own jobs and applications
- **Students:** Can only apply for open jobs and view their own applications
- **Authentication:** Required for all protected endpoints
- **Authorization:** Role-based access control enforced
- **Ownership:** Users can only access resources they own

### 🔄 API Behavior

- All endpoints return consistent response formats
- Pagination is available for list endpoints
- Filtering and searching capabilities are built-in
- Error responses follow standard HTTP status codes
- Bearer token authentication is required for protected routes

### 🚀 Getting Started

1. **Register** a user account (student or company)
2. **Verify** your email address
3. **Login** to get a JWT token
4. **Include** the token in Authorization header for protected requests
5. **Follow** role-based permissions (students apply, companies manage)

For more detailed information about specific endpoints or error handling, please refer to the individual route files in the codebase.
