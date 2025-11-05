# Code Style Guide

This document outlines the coding standards and conventions for the JamLoop Campaign Management System to ensure consistency across the codebase.

---

## **1. General Principles**

- **Consistency**: Follow existing patterns in the codebase
- **Readability**: Write code that is easy to understand and maintain
- **Type Safety**: Leverage TypeScript for compile-time error checking
- **Component Reusability**: Build modular, reusable components
- **Keep It Simple**: Avoid over-engineering; prioritize clarity

---

## **2. File and Folder Structure**

### **2.1 File Naming Conventions**

| Type | Convention | Example |
|------|------------|---------|
| **React Components** | PascalCase | `CampaignForm.tsx`, `LoginPage.tsx` |
| **Utility Functions** | camelCase | `apiClient.ts`, `dateUtils.ts` |
| **API Routes** | kebab-case (Next.js convention) | `route.ts` in `app/api/campaigns/` |
| **Type Definitions** | PascalCase | `Campaign.ts`, `User.ts` |
| **Constants** | UPPER_SNAKE_CASE | `API_CONSTANTS.ts` |
| **Hooks** | camelCase with `use` prefix | `useAuth.ts`, `useCampaigns.ts` |

### **2.2 Folder Organization**

```
app/
├── (auth)/
│   └── login/              # Route group for auth pages
├── dashboard/              # Protected dashboard routes
│   ├── page.tsx           # Campaign listing
│   ├── new/
│   │   └── page.tsx       # Create campaign
│   └── edit/
│       └── [id]/
│           └── page.tsx   # Edit campaign
└── api/
    └── campaigns/
        ├── route.ts       # GET (all), POST
        └── [id]/
            └── route.ts   # GET, PUT, DELETE

components/
├── ui/                    # ShadCN UI components
├── campaigns/             # Campaign-specific components
│   ├── CampaignForm.tsx
│   ├── CampaignTable.tsx
│   └── CampaignRow.tsx
└── layout/                # Layout components
    ├── Header.tsx
    └── Navigation.tsx

lib/
├── api/
│   └── campaigns.ts       # API client functions
├── auth/
│   └── session.ts         # Auth utilities
├── types/
│   └── campaign.ts        # Type definitions
└── utils/
    ├── validation.ts      # Validation utilities
    └── formatting.ts      # Formatting utilities
```

---

## **3. TypeScript Conventions**

### **3.1 Type Definitions**

**Always define explicit types for:**
- Function parameters and return values
- Component props
- API request/response objects
- State variables (when not obvious)

```typescript
// ✅ Good
interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Campaign) => Promise<void>;
  isLoading: boolean;
}

export function CampaignForm({ campaign, onSubmit, isLoading }: CampaignFormProps) {
  // ...
}

// ❌ Bad
export function CampaignForm({ campaign, onSubmit, isLoading }: any) {
  // ...
}
```

### **3.2 Type vs Interface**

- Use `interface` for object shapes and component props
- Use `type` for unions, intersections, and primitives

```typescript
// ✅ Good
interface Campaign {
  _id: string;
  user_id: string;
  campaign_name: string;
}

type CampaignStatus = 'active' | 'paused' | 'completed';
type ApiResponse<T> = { data: T } | { error: string };

// ❌ Avoid
type Campaign = {
  _id: string;
  // ...
};

interface CampaignStatus extends string {} // Don't use interface for primitives
```

### **3.3 Avoid `any`**

Use `unknown` if the type is truly unknown, or create a proper type.

```typescript
// ✅ Good
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ Bad
function handleError(error: any) {
  console.error(error.message);
}
```

---

## **4. Naming Conventions**

### **4.1 Variables and Functions**

| Type | Convention | Example |
|------|------------|---------|
| **Variables** | camelCase | `campaignData`, `isLoading`, `userId` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_AGE`, `MIN_BUDGET` |
| **Functions** | camelCase (verb-based) | `getCampaigns()`, `createCampaign()`, `validateForm()` |
| **Boolean variables** | `is`, `has`, `should` prefix | `isLoading`, `hasError`, `shouldRedirect` |
| **Event handlers** | `handle` or `on` prefix | `handleSubmit()`, `onDelete()`, `handleClick()` |

```typescript
// ✅ Good
const userId = getActiveUserId();
const isAuthenticated = checkAuth();
const handleFormSubmit = async (data: Campaign) => { /* ... */ };

