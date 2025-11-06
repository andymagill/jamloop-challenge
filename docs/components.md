# Component Structure Guide

This document outlines the simplified component architecture for the JamLoop Campaign Management System.

---

## **Component Architecture Overview**

```
App Root (with AuthProvider)
├── LoginPage → LoginForm
└── Dashboard (Protected with ProtectedRoute)
    ├── Header
    ├── DashboardPage → CampaignTable
    ├── NewCampaignPage → CampaignForm
    └── EditCampaignPage → CampaignForm + AlertDialog
```

**Key Components:**
- ✅ `AuthProvider` - Context provider for authentication state
- ✅ `ProtectedRoute` - HOC for route protection
- ✅ `LoginForm` - Reusable authentication form
- ✅ `CampaignTable` - Reusable table component
- ✅ `CampaignForm` - Shared form component (used by both New and Edit pages)
- ✅ `Header` - Reusable header with user info and logout

---

## **1. Page Components**

### **LoginPage** (`app/login/page.tsx`)
- Uses `AuthContext` for authentication management
- Renders `LoginForm` component
- Handles login callback → redirects to dashboard
- Auto-redirects to dashboard if already authenticated
- Full-screen centered layout

**Key Changes:**
- Authentication state managed via `AuthContext` (not direct localStorage)
- Resource ID initialization moved to dashboard (not on login)

---

### **DashboardPage** (`app/dashboard/page.tsx`)
- Wrapped with `ProtectedRoute` for auth protection
- Uses `AuthContext` to get current user
- Initializes CrudCrud resource ID on mount (via `initializeResourceId()`)
- Fetches campaigns from API
- Filters campaigns by `user_id` client-side
- Passes filtered campaigns to `CampaignTable`
- Handles edit navigation and delete confirmation
- Shows loading state and resource validation status
- Error handling for connection and API failures

**Responsibilities:**
- Resource ID initialization and validation
- Data fetching and user-based filtering
- Navigation logic
- Delete confirmation (native `confirm()`)
- Loading and error states

---

### **NewCampaignPage** (`app/dashboard/new/page.tsx`)
- Wrapped with `ProtectedRoute` for auth protection
- Includes `Header` component with user info and logout
- Renders `CampaignForm` in create mode (no initial data)
- Handles form submission → injects `user_id` from `AuthContext` → calls API → navigates to dashboard
- Shows page title "Create New Campaign"
- Back button to return to dashboard
- Toast notifications for success/error

**Security:** Auto-injects `user_id` from `AuthContext` before API call

---

### **EditCampaignPage** (`app/dashboard/edit/[id]/page.tsx`)
- Wrapped with `ProtectedRoute` for auth protection
- Includes `Header` component with user info and logout
- Loads campaign by ID from API
- Verifies `campaign.user_id === userId` from `AuthContext` (shows unauthorized error if mismatch)
- Renders `CampaignForm` with existing campaign data
- Renders ShadCN `AlertDialog` for delete confirmation (inline, not separate component)
- Handles update submission → injects `user_id` → calls API → navigates to dashboard
- Shows "not found" and "unauthorized" error states
- Back button to return to dashboard
- Toast notifications for success/error

**Security:** 
- Verifies ownership before rendering form
- Re-injects `user_id` on update to prevent tampering
- Separate error pages for not found vs unauthorized

---

## **2. Feature Components**

### **AuthProvider** (`lib/auth/AuthContext.tsx`)

**Purpose:** Context provider for global authentication state

**Exports:**
- `AuthProvider` - Provider component to wrap app
- `useAuth()` - Hook to access auth context

**Context Values:**
- `userId: UserId | null` - Currently logged in user ('user_A' or 'user_B')
- `login: (username, password) => Promise<boolean>` - Login function
- `logout: () => void` - Logout function
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state during login

**Responsibilities:**
- Validates credentials against hardcoded users
- Stores user_id in localStorage (key: 'jamloop_auth_user')
- Maintains authentication state across page refreshes
- Does NOT clear resource ID on logout (for reuse if not expired)

---

### **ProtectedRoute** (`components/ProtectedRoute.tsx`)

**Props:**
- `children: React.ReactNode` - Protected content to render

**Responsibilities:**
- Checks authentication status via `useAuth()`
- Redirects to `/login` if not authenticated
- Prevents hydration mismatch by using mount state
- Shows blank loading state during mount check
- Renders children only when authenticated

**Usage:** Wrap any page that requires authentication

---

### **LoginForm** (`components/auth/LoginForm.tsx`)

**Props:**
- `onLogin: (userId: string) => void` - Callback when login succeeds

**Responsibilities:**
- Renders username/password inputs
- Uses `useAuth()` hook to call login function
- Validates against hardcoded credentials (user_A/user_B)
- Shows error message for invalid credentials
- Calls `onLogin` callback after successful authentication
- Displays loading state during login

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
- `onSubmit: (data: Omit<Campaign, '_id' | 'user_id'>) => Promise<void>` - Submit callback (does NOT include user_id)
- `isLoading?: boolean` - Loading state for submit button

