# TLU FOOD - AI PROJECT CONTEXT

## Project Overview

TLU FOOD is a cloud-native food ordering web application developed for Thuy Loi University.

The system allows students and lecturers to order food online from campus canteens, track order status, review food quality, and manage their accounts.

Canteen owners can manage stores, menus, orders, and revenue statistics.

Administrators can manage users, partners, orders, analytics, and system monitoring.

This project is developed as a university cloud computing course project and must demonstrate the use of Google Cloud Platform and Zoho SaaS integrations.

---

# Architecture

Frontend

* ReactJS
* React Router DOM
* Axios
* Context API

Backend

* NodeJS
* ExpressJS
* RESTful API
* JWT Authentication
* MVC + Service Layer Architecture

Database

* MySQL
* Google Cloud SQL

Storage

* Google Cloud Storage

Deployment

* Docker
* Google Cloud Run

Monitoring

* Google Cloud Monitoring

CDN & Security

* Cloudflare CDN
* Cloudflare WAF

---

# Cloud Architecture

Users

-> Cloudflare

-> React Frontend (Vercel)

-> NodeJS Backend (Google Cloud Run)

-> Google Cloud SQL

-> Google Cloud Storage

External Integrations

-> Zoho APIs

---

# User Roles

## Student / Lecturer

Permissions:

* Register
* Login
* Verify Email OTP
* Manage Profile
* Browse Food
* Search Food
* Add To Cart
* Place Orders
* Track Orders
* View Order History
* Submit Reviews

---

## Canteen Owner

Permissions:

* Manage Store
* Manage Menu
* Upload Food Images
* Manage Orders
* Update Order Status
* View Revenue Statistics

---
## Delivery Staff

Permissions:

Login
View Assigned Orders
Accept Delivery Tasks
Start Delivery
Complete Delivery
View Delivery History
--

## Administrator

Permissions:

* Manage Users
* Manage Canteens
* Manage Orders
* View Analytics
* Monitor System
* Manage Platform Settings

---
## Order Workflow
Student places order
Status: PENDING

Canteen confirms order 
Status: CONFIRMED

Food is being prepared
Status: PREPARING

Food is ready for delivery
Status: READY_FOR_PICKUP

Delivery staff accepts order
Status: DELIVERING

Food delivered successfully
Status: COMPLETED

Order cancelled
Status: CANCELLED
---

# Zoho Integrations

## Customer Experience

Zoho ZeptoMail

Purpose:

* Send OTP Emails
* Send Security Notifications

Zoho SalesIQ

Purpose:

* Live Chat
* Visitor Tracking

Zoho Campaigns

Purpose:

* Newsletter
* Marketing Emails

---

## Partner Management

Zoho CRM

Purpose:

* Manage Canteen Partners

Zoho Sign

Purpose:

* Electronic Contract Signing

Zoho Forms

Purpose:

* Customer Feedback Collection

---

## Order Processing

Zoho Invoice

Purpose:

* Generate Invoices

Zoho Inventory

Purpose:

* Inventory Synchronization

Zoho Cliq

Purpose:

* Internal Notifications

---

## Administration

Zoho Analytics

Purpose:

* Revenue Analytics
* Dashboard Reporting

Zoho Desk

Purpose:

* Support Ticket Management

Zoho Vault

Purpose:

* API Key Management
* Secret Management

---

# Backend Architecture

Pattern:

MVC + Service Layer

# Coding Standards

Backend

* Use MVC architecture.
* Business logic must be placed in Services.
* Controllers should only handle requests and responses.
* Use async/await.
* Use centralized error handling.
* Validate all request payloads.

Frontend

* Use functional components.
* Use React Hooks.
* Use Context API for global state.
* Use reusable UI components.
* Separate pages, layouts, services, hooks, and components.

Database

* Use foreign keys.
* Use normalized relationships.
* Use created_at and updated_at fields.

Cloud

* Backend must be containerized with Docker.
* Deploy backend to Google Cloud Run.
* Store images in Google Cloud Storage.
* Store relational data in Google Cloud SQL.

---


# Project Scope

Must Implement

* Authentication
* Food Management
* Cart Management
* Order Management
* Review System
* Admin Dashboard
* Google Cloud Deployment
* Zoho Integrations

Future Scope

* Online Payment
* Mobile Application
* AI Recommendation
* Push Notifications
* Real-time Tracking

---

End of Context