// ❌ Bad
const user = getActiveUserId(); // Not descriptive enough
const authenticated = checkAuth(); // Missing 'is' prefix
const submit = async (data: Campaign) => { /* ... */ }; // Not clear it's a handler
```

### **4.2 Component Naming**

- Use PascalCase for all React components
- Name files the same as the component they export

```typescript
// ✅ Good - CampaignForm.tsx
export function CampaignForm() { /* ... */ }

// ✅ Also acceptable - CampaignForm.tsx
export default function CampaignForm() { /* ... */ }

// ❌ Bad - campaign-form.tsx
export function campaignForm() { /* ... */ }
```

---

## **5. Data Model Conventions**

### **5.1 API Data (snake_case)**

All data stored in crudcrud.com and API payloads use **snake_case** to match backend conventions.

```typescript
// ✅ Good - matches requirements doc
interface Campaign {
  _id: string;
  user_id: string;
  campaign_name: string;
  budget_goal_usd: number;
  start_date: string;
  end_date: string;
  target_age_min: number;
  target_age_max: number;
  target_gender: string;
  geo_countries: string[];
  geo_states: string[];
  geo_cities: string[];
  geo_zip_codes: string[];
  inventory: string[];
  screens: string[];
}
```

### **5.2 Internal State (camelCase)**

Use camelCase for internal component state and variables when not directly mapping to API data.

```typescript
// ✅ Good - internal state
const [isLoading, setIsLoading] = useState(false);
const [formErrors, setFormErrors] = useState<Record<string, string>>({});
const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
```

### **5.3 Mapping Between Conventions**

Only convert between conventions when absolutely necessary (e.g., for UI display labels).

```typescript
// ✅ Good - keep API format throughout the app
const campaign: Campaign = {
  user_id: "user_A",
  campaign_name: "Summer Launch",
  budget_goal_usd: 50000,
  // ...
};

// For display only
const displayName = "Campaign Name"; // UI label
const fieldName = "campaign_name"; // API field

// ❌ Bad - unnecessary transformation
const transformedCampaign = {
  userId: campaign.user_id,
  campaignName: campaign.campaign_name,
  // ... don't do this
};
```

**Best Practice:** Keep all data in snake_case (API format) throughout the application lifecycle. Only use camelCase for UI-specific state that doesn't map to API fields (e.g., `isLoading`, `hasError`, `showModal`).

---

## **6. Component Structure**

### **6.1 Component Organization**

Organize component code in this order:

1. Imports
2. Type definitions (if not in separate file)
3. Component function
4. Internal functions/handlers
5. Return statement (JSX)

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Campaign } from '@/lib/types/campaign';

// 2. Type definitions
interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Campaign) => Promise<void>;
}

// 3. Component function
export function CampaignForm({ campaign, onSubmit }: CampaignFormProps) {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 4. Internal functions/handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...
  };

  const validateForm = () => {
    // ...
  };

  // 5. Return statement
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  );
}
```

### **6.2 Props Destructuring**

Destructure props in the function signature for better readability.

```typescript
// ✅ Good
export function CampaignTable({ campaigns, onEdit, onDelete }: CampaignTableProps) {
  return (
    <table>
      {campaigns.map(campaign => (
        <CampaignRow 
          key={campaign._id} 
          campaign={campaign}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </table>
  );
}

// ❌ Bad
export function CampaignTable(props: CampaignTableProps) {
  return (
    <table>
      {props.campaigns.map(campaign => (
        <CampaignRow campaign={campaign} />
      ))}
    </table>
  );
}
```

---

## **7. React Best Practices**

### **7.1 Hooks Rules**

- Only call hooks at the top level (never in loops, conditions, or nested functions)
- Custom hooks must start with `use`

```typescript
// ✅ Good
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return { campaigns, isLoading };
}

// ❌ Bad
export function getCampaigns() { // Missing 'use' prefix
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); // Hook in non-component
  return campaigns;
}
```

