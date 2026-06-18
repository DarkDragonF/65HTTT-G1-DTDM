# TASK 3 - CART & ORDER PROCESSING

Act as a senior backend engineer, software architect, and database designer.

Do NOT start coding immediately.

First, analyze the project architecture, requirements, business rules, database design, API design, security requirements, order workflow, and Zoho integrations.

Understand the business process before proposing any implementation.

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

Cart & Order Processing

---

# Business Goal

Allow students and lecturers to add food items into a cart, place orders, track order status, receive notifications, and view order history.

Allow canteen owners to receive, process, and complete orders.

The system must support multiple canteens and multiple concurrent orders.

Order processing must maintain data consistency and inventory accuracy.

---

# User Roles

## STUDENT

Permissions:

* View Cart
* Add Item To Cart
* Update Cart Item Quantity
* Remove Item From Cart
* Create Order
* View Order Status
* Cancel Order
* View Order History

---

## LECTURER

Permissions:

* Same as STUDENT

---

## CANTEEN_OWNER

Permissions:

* View Incoming Orders
* Confirm Orders
* Reject Orders
* Update Order Status
* View Order History
* View Order Revenue

---

## ADMIN

Permissions:

* View All Orders
* Monitor Order Activity
* View Revenue Reports
* Manage Order Disputes

---

# Functional Requirements

## Shopping Cart

Users can:

* Create Cart
* Add Food To Cart
* Update Quantity
* Remove Item
* Clear Cart

Cart rules:

* Quantity must be greater than 0
* Cannot exceed available stock
* Food must be active
* Food must belong to an active canteen

---

## Cart Calculation

System must calculate:

* Item Subtotal
* Cart Total
* Total Quantity

Calculation must be performed on backend.

Client-side calculations are for display only.

---

## Order Creation

Users can:

* Place Order From Cart

Order creation process:

1. Validate Cart
2. Validate Food Availability
3. Validate Inventory
4. Calculate Final Total
5. Create Order
6. Create Order Items
7. Deduct Inventory
8. Send Notifications
9. Generate Invoice

Order fields:

* order_number
* user_id
* canteen_id
* total_amount
* status
* notes
* created_at

Requirements:

* Use database transaction
* Prevent duplicate orders
* Prevent race conditions

---

## Order Status Workflow

Allowed statuses:

### PENDING

Order created and waiting for canteen review.

### CONFIRMED

Order accepted by canteen.

### PREPARING

Food is being prepared.

### DELIVERING

Order is on the way or ready for campus delivery.

### COMPLETED

Order successfully received.

### CANCELLED

Order cancelled by user or canteen.

---

## Status Transition Rules

Allowed transitions:

PENDING

→ CONFIRMED

→ CANCELLED

CONFIRMED

→ PREPARING

→ CANCELLED

PREPARING

→ DELIVERING

DELIVERING

→ COMPLETED

No backward transitions allowed.

Questions to analyze:

* Who can perform each transition?
* What validations are required?
* Should status changes be logged?

---

## Order History

Users can:

* View All Orders
* View Order Details
* Filter By Status
* Search By Order Number

---

## Notifications

Users should receive notifications for:

* Order Created
* Order Confirmed
* Order Rejected
* Order Preparing
* Order Delivering
* Order Completed
* Order Cancelled

Notifications should be stored in database.

---

# Inventory Synchronization

Inventory must be updated when:

* Order Created
* Order Cancelled
* Order Refunded

Questions to analyze:

* When should stock be deducted?
* When should stock be restored?
* How to prevent overselling?

---

# Zoho Integrations

## Zoho Inventory

Purpose:

Inventory Synchronization

Expected Features:

* Sync Product Quantity
* Sync Stock Changes
* Sync Order Information

Questions to analyze:

* What inventory events require synchronization?
* What retry strategy is required?
* How should synchronization failures be handled?

---

## Zoho Invoice

Purpose:

Electronic Invoice Generation

Expected Features:

* Create Invoice
* Generate Invoice PDF
* Send Invoice To Customer

Questions to analyze:

* When should invoice be generated?
* What invoice statuses are required?
* What invoice data should be stored locally?

---

## Zoho Cliq

Purpose:

Internal Order Notifications

Expected Features:

* Notify Canteen Owner
* Notify Admin
* Notify Operations Team

Examples:

* New Order Created
* Order Cancelled
* Large Order Alert
* Inventory Warning

Questions to analyze:

* Which events should trigger notifications?
* Which user groups should receive notifications?

---

# Database Design Requirements

Before implementation:

Analyze and propose tables for:

* carts
* cart_items
* orders
* order_items
* order_status_logs
* invoices
* notifications
* inventory_transactions

Identify:

* primary keys
* foreign keys
* indexes
* constraints

Explain the reasoning.

---

# Security Requirements

Analyze and propose:

* ownership validation
* RBAC strategy
* cart security
* order security
* transaction security
* API protection

Requirements:

* Users can access only their own carts
* Users can access only their own orders
* Canteen owners can access only orders belonging to their stores
* Admins can access all orders

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

# API Design Requirements

Analyze and propose APIs for:

## Cart

* Add To Cart
* Update Cart Item
* Remove Cart Item
* Clear Cart
* Get Cart

## Orders

* Create Order
* Get Order Details
* Get User Orders
* Cancel Order
* Get Order History

## Canteen Orders

* Get Store Orders
* Confirm Order
* Update Order Status

## Notifications

* Get Notifications
* Mark As Read

Include:

* Request Payload
* Response Payload
* Validation Rules
* Error Cases

---

# Required Deliverables

Phase 1:

1. Analyze requirements
2. Identify missing requirements
3. Identify risks
4. Suggest architecture
5. Suggest database schema
6. Suggest API design
7. Suggest order workflow
8. Suggest inventory strategy
9. Suggest Zoho integration strategy

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
8. Transaction Handling
9. Notification Service
10. Zoho Integration Layer
11. API Documentation

Start by analyzing the order lifecycle, inventory workflow, and overall architecture.
