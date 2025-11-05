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
- **Responsive UI**: Built with ShadCN UI components and Tailwind CSS

### Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Data Persistence**: crudcrud.com (temporary REST API for PoC)
- **Deployment**: Vercel

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

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_CRUDCRUD_ENDPOINT=https://crudcrud.com/api/de2a072c07d24feeb8cc5c4f4268bcf1
```

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
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[ShadCN UI](https://ui.shadcn.com/)** - UI component library
- **[crudcrud.com API](https://crudcrud.com)** - Temporary data persistence service

## Key Security Features (PoC)

This PoC uses **simulated authentication** with client-side data isolation:

1. Login form with hardcoded credentials
2. Session management via localStorage/cookie
3. Client-side filtering by `user_id`
4. Auto-injection of `user_id` on write operations
5. Protected routes with redirect to login