**Responsibilities:**
- Renders all form fields organized in sections
- Manages form state and validation
- Shows inline error messages per field
- Supports both create and edit modes (conditional based on `campaign` prop)
- Excludes `_id` and `user_id` from form data (injected by parent)

**Form Sections:**
1. **Basic Information:** Campaign Name, Budget Goal (USD), Start/End Date (HTML date inputs)
2. **Targeting:** Age Range (number inputs 18-99), Gender (Radio buttons: Male/Female/All)
3. **Geographic Targeting:** Countries (Checkboxes from COUNTRY_OPTIONS), States/Cities/Zip Codes (comma-separated text inputs)
4. **Inventory & Devices:** Publishers/Inventory (Checkboxes from INVENTORY_OPTIONS), Screens (Checkboxes from SCREEN_OPTIONS)

**Validation Rules:**
- Campaign name: Required, 3-100 chars
- Budget: Required, > 0
- Dates: Both required, end date > start date
- Age: 18-99 range, min ≤ max
- At least one country, publisher, and screen required
- Geographic text fields optional (states, cities, zip codes)

---

## **3. Layout Components**

### **Header** (`components/layout/Header.tsx`)

**Props:** 
- `userId: string` - Current user ID to display
- `onLogout: () => void` - Logout callback function

**Responsibilities:**
- Displays app title "JamLoop CMS"
- Shows current `userId` passed via props
- Provides logout button that calls `onLogout` callback

**UI:** Border-bottom header with flex layout, destructive button for logout

---

## **4. Component Summary**

| Component | Location | Purpose | Reusable? |
|-----------|----------|---------|-----------|
| **AuthProvider** | `lib/auth/AuthContext.tsx` | Global authentication state | Yes (Provider) |
| **ProtectedRoute** | `components/ProtectedRoute.tsx` | Route authentication guard | Yes |
| **LoginPage** | `app/login/page.tsx` | Authentication page | No |
| **DashboardPage** | `app/dashboard/page.tsx` | Campaign list page | No |
| **NewCampaignPage** | `app/dashboard/new/page.tsx` | Create campaign page | No |
| **EditCampaignPage** | `app/dashboard/edit/[id]/page.tsx` | Edit/delete campaign page | No |
| **Header** | `components/layout/Header.tsx` | App header with user info | Yes |
| **LoginForm** | `components/auth/LoginForm.tsx` | Authentication form | Yes |
| **CampaignTable** | `components/campaigns/CampaignTable.tsx` | Campaign list table | Yes |
| **CampaignForm** | `components/campaigns/CampaignForm.tsx` | Campaign form | Yes |

**Total: 10 components** (4 pages + 6 reusable components/utilities)

---

## **5. Design Principles**

✅ **Context-driven authentication** - Global auth state via React Context  
✅ **Balanced complexity** - Not too many, not too few components  
✅ **Clear reusability** - Only extract when used in multiple places  
✅ **Co-located logic** - Pages own their data fetching and routing  
✅ **Minimal props** - Components receive only what they need  
✅ **Inline simplicity** - Use ShadCN components directly for one-off UI (AlertDialog, empty states)  
✅ **Security by design** - `user_id` injected by pages, not controlled by forms

**When to extract components:**
- ✅ Used in multiple places (LoginForm, CampaignForm, CampaignTable, Header)
- ✅ Complex, self-contained logic (CampaignForm validation, AuthContext)
- ✅ Cross-cutting concerns (ProtectedRoute HOC)
- ❌ Single-use UI sections (empty states, delete dialogs)
- ❌ "Separation of concerns" alone

---

## **6. ShadCN UI Components Used**

- **Button** - All actions (primary, destructive, link variants)
- **Input** - Text, number, date (type="date")
- **Label** - Form labels
- **Card** - Section containers in forms
- **Table** - Campaign listing
- **Checkbox** - Multi-select options (countries, inventory, screens)
- **Radio / RadioGroup** - Gender selection (Male/Female/All)
- **AlertDialog** - Delete confirmation in edit page
- **Toast** - Success/error notifications (via `sonner`)

---

## **7. Authentication Flow**

1. User visits app → `AuthProvider` checks localStorage for saved user
2. If authenticated → allow access; if not → redirect to `/login`
3. User enters credentials in `LoginForm`
4. `LoginForm` calls `useAuth().login(username, password)`
5. `AuthContext` validates credentials and stores user_id in localStorage
6. Redirect to `/dashboard`
7. `DashboardPage` initializes CrudCrud resource ID (lazy initialization)
8. User can access protected routes via `ProtectedRoute` wrapper

**Key Points:**
- Resource ID initialization is deferred until dashboard (not on login)
- Resource ID persists in localStorage across logout/login cycles
- Authentication state is global via Context, accessible anywhere via `useAuth()`

---

## **Reference**

- **API Documentation**: [docs/api.md](./api.md)
- **Requirements**: [docs/requirements.md](./requirements.md)