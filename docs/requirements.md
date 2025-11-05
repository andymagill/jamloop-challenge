# **Product Requirements Document: JamLoop Campaign Management System (CMS)**

## **1\. Introduction and Goals**

This document outlines the requirements for a Minimum Viable Product (MVP) of a Campaign Management System (CMS). The system will allow customers to create, manage, and view video advertisement campaigns targeted at JamLoop-connected inventory.

The core principle of this application is **security and isolation**, ensuring that each user can only interact with their own data.

### **1.1 Project Goals**

1. **Data Isolation:** Implement strict authorization rules ensuring user campaigns are completely isolated from one another.  
2. **Full CRUD Functionality:** Deliver a reliable interface for creating, reading, updating, and deleting campaign records.  
3. **Modern Architecture:** Utilize Next.js, React, TypeScript, and ShadCN/Tailwind CSS to build a scalable, performant, and responsive web application. **(NOTE: Data persistence for the PoC will use crudcrud.com for rapid prototyping.)**

### **1.2 Target Audience**

The primary user is a "Customer" or "Account Manager" who is responsible for defining the parameters of an advertisement deal with JamLoop.

## **2\. Product Scope and Features (MVP)**

The scope is strictly limited to the secure management of the Campaign data object.

### **2.1 Feature List**

| ID | Feature | Description | Priority |
| :---- | :---- | :---- | :---- |
| **F1** | **User Authentication (SIMULATED)** | **Login form with simulated authentication** using hardcoded credentials for two distinct user accounts: `user_A` / `password_A` and `user_B` / `password_B`. | **Critical** |
| **F2** | **Campaign Creation** | A form-based workflow to create a new campaign, capturing all required attributes with **real-time validation**. | **High** |
| **F3** | **Campaign Editing** | Ability to open and modify the fields of an existing campaign record with validation. | **High** |
| **F4** | **Campaign Listing** | A dedicated page displaying all campaigns belonging *only* to the logged-in user in a **simple table view**. | **High** |
| **F5** | **Data Isolation Check (CLIENT-SIDE)** | **Client-side check** on every read/write action to simulate isolation based on the current active user ID (hardcoded: user\_A or user\_B). | **Critical** |
| **F6** | **Form Validation & Feedback** | Real-time validation on campaign forms with clear error messages and success/error notifications for all CRUD operations. | **High** |

### **2.2 Out-of-Scope (Future Features)**

* Detailed analytics/reporting on budget spend or campaign performance.  
* Integration with external APIs (e.g., ad servers, inventory endpoints).  
* User role management (all users are treated equally as "Customers" in the MVP).
* **Pagination, sorting, and search** on the campaign listing table.
* **Advanced multi-select components** (use basic checkboxes for MVP).

## **3\. User Experience (UX) and User Stories**

### **3.1 User Workflow**

1. **Access:** User navigates to the application and must log in (**F1**).  
2. **Dashboard:** User is redirected to the campaign listing table (**F4**).  
3. **New Campaign:** User clicks "Create New Campaign," fills out the form (**F2**), and submits.  
4. **Management:** User can click on any row in the table to view/edit campaign details (**F3**).  
5. **Security:** All actions are silently filtered by user ID (**F5**).

### **3.2 Campaign Data Fields (Input Requirements)**

| Field Name | Type | Notes |
| :---- | :---- | :---- |
| **Campaign Name** | Text Input | Required, descriptive title. |
| **Budget Goal** | Number Input | Required, USD value (e.g., 50000.00). |
| **Start Date** | Date Picker | Required, must be today or in the future. |
| **End Date** | Date Picker | Required, must be after the Start Date. |
| **Target Age** | Range/Two Inputs | Required (e.g., Min Age, Max Age). |
| **Target Gender** | Multi-Select/Radio | Options: Male, Female, All. |
| **Geo Targeting** | Multi-Select/Tags | Capture Country, State, City, Zip Code. Should support multiple selections for each category. |
| **Inventory / Publishers** | Multi-Select | Checklist of available partners (Hulu, Discovery, ABC, A\&E, TLC, Fox News, Fox Sports). |
| **Screens / Devices** | Multi-Select | Checklist of device types (CTV, Mobile Device, Web Browser). |

## **4\. Technical Requirements (PoC Simulation Mode)**

### **4.1 Technology Stack**

* **Frontend:** React, Next.js, TypeScript  
* **UI Library:** ShadCN UI (Components: Table, Form, Select, DatePicker)  
* **Styling:** Tailwind CSS  
* **Database (PoC):** **crudcrud.com** (Temporary, public REST endpoint for data persistence).  
* **Auth/Session (PoC):** **Hardcoded/Simulated** (Simple state management and cookie/local storage). 