### **7.2 State Management**

- Use `useState` for local component state
- Use `useEffect` for side effects (API calls, subscriptions)
- Consider Context API for shared state (e.g., auth user)

```typescript
// ✅ Good - local state
const [formData, setFormData] = useState<Campaign>({
  campaign_name: '',
  budget_goal_usd: 0,
  // ...
});

// ✅ Good - shared auth state (Context)
const { userId, isAuthenticated, logout } = useAuth();
```

### **7.3 Event Handlers**

Use proper TypeScript types for event handlers.

```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
  // ...
};
```

### **7.4 Error Boundaries (Future Enhancement)**

For production, wrap page components in error boundaries to prevent full app crashes:

```typescript
// app/error.tsx (Next.js 13+ convention)
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
```

**Note:** Error boundaries are not implemented in MVP but should be added for production.

---

## **8. API and Data Fetching**

### **8.1 API Client Functions**

Create reusable API client functions in `lib/api/`.

```typescript
// lib/api/campaigns.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_CRUDCRUD_ENDPOINT;

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch(`${API_BASE_URL}/campaigns`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }
  
  return response.json();
}

export async function createCampaign(campaign: Omit<Campaign, '_id'>): Promise<Campaign> {
  const response = await fetch(`${API_BASE_URL}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campaign),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }
  
  return response.json();
}
```

### **8.2 Error Handling**

Always handle errors gracefully with try-catch blocks.

```typescript
// ✅ Good
async function loadCampaigns() {
  try {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
  } catch (error) {
    console.error('Error loading campaigns:', error);
    setError('Failed to load campaigns. Please try again.');
  } finally {
    setIsLoading(false);
  }
}

// ❌ Bad
async function loadCampaigns() {
  const data = await getCampaigns(); // No error handling
  setCampaigns(data);
}
```

---

## **9. Validation and Forms**

### **9.1 Validation Functions**

Create reusable validation utilities in `lib/utils/validation.ts`.

```typescript
// lib/utils/validation.ts

export function validateCampaignName(name: string): string | null {
  if (!name || name.trim().length < 3) {
    return 'Campaign name must be at least 3 characters';
  }
  return null;
}

export function validateBudget(budget: number): string | null {
  if (budget <= 0) {
    return 'Budget must be greater than 0';
  }
  return null;
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return 'Start date must be today or in the future';
  }

  if (end <= start) {
    return 'End date must be after start date';
  }

  return null;
}

export function validateAgeRange(min: number, max: number): string | null {
  if (min < 18 || min > 99) {
    return 'Minimum age must be between 18 and 99';
  }
  
  if (max < 18 || max > 99) {
    return 'Maximum age must be between 18 and 99';
  }
  
  if (min > max) {
    return 'Minimum age cannot exceed maximum age';
  }
  
  return null;
}

// Export all validators together for convenience
export const validators = {
  validateCampaignName,
  validateBudget,
  validateDateRange,
  validateAgeRange,
};
```

### **9.2 Form Validation Pattern**

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  const nameError = validateCampaignName(formData.campaign_name);
  if (nameError) newErrors.campaign_name = nameError;

  const budgetError = validateBudget(formData.budget_goal_usd);
  if (budgetError) newErrors.budget_goal_usd = budgetError;

  // ... other validations

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return; // Don't submit if validation fails
  }
  
  // Proceed with submission
  await onSubmit(formData);
};
```

---

## **10. Comments and Documentation**

### **10.1 When to Comment**

- **Complex logic**: Explain why, not what
- **Non-obvious behavior**: Clarify intent
- **Workarounds**: Document temporary solutions
- **Public APIs**: Use JSDoc for exported functions

```typescript
// ✅ Good - explains why
// Filter campaigns by user_id on client-side to simulate data isolation
// In production, this would be handled by server-side authorization
const userCampaigns = allCampaigns.filter(c => c.user_id === userId);

// ❌ Bad - states the obvious
// Loop through campaigns
campaigns.forEach(campaign => { /* ... */ });
```

### **10.2 JSDoc for Exported Functions**

