# Component Structure Guide

This document outlines the simplified component architecture for the JamLoop Campaign Management System.

---

## **Component Architecture Overview**

```
App Root
├── LoginPage → LoginForm
└── Dashboard (Protected)
    ├── Header
    ├── DashboardPage → CampaignTable
    ├── NewCampaignPage → CampaignForm
    └── EditCampaignPage → CampaignForm + AlertDialog
```

**Key Simplifications:**
- ✅ Keep `LoginForm` - Reusable authentication form
- ✅ Keep `CampaignTable` - Reusable table component
- ❌ Removed `CampaignRow` - Inline table rows in CampaignTable
- ❌ Removed `EmptyState` - Simple div in CampaignTable
- ❌ Removed `DeleteConfirmDialog` - Use ShadCN AlertDialog directly in EditCampaignPage
- ✅ Keep `CampaignForm` - Shared form component (used by both New and Edit pages)
- ✅ Keep `Header` - Used across all dashboard pages

---

## **1. Page Components**

### **LoginPage** (`app/login/page.tsx`)
- Renders `LoginForm` component
- Handles login callback → stores user_id in localStorage → navigates to dashboard
- Full-screen centered layout

---

### **DashboardPage** (`app/dashboard/page.tsx`)
- Fetches campaigns from API
- Filters campaigns by `user_id` from localStorage
- Passes filtered campaigns to `CampaignTable`
- Handles edit navigation and delete confirmation
- Shows loading state while fetching

**Responsibilities:**
- Data fetching and user-based filtering
- Navigation logic
- Delete confirmation (native `confirm()`)

---

### **NewCampaignPage** (`app/dashboard/new/page.tsx`)
- Renders `CampaignForm` in create mode (no initial data)
- Handles form submission → injects `user_id` → calls API → navigates to dashboard
- Shows page title "Create New Campaign"

**Security:** Auto-injects `user_id` from localStorage before API call

---

### **EditCampaignPage** (`app/dashboard/edit/[id]/page.tsx`)
- Loads campaign by ID from API
- Verifies `campaign.user_id === localStorage.user_id` (redirects if unauthorized)
- Renders `CampaignForm` with existing campaign data
- Renders ShadCN `AlertDialog` for delete confirmation (inline, not separate component)
- Handles update submission → injects `user_id` → calls API → navigates to dashboard

**Security:** 
- Verifies ownership before rendering form
- Re-injects `user_id` on update to prevent tampering

---

## **2. Feature Components**

### **LoginForm** (`components/auth/LoginForm.tsx`)

**Props:**
- `onLogin: (userId: string) => void` - Callback when login succeeds

**Responsibilities:**
- Renders username/password inputs
- Validates against hardcoded credentials (user_A/user_B)
- Shows error message for invalid credentials
- Calls `onLogin` callback with user_id

**UI:** ShadCN Card with Input, Label, Button components

---

### **CampaignTable** (`components/campaigns/CampaignTable.tsx`)

**Props:**
- `campaigns: Campaign[]` - Array of campaigns to display
- `onEdit: (id: string) => void` - Edit callback
- `onDelete: (id: string) => void` - Delete callback

**Responsibilities:**
- Renders ShadCN Table with campaign data
- Shows empty state when `campaigns.length === 0`
- Maps campaign array to table rows (inline, no separate CampaignRow component)
- Displays: Name, Budget, Start/End Date, Target Age, Edit/Delete buttons

**Empty State:** Simple centered div with message and "Create Campaign" button

---

### **CampaignForm** (`components/campaigns/CampaignForm.tsx`)

**Props:**
- `campaign?: Campaign` - Optional existing campaign (edit mode)
- `onSubmit: (data: Omit<Campaign, '_id'>) => Promise<void>` - Submit callback
- `isLoading?: boolean` - Loading state for submit button

**Responsibilities:**
- Renders all form fields organized in Cards
- Manages form state and validation
- Shows inline error messages per field
- Supports both create and edit modes (conditional based on `campaign` prop)

**Form Sections:**
1. **Basic Information:** Campaign Name, Budget, Start/End Date (HTML date inputs)
2. **Targeting:** Age Range (number inputs), Gender (RadioGroup)
3. **Geographic Targeting:** Countries (Checkboxes), States/Cities/Zip (comma-separated text inputs)
4. **Inventory & Devices:** Publishers (Checkboxes), Screens (Checkboxes)

**Validation Rules:**
- Campaign name: Required, 3-100 chars
- Budget: Required, > 0
- Dates: Both required, end > start
- Age: 18-99 range, min ≤ max
- At least one country, publisher, and screen required

---

## **3. Layout Components**

### **Header** (`components/layout/Header.tsx`)

**Props:** None

**Responsibilities:**
- Displays app title "JamLoop CMS"
- Shows current `user_id` from localStorage
- Provides logout button → clears localStorage → navigates to /login

**UI:** Border-bottom header with flex layout

---

## **4. Component Summary**

| Component | Location | Purpose | Reusable? |
|-----------|----------|---------|-----------|
| **LoginPage** | `app/login/page.tsx` | Authentication page | No |
| **DashboardPage** | `app/dashboard/page.tsx` | Campaign list page | No |
| **NewCampaignPage** | `app/dashboard/new/page.tsx` | Create campaign page | No |
| **EditCampaignPage** | `app/dashboard/edit/[id]/page.tsx` | Edit/delete campaign page | No |
| **Header** | `components/layout/Header.tsx` | App header | Yes |
| **LoginForm** | `components/auth/LoginForm.tsx` | Authentication form | Yes |
| **CampaignTable** | `components/campaigns/CampaignTable.tsx` | Campaign list table | Yes |
| **CampaignForm** | `components/campaigns/CampaignForm.tsx` | Campaign form | Yes |

**Total: 8 components** (4 pages + 4 reusable)

---

## **5. Design Principles**

✅ **Balanced complexity** - Not too many, not too few components  
✅ **Clear reusability** - Only extract when used in multiple places  
✅ **Co-located logic** - Pages own their data fetching and routing  
✅ **Minimal props** - Components receive only what they need  
✅ **Inline simplicity** - Use ShadCN components directly for one-off UI (AlertDialog, empty states)

**When to extract components:**
- ✅ Used in multiple places (LoginForm, CampaignForm, CampaignTable)
- ✅ Complex, self-contained logic (CampaignForm validation)
- ❌ Single-use UI sections (empty states, delete dialogs)
- ❌ "Separation of concerns" alone

---

## **6. ShadCN UI Components Used**

- **Button** - All actions
- **Input** - Text, number, date (type="date")
- **Label** - Form labels
- **Card** - Section containers
- **Table** - Campaign listing
- **Checkbox** - Multi-select options
- **RadioGroup** - Gender selection
- **AlertDialog** - Delete confirmation
- **Toast** - Success/error notifications (via `sonner`)

---

## **Reference**

- **API Documentation**: [docs/api.md](./api.md)
- **Requirements**: [docs/requirements.md](./requirements.md)