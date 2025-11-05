# Component Structure Guide

This document outlines the component architecture for the JamLoop Campaign Management System, including component hierarchy, props interfaces, and reusability patterns.

---

## **Component Architecture Overview**

The application follows a modular component structure with clear separation of concerns:

- **Page Components**: Top-level route components (`app/*/page.tsx`)
- **Feature Components**: Domain-specific components (`components/campaigns/`)
- **UI Components**: Reusable ShadCN UI primitives (`components/ui/`)
- **Layout Components**: Shared layout elements (`components/layout/`)

---

## **Component Hierarchy**

```
App Root
│
├── LoginPage
│   └── LoginForm
│       ├── Input (ShadCN)
│       ├── Button (ShadCN)
│       └── Toast (ShadCN)
│
└── Dashboard (Protected)
    ├── Header
    │   ├── Logo
    │   └── UserMenu
    │       └── Button (logout)
    │
    ├── DashboardPage
    │   ├── CampaignTable
    │   │   ├── Table (ShadCN)
    │   │   ├── CampaignRow (multiple)
    │   │   └── EmptyState
    │   └── Button (Create New Campaign)
    │
    ├── NewCampaignPage
    │   └── CampaignForm
    │       ├── Input (ShadCN)
    │       ├── DatePicker (ShadCN)
    │       ├── Select (ShadCN)
    │       ├── Checkbox (ShadCN)
    │       ├── RadioGroup (ShadCN)
    │       └── Button (ShadCN)
    │
    └── EditCampaignPage
        ├── CampaignForm (reused)
        └── DeleteConfirmDialog
            ├── AlertDialog (ShadCN)
            └── Button (ShadCN)
```

---

## **1. Page Components**

### **1.1 LoginPage**

**Location:** `app/login/page.tsx`

Top-level page component for user authentication.

```typescript
export default function LoginPage() {
  const router = useRouter();
  
  const handleLogin = async (userId: string) => {
    // Store user_id in localStorage
    localStorage.setItem('user_id', userId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
```

**Responsibilities:**
- Render login form
- Handle successful login navigation
- Page-level layout and styling

---

### **1.2 DashboardPage**

**Location:** `app/dashboard/page.tsx`

Main dashboard displaying the campaign listing table.

```typescript
export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const userId = getActiveUserId();
      const allCampaigns = await getCampaigns();
      // Client-side filtering by user_id
      const userCampaigns = allCampaigns.filter(c => c.user_id === userId);
      setCampaigns(userCampaigns);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    // Delete logic with confirmation
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Campaigns</h1>
        <Button onClick={() => router.push('/dashboard/new')}>
          Create New Campaign
        </Button>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <CampaignTable 
          campaigns={campaigns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
```

**Responsibilities:**
- Fetch and filter campaigns by user
- Manage campaign list state
- Handle navigation to create/edit pages
- Coordinate delete operations

---

### **1.3 NewCampaignPage**

**Location:** `app/dashboard/new/page.tsx`

Page for creating a new campaign.

```typescript
export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Campaign, '_id'>) => {
    try {
      setIsSubmitting(true);
      const userId = getActiveUserId();
      
      // Auto-inject user_id
      const campaignData = {
        ...data,
        user_id: userId
      };
      
      await createCampaign(campaignData);
      toast.success('Campaign created successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>
      <CampaignForm 
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
```

**Responsibilities:**
- Render campaign creation form
- Handle form submission
- Auto-inject user_id
- Navigate to dashboard on success

---

### **1.4 EditCampaignPage**

**Location:** `app/dashboard/edit/[id]/page.tsx`

Page for editing an existing campaign.

