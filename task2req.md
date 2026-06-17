# TASK 2 - CANTEEN & MENU MANAGEMENT

Act as a senior backend engineer, software architect, and database designer.

Do NOT start coding immediately.

First, analyze the project architecture, requirements, business rules, database design, API design, security requirements, and Zoho integrations.

Understand the problem before proposing any implementation.

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

Canteen & Menu Management

---

# Business Goal

Allow canteen owners to manage their stores, menus, food images, orders, and revenue statistics.

This module must support multiple canteens in the same system.

Each canteen owner only has access to their own store data.

Administrators can access all canteens.

---

# User Roles

## CANTEEN_OWNER

Permissions:

* Manage Store
* Manage Menu
* Upload Food Images
* Manage Orders
* Update Order Status
* View Revenue Statistics


# Functional Requirements

## Store Management

Canteen owner can:

* Create Store
* Update Store Information
* Upload Store Logo
* Update Store Status

Store fields:

* name
* address
* description
* phone
* opening_hours
* logo_url
* status

---

## Menu Management

Canteen owner can:

* Create Food
* Update Food
* Delete Food
* Change Food Availability

Food fields:

* name
* description
* category
* price
* quantity
* image_url
* status

---

## Food Categories

Examples:

* Rice
* Noodles
* Drinks
* Snacks
* Fast Food

Category list should be extensible.

---

## Image Upload

Food images and store logos must be stored in:

Google Cloud Storage

Requirements:

* Image validation
* Size validation
* Secure upload
* Store public URL in database

---

## Order Management

Canteen owner can:

* View Orders
* Confirm Orders
* Update Order Status

Allowed statuses:

CONFIRMED

PREPARING

READY_FOR_PICKUP

COMPLETED

CANCELLED

---

## Revenue Statistics

Canteen owner can view:

* Daily Revenue
* Weekly Revenue
* Monthly Revenue
* Total Orders
* Completed Orders

---

# Zoho Integrations

## Zoho Desk

Purpose:

Technical Support Ticket System

Expected Features:

- Create Ticket
- Update Ticket Status
- Assign Ticket
- Track Resolution Progress

Example Cases:

- Food quality complaints
- Delivery problems
- Account issues
- Canteen support requests

Questions to analyze:

- What ticket statuses are required?
- Which users can create tickets?
- Which users can resolve tickets?
- What notifications should be sent?


---

## Zoho Sign

Purpose:

Electronic contract signing.

Expected Flow:

1. New canteen applies
2. Admin reviews application
3. Contract generated
4. Contract sent via Zoho Sign
5. Partner signs contract
6. Store becomes active

Questions to analyze:

* What contract lifecycle is needed?
* What database tables are required?

---

## Zoho Forms

Purpose:

Customer feedback collection.

Expected Features:

* Submit feedback
* Store feedback records
* Associate feedback with canteen

Questions to analyze:

* Should feedback be stored locally?
* Should feedback be synchronized from Zoho Forms?
* What reporting is needed?

---

# Database Design Requirements

Before implementation:

Analyze and propose tables for:

* canteens
* food_categories
* foods
* store_images
* partner_contracts
* revenue_reports

Identify:

* primary keys
* foreign keys
* indexes
* constraints

Explain the reasoning.

# Security Requirements

Analyze and propose:

* ownership validation
* RBAC strategy
* upload security
* image validation
* API protection

Only canteen owners should access their own stores.

Admins can access all stores.

---

# Architecture Requirements

Backend Pattern:

MVC + Service Layer

Controllers:

* Request handling only

Services:

* Business logic only

Models:

* Database access

Middleware:

* Authentication
* Authorization
* Validation

No business logic inside controllers.

---

# Required Deliverables

Phase 1:

1. Analyze requirements
2. Identify missing requirements
3. Identify risks
4. Suggest architecture
5. Suggest database schema
6. Suggest API design

Wait for approval.

Do NOT generate code yet.

Phase 2 (after approval):

1. Database schema
2. Models
3. Services
4. Controllers
5. Routes
6. Validators
7. Middleware
8. Zoho integration layer
9. API documentation

Start by analyzing the architecture and business workflow.
