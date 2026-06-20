# TASK 4 - ADMINISTRATION, MONITORING & ANALYTICS

Act as a senior backend engineer, software architect, database designer, and cloud architect.

Do NOT start coding immediately.

First, analyze the project architecture, business requirements, administration workflows, monitoring requirements, reporting requirements, database design, API design, security requirements, RBAC strategy, and Zoho integrations.

Understand the entire administration workflow before proposing implementation.

If any information is missing, ask questions first.

Only after analysis and approval should implementation begin.

---

# Project Context

Project: TLU FOOD

Architecture:

* ReactJS Frontend
* NodeJS + Express Backend
* MVC + Service Layer
* MySQL
* Google Cloud SQL
* Google Cloud Storage
* Google Cloud Run
* Zoho Integrations

---

# Module Name

Administration, Monitoring & Analytics

---

# Business Goal

Provide a centralized administration system that allows administrators to manage users, canteens, delivery staff, orders, analytics, support operations, and platform monitoring.

Administrators must have visibility across the entire platform while maintaining security and auditability.

This module serves as the operational control center of the TLU FOOD platform.

---

# User Roles

## ADMIN

Permissions:

* View Dashboard
* Manage Users
* Manage Canteens
* Manage Delivery Staff
* Manage Orders
* Manage Contracts
* Manage Support Tickets
* View Revenue Analytics
* View System Metrics
* Configure Platform Settings

---

## SUPER_ADMIN

Permissions:

* All ADMIN permissions
* Manage Admin Accounts
* Manage System Configuration
* Manage Security Policies
* Manage API Credentials
* Manage Secrets

---

# Functional Requirements

## Admin Dashboard

Dashboard should display:

* Total Users
* Total Students
* Total Lecturers
* Total Canteens
* Total Delivery Staff
* Total Orders
* Total Revenue
* Daily Revenue
* Weekly Revenue
* Monthly Revenue

Dashboard should support:

* Date Filters
* Revenue Charts
* Order Trends
* User Growth Trends

---

## User Management

Admin can:

* View Users
* Search Users
* Filter Users
* View User Profiles
* Lock Accounts
* Unlock Accounts
* Suspend Accounts
* Restore Accounts

User Roles:

* STUDENT
* LECTURER
* CANTEEN_OWNER
* DELIVERY_STAFF
* ADMIN
* SUPER_ADMIN

Questions to analyze:

* What actions require audit logs?
* Should admins be able to change user roles?
* What approval process is required?

---

## Canteen Management

Admin can:

* View All Canteens
* Approve New Canteens
* Reject Applications
* Suspend Canteens
* Activate Canteens

Admin can view:

* Store Details
* Store Revenue
* Store Performance
* Customer Ratings

Questions to analyze:

* What approval workflow is required?
* What status lifecycle should canteens have?

---

## Delivery Staff Management

Admin can:

* View Delivery Staff
* Activate Accounts
* Suspend Accounts
* Assign Orders
* View Delivery Performance

Metrics:

* Total Deliveries
* Completion Rate
* Average Delivery Time
* Cancellation Rate

Questions to analyze:

* Manual assignment vs auto assignment?
* What delivery statuses are required?

---

## Order Administration

Admin can:

* View All Orders
* Search Orders
* Filter Orders
* View Order Timeline
* View Order Audit Logs
* Resolve Order Disputes

Admin can:

* Cancel Orders
* Reopen Investigations
* Escalate Issues

Questions to analyze:

* Which actions should require justification?
* What order events must be logged?

---

## Platform Monitoring

Admin can monitor:

* API Health
* Database Health
* Storage Usage
* Cloud Run Status
* Error Rates
* Failed Jobs
* Integration Failures

Questions to analyze:

* Which metrics should be stored locally?
* Which metrics should come directly from cloud providers?

---

## Audit Logging

System must log:

* Login Events
* Failed Login Attempts
* Account Lock Events
* Role Changes
* Order Status Changes
* Canteen Approvals
* Contract Actions
* Admin Actions

Requirements:

* Immutable Logs
* Searchable Logs
* Time-based Filtering

Questions to analyze:

* Retention Policy?
* Security Requirements?
* Compliance Considerations?

---

## Revenue Analytics

Admin can view:

* Daily Revenue
* Weekly Revenue
* Monthly Revenue
* Revenue By Canteen
* Revenue By Food Category
* Revenue Trends
* Top Selling Foods

Reports:

* Revenue Report
* Order Report
* User Activity Report
* Delivery Performance Report

Questions to analyze:

* Should reports be generated dynamically?
* Should reports be cached?
* Export formats required?

---

## Platform Settings

Admin can configure:

* Platform Information
* Contact Information
* Order Policies
* Delivery Policies
* Notification Settings

Questions to analyze:

* Which settings require versioning?
* Which settings require audit tracking?

---

# Zoho Integrations

## Zoho Analytics

Purpose:

Revenue Analytics & Reporting

Expected Features:

* Revenue Dashboard
* Order Analytics
* Customer Analytics
* Store Performance Analytics

Questions to analyze:

* Which data should sync to Zoho Analytics?
* Sync frequency?
* ETL strategy?

---

## Zoho CRM

Purpose:

Partner & Canteen Relationship Management

Expected Features:

* Partner Database
* Canteen Lifecycle Tracking
* Partner Communications
* Contract Monitoring

Questions to analyze:

* What partner lifecycle states are required?
* Which data should sync bi-directionally?

---

## Zoho Desk

Purpose:

Support & Ticket Management

Expected Features:

* Customer Complaints
* Delivery Issues
* Account Support
* Technical Support

Questions to analyze:

* Ticket workflow?
* Escalation process?
* SLA requirements?

---

## Zoho Vault

Purpose:

Secrets Management

Expected Features:

* API Key Storage
* Access Control
* Secret Rotation

Questions to analyze:

* Secret ownership model?
* Rotation policy?
* Emergency access procedure?

---

# Database Design Requirements

Before implementation:

Analyze and propose tables for:

* admin_users
* admin_roles
* permissions
* role_permissions
* audit_logs
* admin_activity_logs
* revenue_reports
* analytics_snapshots
* platform_settings
* support_tickets
* support_ticket_comments
* delivery_staff_profiles

Identify:

* Primary Keys
* Foreign Keys
* Indexes
* Constraints

Explain the reasoning.

---

# Security Requirements

Analyze and propose:

* RBAC Strategy
* Permission-Based Access Control
* Audit Requirements
* Secret Management
* Session Security
* API Security

Requirements:

* Admin actions must be auditable
* Sensitive operations require authorization
* Critical actions require logging

Questions to analyze:

* Which operations require additional verification?
* Which actions require approval workflow?

---

# Architecture Requirements

Backend Pattern:

MVC + Service Layer

Controllers:

* Request handling only

Services:

* Business logic only

Models:

* Database access only

Middleware:

* Authentication
* Authorization
* Permission Checking
* Validation
* Audit Logging

No business logic inside controllers.

---

# API Design Requirements

Analyze and propose APIs for:

## Dashboard

* Get Dashboard Summary
* Get Revenue Analytics
* Get User Analytics

## User Management

* Get Users
* Get User Details
* Lock User
* Unlock User
* Update User Role

## Canteen Management

* Get Canteens
* Approve Canteen
* Reject Canteen
* Suspend Canteen

## Delivery Staff

* Get Delivery Staff
* Assign Delivery
* Suspend Delivery Staff

## Audit Logs

* Get Audit Logs
* Search Logs

## Support

* Get Tickets
* Update Ticket
* Escalate Ticket

Include:

* Request Payload
* Response Payload
* Validation Rules
* Error Cases

---

# Required Deliverables

Phase 1:

1. Analyze Requirements
2. Identify Missing Requirements
3. Identify Risks
4. Suggest Architecture
5. Suggest Database Schema
6. Suggest API Design
7. Suggest RBAC Strategy
8. Suggest Audit Strategy
9. Suggest Monitoring Strategy
10. Suggest Zoho Integration Strategy

Wait for approval.

Do NOT generate code yet.

Phase 2 (after approval):

1. Database Schema
2. Models
3. Services
4. Controllers
5. Routes
6. Validators
7. Middleware
8. RBAC System
9. Audit Logging System
10. Analytics Services
11. Monitoring Services
12. Zoho Integration Layer
13. API Documentation

Start by analyzing the administration workflow, permission model, analytics requirements, and monitoring architecture.
