# JamLoop Campaign Management System (CMS)

A secure campaign management system for creating, managing, and viewing video advertisement campaigns targeted at JamLoop-connected inventory.

## Project Overview

This is a proof-of-concept (PoC) Next.js application that demonstrates strict data isolation and full CRUD functionality for campaign management. The core principle is **security and isolation**, ensuring each user can only interact with their own campaign data.

**For complete product requirements, technical specifications, and implementation details, see [docs/requirements.md](./docs/requirements.md).**

### Key Features

- **Simulated Authentication**: Login with hardcoded credentials for user isolation testing
- **Complete CRUD Operations**: Create, read, update, and delete campaigns
- **Data Isolation**: Client-side filtering ensures users only see their own campaigns
- **Form Validation**: Real-time validation with user feedback
- **Edit & Delete**: Full campaign management with update and delete capabilities
- **Toast Notifications**: Real-time feedback for all operations
- **Responsive UI**: Built with ShadCN UI components and Tailwind CSS

### Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Data Persistence**: crudcrud.com (temporary REST API for PoC)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jamloop-cms
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment (Optional):

**Note**: The application now automatically manages CrudCrud resource IDs. No manual configuration is needed!

The system will:
- Automatically fetch a new resource ID after login
- Store it in browser localStorage with expiration tracking
- Auto-refresh when the 24-hour expiration period passes
- Handle expired resources seamlessly with retry logic

If you want to manually clear the cached resource ID, you can:
- Open browser DevTools → Application → Local Storage
- Delete `crudcrud_resource_id` and `crudcrud_resource_timestamp`

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Credentials

Use these credentials to simulate different user sessions:

- **User A**: `user_A` / `password_A`
- **User B**: `user_B` / `password_B`

## Project Structure

```
jamloop-cms/
├── app/
│   ├── login/              # Login page
│   ├── dashboard/          # Campaign listing
│   │   ├── new/           # Create campaign form
│   │   └── edit/[id]/     # Edit campaign form
│   └── api/
│       └── campaigns/      # API routes for CRUD operations
├── components/             # Reusable React components
├── lib/                    # Utility functions and API client
├── docs/
│   └── requirements.md     # Complete requirements document
└── public/                # Static assets
```

## Documentation

- **[Complete Requirements & Specifications](./docs/requirements.md)** - Full PRD including data model, user stories, validation rules, and implementation roadmap
- **[API Documentation](./docs/api.md)** - REST API endpoints and data model specifications
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[ShadCN UI](https://ui.shadcn.com/)** - UI component library
- **[crudcrud.com API](https://crudcrud.com)** - Temporary data persistence service

## Dynamic Resource ID Management

The application automatically handles CrudCrud's 24-hour resource ID expiration:

### How It Works

1. **Automatic Fetching**: On first login, the system fetches a fresh resource ID from CrudCrud
2. **Local Caching**: Resource ID is stored in localStorage with a timestamp
3. **Expiration Tracking**: System checks if the resource ID is older than 24 hours
4. **Auto-Refresh**: Expired resource IDs are automatically replaced with new ones
5. **Retry Logic**: API errors due to expired resources trigger automatic renewal

### Implementation Details

- **Resource Manager**: `lib/api/resourceManager.ts` handles all resource ID operations
- **Storage Keys**: 
  - `crudcrud_resource_id` - The current resource ID
  - `crudcrud_resource_timestamp` - When it was created
- **Expiration**: 24 hours from creation time
- **Persistence**: Resource IDs are kept across sessions (even after logout) if not expired

### Manual Management (Advanced)

If needed, you can manually manage resource IDs:

**View current resource ID:**
```javascript
// In browser console
localStorage.getItem('crudcrud_resource_id')
localStorage.getItem('crudcrud_resource_timestamp')
```

**Clear cached resource ID:**
```javascript
// In browser console
localStorage.removeItem('crudcrud_resource_id')
localStorage.removeItem('crudcrud_resource_timestamp')
// Or use DevTools → Application → Local Storage
```

**Check expiration status:**
- Open browser console on the app
- Look for log messages like:
  - `✓ Using cached resource ID: abc123 (expires: ...)`
  - `⚠️ Resource ID expired, fetching new one...`
  - `🔑 New CrudCrud resource ID stored: xyz789`

### Troubleshooting

**"Failed to fetch" errors:**
- The system should automatically retry with a new resource ID
- Check browser console for detailed error messages
- Ensure internet connection is active
- Try clearing the cached resource ID manually

**Data appears to be lost:**
- CrudCrud resource IDs are isolated - each ID has its own data store
- When a new resource ID is generated, previous data is not accessible
- This is expected behavior for the PoC setup
- For production, use a persistent database

## ~~Updating CrudCrud Resource ID~~ (Deprecated)

**Note**: This section is deprecated. The system now handles resource IDs automatically. See "Dynamic Resource ID Management" above.

## Key Security Features (PoC)

This PoC uses **simulated authentication** with client-side data isolation:

1. Login form with hardcoded credentials
2. Session management via localStorage/cookie
3. Client-side filtering by `user_id`
4. Auto-injection of `user_id` on write operations
5. Protected routes with redirect to login