```typescript
export default function EditCampaignPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      setIsLoading(true);
      const data = await getCampaignById(params.id);
      const userId = getActiveUserId();
      
      // Security check
      if (data.user_id !== userId) {
        toast.error('Unauthorized access');
        router.push('/dashboard');
        return;
      }
      
      setCampaign(data);
    } catch (error) {
      toast.error('Campaign not found');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<Campaign, '_id'>) => {
    try {
      setIsSubmitting(true);
      const userId = getActiveUserId();
      
      // Ensure user_id is preserved
      const updatedData = {
        ...data,
        user_id: userId
      };
      
      await updateCampaign(params.id, updatedData);
      toast.success('Campaign updated successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to update campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // Delete with confirmation dialog
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Campaign</h1>
        <DeleteConfirmDialog 
          campaignName={campaign?.campaign_name || ''}
          onConfirm={handleDelete}
        />
      </div>
      
      <CampaignForm 
        campaign={campaign}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
```

**Responsibilities:**
- Load existing campaign data
- Verify user ownership (security check)
- Handle update submission
- Coordinate delete operation

---

## **2. Feature Components**

### **2.1 LoginForm**

**Location:** `components/auth/LoginForm.tsx`

Form component for simulated authentication.

```typescript
interface LoginFormProps {
  onLogin: (userId: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded credential check
    const validUsers = {
      user_A: 'password_A',
      user_B: 'password_B'
    };

    if (validUsers[username as keyof typeof validUsers] === password) {
      onLogin(username);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to JamLoop CMS</CardTitle>
        <CardDescription>Enter your credentials to access your campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user_A or user_B"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Props:**
- `onLogin: (userId: string) => void` - Callback when login succeeds

**Responsibilities:**
- Render username/password inputs
- Validate credentials against hardcoded values
- Display error messages
- Call onLogin callback with user_id

---

### **2.2 CampaignTable**

**Location:** `components/campaigns/CampaignTable.tsx`

Table component displaying list of campaigns.

```typescript
interface CampaignTableProps {
  campaigns: Campaign[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignTable({ campaigns, onEdit, onDelete }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Budget (USD)</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Target Age</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <CampaignRow
              key={campaign._id}
              campaign={campaign}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Props:**
- `campaigns: Campaign[]` - Array of campaigns to display
- `onEdit: (id: string) => void` - Callback for edit action
- `onDelete: (id: string) => void` - Callback for delete action

**Responsibilities:**
- Render table structure
- Display empty state when no campaigns
- Pass data and callbacks to rows

---

### **2.3 CampaignRow**

**Location:** `components/campaigns/CampaignRow.tsx`

Individual table row for a campaign.

```typescript
interface CampaignRowProps {
  campaign: Campaign;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignRow({ campaign, onEdit, onDelete }: CampaignRowProps) {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onEdit(campaign._id)}
    >
      <TableCell className="font-medium">{campaign.campaign_name}</TableCell>
      <TableCell>${campaign.budget_goal_usd.toLocaleString()}</TableCell>
      <TableCell>{formatDate(campaign.start_date)}</TableCell>
      <TableCell>{formatDate(campaign.end_date)}</TableCell>
      <TableCell>{campaign.target_age_min} - {campaign.target_age_max}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(campaign._id);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(campaign._id);
            }}
          >
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
```

**Props:**
- `campaign: Campaign` - Campaign data to display
- `onEdit: (id: string) => void` - Callback for edit button
- `onDelete: (id: string) => void` - Callback for delete button

**Responsibilities:**
- Render single campaign row
- Format data for display
- Handle click events for edit/delete

---

### **2.4 CampaignForm**

**Location:** `components/campaigns/CampaignForm.tsx`

Reusable form for creating and editing campaigns. **MVP uses basic HTML inputs - no custom multi-select components.**

```typescript
interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: Omit<Campaign, '_id'>) => Promise<void>;
  isLoading?: boolean;
}

export function CampaignForm({ campaign, onSubmit, isLoading = false }: CampaignFormProps) {
  const [formData, setFormData] = useState<Omit<Campaign, '_id'>>({
    user_id: '',
    campaign_name: campaign?.campaign_name || '',
    budget_goal_usd: campaign?.budget_goal_usd || 0,
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    target_age_min: campaign?.target_age_min || 18,
    target_age_max: campaign?.target_age_max || 99,
    target_gender: campaign?.target_gender || 'All',
    geo_countries: campaign?.geo_countries || [],
    geo_states: campaign?.geo_states || [],
    geo_cities: campaign?.geo_cities || [],
    geo_zip_codes: campaign?.geo_zip_codes || [],
    inventory: campaign?.inventory || [],
    screens: campaign?.screens || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate all fields (see validation.ts for detailed rules)
    const nameError = validateCampaignName(formData.campaign_name);
    if (nameError) newErrors.campaign_name = nameError;

    const budgetError = validateBudget(formData.budget_goal_usd);
    if (budgetError) newErrors.budget_goal_usd = budgetError;

    const dateError = validateDateRange(formData.start_date, formData.end_date);
    if (dateError) newErrors.dates = dateError;

    const ageError = validateAgeRange(formData.target_age_min, formData.target_age_max);
    if (ageError) newErrors.age = ageError;

    if (formData.geo_countries.length === 0) {
      newErrors.geo_countries = 'Please select at least one country';
    }

    if (formData.inventory.length === 0) {
      newErrors.inventory = 'Please select at least one publisher';
    }

    if (formData.screens.length === 0) {
      newErrors.screens = 'Please select at least one device type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    await onSubmit(formData);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="campaign_name">Campaign Name *</Label>
            <Input
              id="campaign_name"
              value={formData.campaign_name}
              onChange={(e) => handleFieldChange('campaign_name', e.target.value)}
            />
            {errors.campaign_name && (
              <p className="text-sm text-destructive mt-1">{errors.campaign_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="budget_goal_usd">Budget Goal (USD) *</Label>
            <Input
              id="budget_goal_usd"
              type="number"
              value={formData.budget_goal_usd}
              onChange={(e) => handleFieldChange('budget_goal_usd', Number(e.target.value))}
            />
            {errors.budget_goal_usd && (
              <p className="text-sm text-destructive mt-1">{errors.budget_goal_usd}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleFieldChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleFieldChange('end_date', e.target.value)}
              />
            </div>
          </div>
          {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
        </CardContent>
      </Card>

      {/* Targeting */}
      <Card>
        <CardHeader>
          <CardTitle>Targeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_age_min">Minimum Age *</Label>
              <Input
                id="target_age_min"
                type="number"
                min="18"
                max="99"
                value={formData.target_age_min}
                onChange={(e) => handleFieldChange('target_age_min', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="target_age_max">Maximum Age *</Label>
              <Input
                id="target_age_max"
                type="number"
                min="18"
                max="99"
                value={formData.target_age_max}
                onChange={(e) => handleFieldChange('target_age_max', Number(e.target.value))}
              />
            </div>
          </div>
          {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}

          <div>
            <Label>Target Gender *</Label>
            <RadioGroup
              value={formData.target_gender}
              onValueChange={(value) => handleFieldChange('target_gender', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="All" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Targeting - SIMPLIFIED FOR MVP */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Targeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Countries * (Select at least one)</Label>
            <div className="space-y-2 mt-2">
              {['USA', 'Canada', 'Mexico', 'UK'].map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={country}
                    checked={formData.geo_countries.includes(country)}
                    onCheckedChange={(checked) => {
                      const newCountries = checked
                        ? [...formData.geo_countries, country]
                        : formData.geo_countries.filter(c => c !== country);
                      handleFieldChange('geo_countries', newCountries);
                    }}
                  />
                  <Label htmlFor={country}>{country}</Label>
                </div>
              ))}
            </div>
            {errors.geo_countries && (
              <p className="text-sm text-destructive mt-1">{errors.geo_countries}</p>
            )}
          </div>

          <div>
            <Label htmlFor="geo_states">States (Optional, comma-separated)</Label>
            <Input
              id="geo_states"
              placeholder="California, Texas, New York"
              value={formData.geo_states.join(', ')}
              onChange={(e) => handleFieldChange(
                'geo_states',
                e.target.value.split(',').map(s => s.trim()).filter(s => s)
              )}
            />
          </div>

          <div>
            <Label htmlFor="geo_cities">Cities (Optional, comma-separated)</Label>
            <Input
              id="geo_cities"
              placeholder="Los Angeles, Houston, Chicago"
              value={formData.geo_cities.join(', ')}
              onChange={(e) => handleFieldChange(
                'geo_cities',
                e.target.value.split(',').map(c => c.trim()).filter(c => c)
              )}
            />
          </div>

          <div>
            <Label htmlFor="geo_zip_codes">Zip Codes (Optional, comma-separated)</Label>
            <Input
              id="geo_zip_codes"
              placeholder="90001, 77001, 60601"
              value={formData.geo_zip_codes.join(', ')}
              onChange={(e) => handleFieldChange(
                'geo_zip_codes',
                e.target.value.split(',').map(z => z.trim()).filter(z => z)
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory & Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory & Devices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Publishers / Inventory * (Select at least one)</Label>
            <div className="space-y-2 mt-2">
              {['Hulu', 'Discovery', 'ABC', 'A&E', 'TLC', 'Fox News', 'Fox Sports'].map((pub) => (
                <div key={pub} className="flex items-center space-x-2">
                  <Checkbox
                    id={pub}
                    checked={formData.inventory.includes(pub)}
                    onCheckedChange={(checked) => {
                      const newInventory = checked
                        ? [...formData.inventory, pub]
                        : formData.inventory.filter(p => p !== pub);
                      handleFieldChange('inventory', newInventory);
                    }}
                  />
                  <Label htmlFor={pub}>{pub}</Label>
                </div>
              ))}
            </div>
            {errors.inventory && (
              <p className="text-sm text-destructive mt-1">{errors.inventory}</p>
            )}
          </div>

          <div>
            <Label>Screens / Devices * (Select at least one)</Label>
            <div className="space-y-2 mt-2">
              {['CTV', 'Mobile Device', 'Web Browser'].map((screen) => (
                <div key={screen} className="flex items-center space-x-2">
                  <Checkbox
                    id={screen}
                    checked={formData.screens.includes(screen)}
                    onCheckedChange={(checked) => {
                      const newScreens = checked
                        ? [...formData.screens, screen]
                        : formData.screens.filter(s => s !== screen);
                      handleFieldChange('screens', newScreens);
                    }}
                  />
                  <Label htmlFor={screen}>{screen}</Label>
                </div>
              ))}
            </div>
            {errors.screens && (
              <p className="text-sm text-destructive mt-1">{errors.screens}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}
```

**Props:**
- `campaign?: Campaign` - Optional existing campaign for edit mode
- `onSubmit: (data: Omit<Campaign, '_id'>) => Promise<void>` - Submit callback
- `isLoading?: boolean` - Loading state for submit button

**Responsibilities:**
- Render all campaign form fields
- Manage form state
- Validate all inputs
- Display inline error messages
- Support both create and edit modes
- Call onSubmit with validated data

---

### **2.5 DeleteConfirmDialog**

**Location:** `components/campaigns/DeleteConfirmDialog.tsx`

Confirmation dialog for campaign deletion.

```typescript
interface DeleteConfirmDialogProps {
  campaignName: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({ campaignName, onConfirm }: DeleteConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Campaign</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the campaign "{campaignName}". 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Props:**
- `campaignName: string` - Name to display in confirmation
- `onConfirm: () => Promise<void>` - Delete callback

**Responsibilities:**
- Render delete button trigger
- Show confirmation dialog
- Handle delete confirmation
- Display loading state during deletion

---

### **2.6 EmptyState**

**Location:** `components/campaigns/EmptyState.tsx`

Display when no campaigns exist.

```typescript
export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FolderOpenIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
      <p className="text-muted-foreground mb-4">
        Get started by creating your first campaign.
      </p>
      <Button onClick={() => router.push('/dashboard/new')}>
        Create Campaign
      </Button>
    </div>
  );
}
```

**Props:** None

**Responsibilities:**
- Display empty state message
- Provide action to create first campaign

---

## **3. Layout Components**

### **3.1 Header**

**Location:** `components/layout/Header.tsx`

Application header with branding and user menu.

```typescript
export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  const userId = getActiveUserId();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-bold">JamLoop CMS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Logged in as: {userId}
          </span>
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
```

**Props:** None

**Responsibilities:**
- Display app branding
- Show current user
- Provide logout functionality

---

## **4. Utility Components**

### **4.1 MultiSelect**

**❌ REMOVED FOR MVP** - Use basic checkboxes and comma-separated text inputs instead. This custom component adds unnecessary complexity.

---

## **5. Component Reusability Patterns**

### **5.1 Form Component Pattern**

The `CampaignForm` is designed to be reusable for both create and edit:

```typescript
// Create mode
<CampaignForm onSubmit={handleCreate} isLoading={isSubmitting} />

// Edit mode
<CampaignForm 
  campaign={existingCampaign}
  onSubmit={handleUpdate}
  isLoading={isSubmitting}
/>
```

### **5.2 Callback Pattern**

Components receive callbacks as props rather than handling navigation themselves:

```typescript
// Parent handles navigation
const handleEdit = (id: string) => {
  router.push(`/dashboard/edit/${id}`);
};

// Child just calls the callback
<CampaignTable onEdit={handleEdit} />
```

### **5.3 Error Handling Pattern**

Errors are displayed inline near the relevant field:

```typescript
{errors.campaign_name && (
  <p className="text-sm text-destructive mt-1">{errors.campaign_name}</p>
)}
```

---

## **6. ShadCN UI Components Used**

The following ShadCN components are utilized:

| Component | Usage |
|-----------|-------|
| `Button` | All clickable actions |
| `Input` | Text, number, and **date inputs** (type="date") |
| `Label` | Form field labels |
| `Card` | Section containers |
| `Table` | Campaign listing |
| `Checkbox` | Multi-select options (countries, inventory, screens) |
| `RadioGroup` | Gender selection |
| `AlertDialog` | Delete confirmation |
| `Toast` | Success/error notifications |

**Removed for MVP:**
- ~~`Select`~~ - Not needed, using checkboxes
- ~~`DatePicker`~~ - Using native HTML5 date input
- ~~`Popover`~~ - Not needed
- ~~`Command`~~ - Not needed

---

## **7. State Management Strategy**

### **7.1 Local Component State**

Use `useState` for component-specific state:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState<Campaign>({...});
```

### **7.2 Shared Auth State**

**For MVP, use simple localStorage helper functions** instead of Context API:

```typescript
// lib/auth/session.ts
export function getActiveUserId(): string | null {
  return localStorage.getItem('user_id');
}

export function setActiveUserId(userId: string): void {
  localStorage.setItem('user_id', userId);
}

export function clearActiveUserId(): void {
  localStorage.removeItem('user_id');
}

export function isAuthenticated(): boolean {
  return !!getActiveUserId();
}
```

**❌ REMOVED FOR MVP:** AuthContext/AuthProvider - Adds unnecessary complexity. Use simple utility functions instead.

---

## **8. Component Testing Checklist**

- [ ] Components render without errors
- [ ] Props are correctly typed with TypeScript
- [ ] Form validation displays appropriate errors
- [ ] Buttons are disabled during loading states
- [ ] Callbacks are invoked with correct parameters
- [ ] Empty states display when data is empty
- [ ] Error states display when data fails to load
- [ ] Navigation works correctly
- [ ] User cannot access unauthorized campaigns

---

## **Reference Links**

- **Project Requirements**: [docs/requirements.md](./requirements.md)
- **API Documentation**: [docs/api.md](./api.md)
- **Code Style Guide**: [docs/style-guide.md](./style-guide.md)
- **ShadCN UI**: [https://ui.shadcn.com](https://ui.shadcn.com)

---

**Note**: This component structure prioritizes reusability, type safety, and clear separation of concerns while maintaining simplicity for the PoC scope.