### **4.2 Data Model (PoC Schema Concept)**

For the PoC, the schema will be flexible, relying on crudcrud.com's public API structure. All campaign objects **MUST** include a mandatory user\_id field (e.g., 'user\\\_A' or 'user\\\_B') for isolation simulation.

A standard campaign object payload sent to the API will look like this:

{  
  "user\_id": "user\_A",  
  "name": "Summer Ad Launch",  
  "budget\_goal\_usd": 15000.00,  
  "start\_date": "2025-01-01",  
  // ... other fields  
}

### **4.3 Security & Authorization (F5 Implementation \- PoC)**

1. **Auth Simulation:** The application determines the active user\_id (e.g., 'user\\\_A') from the simulated session (local state/cookie).  
2. **Isolation Filter (Client-Side):** All data fetched from crudcrud.com must be **client-side filtered** to only display items where the Campaign object's user\_id matches the active user's ID. All write/update actions must ensure the correct user\_id is applied to the payload.

## **5\. Implementation Plan**

This roadmap focuses on a three-phase approach to quickly establish the core security layer and CRUD functionality, minimizing complexity in the initial data entry.

### **Phase 0: Foundation and Security Setup (F1, F5 Setup)**

The goal is to establish the secure environment and simulated data persistence.

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| **0.1** | Project initialization (Next.js, TypeScript, Tailwind, ShadCN). | Working package.json and basic styling. |
| **0.2** | **crudcrud.com API Client setup.** | Base URL and client functions configured. |
| **0.3** | **Implement Simulated Auth (F1)** using two hardcoded credentials (user\\\_A, user\\\_B). | Simple protected route check based on local state/cookie. |
| **0.4** | Create a helper function to retrieve the **hardcoded** current active user\\\_id. | getActiveUserId() function ready for data operations. |

### **Phase 1: Read and Isolation Proof (F4, F5)**

The goal is to demonstrate the core security requirement: only seeing your own data.

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| **1.1** | Create the Campaign Listing page at /dashboard. | Empty page with a "Create New Campaign" button. |
| **1.2** | Implement the GET /api/campaigns handler to fetch **all** data from crudcrud.com. | API that returns all campaigns for all users. |
| **1.3** | Build the **Campaigns Table** (F4). | Fully working table that fetches **all** data and **client-side filters** it to display only the active user's campaigns. |

### **Phase 2: Create Campaign (Complete Data Entry) (F2, F6)**

The goal is to enable full campaign creation with all fields and validation.

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| **2.1** | Create the New Campaign page at `/dashboard/new`. | Form with all fields from Section 3.2 using **basic HTML inputs and checkboxes** (no complex multi-select components). |
| **2.2** | Implement all form fields:<br>- Text/number inputs: campaign_name, budget_goal_usd, target_age_min/max<br>- Date inputs (HTML5 date type): start_date, end_date<br>- Radio buttons: target_gender<br>- **Checkboxes**: geo_countries, inventory, screens<br>- **Text input (comma-separated)**: geo_states, geo_cities, geo_zip_codes | Complete form UI with basic HTML controls. |
| **2.3** | Add real-time validation for all fields per Section 3.3. | Form with inline error messages for validation failures. |
| **2.4** | Implement POST API route (`/api/campaigns`). | API that saves new campaign to crudcrud.com, **automatically injecting logged-in user's `user_id`**. |
| **2.5** | Add success/error toast notifications (F6). | Toast component showing feedback after form submission. |
| **2.6** | Redirect to dashboard on successful creation. | Navigation after successful campaign creation. |

### **Phase 3: Update and Delete (F3)**

The goal is to complete the full CRUD cycle with guaranteed isolation.

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| **3.1** | Enable clicking a table row to navigate to /dashboard/edit/\[id\]. | Routing setup. |
| **3.2** | Implement GET /api/campaigns/\[id\]. | API that fetches the specific campaign and then relies on the client-side to check if the user\_id matches. |
| **3.3** | Reuse the form component for the Edit page (F3) and pre-populate fields with fetched data. | Working edit view. |
| **3.4** | Implement PUT /api/campaigns/\[id\] and DELETE /api/campaigns/\[id\]. | Both APIs must ensure the updated/deleted object contains the correct user\_id and handle potential **404/failure responses if the wrong ID is targeted** (simulated isolation). |