```typescript
/**
 * Fetches all campaigns from the API and filters by the current user.
 * 
 * @returns {Promise<Campaign[]>} Array of campaigns belonging to the logged-in user
 * @throws {Error} If the API request fails
 */
export async function getUserCampaigns(): Promise<Campaign[]> {
  const userId = getActiveUserId();
  const allCampaigns = await getCampaigns();
  return allCampaigns.filter(c => c.user_id === userId);
}
```

### **10.3 TODO Comments**

Use TODO comments for future improvements, but keep them actionable.

```typescript
// TODO: Add pagination when campaign count exceeds 50
// TODO: Implement server-side filtering in production
// TODO: Add loading skeleton instead of spinner
```

---

## **11. Imports Organization**

Organize imports in this order:

1. External libraries (React, Next.js, etc.)
2. Internal UI components
3. Internal utilities/types
4. Styles (if any)

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CampaignTable } from '@/components/campaigns/CampaignTable';

// 3. Internal utilities/types
import { getCampaigns } from '@/lib/api/campaigns';
import { getActiveUserId } from '@/lib/auth/session';
import type { Campaign } from '@/lib/types/campaign';

// 4. Styles (if needed)
import './dashboard.css';
```

---

## **12. Testing Conventions** (Future)

When tests are added, follow these conventions:

- Test files: `ComponentName.test.tsx` or `functionName.test.ts`
- Use `jest` and `@testing-library/react`
- Mock external dependencies (API calls, localStorage, etc.)
- Organize tests: Arrange-Act-Assert (AAA) pattern

```typescript
// CampaignForm.test.tsx
describe('CampaignForm', () => {
  it('should display validation errors for invalid input', () => {
    // Arrange
    const onSubmit = jest.fn();
    render(<CampaignForm onSubmit={onSubmit} isLoading={false} />);

    // Act
    fireEvent.click(screen.getByText('Submit'));

    // Assert
    expect(await screen.findByText('Campaign name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

---

## **13. Git Commit Conventions**

Use clear, descriptive commit messages:

- **Format:** `<type>: <description>`
- **Types:** feat, fix, refactor, docs, style, test, chore

```bash
# ✅ Good
git commit -m "feat: Add campaign creation form with validation"
git commit -m "fix: Resolve user_id injection issue in create campaign"
git commit -m "refactor: Extract validation logic into separate utility"

# ❌ Bad
git commit -m "update"
git commit -m "wip"
git commit -m "fix bug"
```

---

## **14. Tailwind CSS Conventions**

- Use Tailwind utility classes for styling
- Extract repeated patterns into components
- Prefer `className` prop over inline styles
- Use `cn()` utility for conditional classes

```typescript
import { cn } from '@/lib/utils';

<button
  className={cn(
    "px-4 py-2 rounded-md font-medium",
    isLoading && "opacity-50 cursor-not-allowed",
    variant === "primary" && "bg-blue-600 text-white",
    variant === "secondary" && "bg-gray-200 text-gray-900"
  )}
>
  Submit
</button>
```

---

## **15. Environment Variables**

- Use `NEXT_PUBLIC_` prefix for client-side variables
- Never commit `.env.local` to version control
- Document all required variables in README

```env
# .env.local
NEXT_PUBLIC_CRUDCRUD_ENDPOINT=<your-crudcrud-endpoint>
```

**Note:** See the main README.md for the current endpoint URL and setup instructions.

```typescript
// Access in code
const apiUrl = process.env.NEXT_PUBLIC_CRUDCRUD_ENDPOINT;
```

---

## **16. Quick Reference**

| Convention | Rule | Example |
|------------|------|---------|
| **Components** | PascalCase | `CampaignForm`, `LoginPage` |
| **Event Handlers** | `handle` prefix | `handleClick()`, `handleSubmit()` |
| **Boolean Variables** | `is/has/should` prefix | `isLoading`, `hasError` |
| **API Fields** | snake_case | `user_id`, `campaign_name` |
| **Types/Interfaces** | PascalCase | `Campaign`, `CampaignFormProps` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Variables** | camelCase | `userId`, `isLoading` |
| **Files** | PascalCase for components | `CampaignForm.tsx` |

---

**Remember**: Consistency is more important than perfection. When in doubt, follow existing patterns in the codebase.
