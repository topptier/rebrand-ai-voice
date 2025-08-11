# ReceptAI Core - AI Receptionist SaaS Platform

ReceptAI Core is a React + TypeScript + Vite web application that provides an enterprise AI receptionist platform for clinics, law firms, and professional services. The application uses Supabase for backend services, shadcn-ui for UI components, and Tailwind CSS for styling.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the information here.**

## Working Effectively

### Bootstrap and Setup
- Install dependencies: `npm install --legacy-peer-deps` -- takes 50-90 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
  - **CRITICAL**: The `--legacy-peer-deps` flag is REQUIRED due to date-fns version conflicts with react-day-picker
  - Without this flag, installation will fail with dependency resolution errors
- Run linting: `npm run lint` -- takes 2 seconds. Expect some warnings about React hooks dependencies and Fast Refresh components
- Build the application: `npm run build` -- takes 5 seconds. NEVER CANCEL. Set timeout to 60+ seconds.

### Development Workflow
- Start development server: `npm run dev` -- starts in 250-280ms on port 8080
  - Access at: http://localhost:8080/
  - Includes hot module replacement and automatic reloading
- Build for production: `npm run build` -- creates optimized build in `dist/` directory
- Preview production build: `npm run preview` -- serves production build on port 4173
- Development build: `npm run build:dev` -- builds in development mode

### Validation and Testing
- **CRITICAL**: NO test framework is configured. The repository does not have Jest, Vitest, or any testing setup.
- Always run `npm run lint` before committing changes or the build may have style issues
- ALWAYS manually validate UI changes by running the development server and testing in browser
- **MANUAL VALIDATION REQUIREMENT**: After making changes, always test the complete authentication flow:
  1. Start dev server with `npm run dev`
  2. Navigate to http://localhost:8080/
  3. Test both "Sign In" and "Sign Up" tabs
  4. Verify forms display correctly and validation works
  5. Note: Supabase connectivity may fail in sandboxed environments (ERR_BLOCKED_BY_CLIENT is expected)

## Project Architecture

### Key Technologies
- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1 with SWC plugin for fast compilation
- **UI Framework**: shadcn-ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Supabase (PostgreSQL database + Auth + Real-time)
- **State Management**: React Context + TanStack React Query
- **Routing**: React Router DOM 6.26.2
- **Package Manager**: npm (uses package-lock.json)

### Directory Structure
```
src/
├── components/           # React components
│   ├── auth/            # Authentication components (AuthGuard, etc.)
│   ├── dashboard/       # Dashboard-specific components
│   │   ├── Analytics.tsx
│   │   ├── CallActivity.tsx
│   │   ├── ClientManagement.tsx
│   │   ├── DashboardHeader.tsx
│   │   └── UserManagement.tsx
│   └── ui/              # shadcn-ui components (50+ components)
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── hooks/               # Custom React hooks
│   ├── useCalls.tsx     # Call management functionality
│   ├── useAppointments.ts
│   └── use-toast.ts
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions
│   └── utils.ts         # Tailwind class merging utilities
└── pages/               # Page components
    ├── Dashboard.tsx    # Main dashboard page
    └── NotFound.tsx     # 404 page
```

### Database and Backend
- **Supabase Project**: Pre-configured with credentials in `src/integrations/supabase/client.ts`
- **Database Schema**: Complete schema in `database_schema.sql` (organizations, users, calls, appointments)
- **Sample Data**: Test data available in `database_sample_data.sql`
- **RLS Policies**: Row Level Security policies in `database_rls_policies.sql`
- **Migrations**: Supabase migrations in `supabase/migrations/` directory

## Common Tasks

### Making UI Changes
- **All UI components** are in `src/components/ui/` and follow shadcn-ui patterns
- **Dashboard components** are in `src/components/dashboard/`
- **Always test changes** by running `npm run dev` and manually verifying in browser
- **Check responsive design** - components use Tailwind responsive classes

### Working with Authentication
- **Authentication state** is managed in `src/contexts/AuthContext.tsx`
- **Protected routes** use `AuthGuard` component
- **Sign-in/Sign-up forms** are embedded in the main page with tab switching
- **Supabase auth** handles user registration and login

### Database Development
- **Schema changes**: Update `database_schema.sql` for new tables/columns
- **Type safety**: Regenerate types in `src/integrations/supabase/types.ts` after schema changes
- **Local development**: Supabase CLI not required - uses hosted Supabase instance

### Build and Deployment
- **Production build**: `npm run build` creates optimized bundles in `dist/`
- **Bundle analysis**: Build outputs bundle sizes and warnings for large chunks (>500KB)
- **Environment modes**: Supports development and production build modes
- **Asset optimization**: Vite handles code splitting and asset optimization

## Troubleshooting

### Common Issues
- **Dependency installation fails**: Always use `npm install --legacy-peer-deps`
- **ESLint errors**: The codebase has some existing ESLint warnings - focus only on new errors you introduce
- **Supabase connection errors**: Expected in sandboxed environments (ERR_BLOCKED_BY_CLIENT)
- **Large bundle warning**: Current build has 650KB main bundle - this is normal for this application

### Performance Notes
- **Hot reload**: Development server includes fast refresh for React components
- **Build optimization**: Vite automatically optimizes imports and creates efficient bundles
- **Database queries**: Uses TanStack React Query for caching and optimization

## Key Files Reference

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path aliases (@/* -> ./src/*)
- `tailwind.config.ts` - Tailwind CSS configuration with custom design system
- `vite.config.ts` - Vite build configuration
- `eslint.config.js` - ESLint configuration with React and TypeScript rules

### Entry Points
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root component with routing and providers
- `index.html` - HTML template

### Critical Dependencies
- React ecosystem (react, react-dom, react-router-dom)
- Supabase client (@supabase/supabase-js)
- UI components (40+ @radix-ui packages)
- Build tooling (vite, typescript, eslint)
- Styling (tailwindcss, autoprefixer)

## CRITICAL REMINDERS
- **NEVER CANCEL** npm install or build commands - they complete quickly but set appropriate timeouts
- **ALWAYS USE** `--legacy-peer-deps` flag with npm install
- **NO TESTS** exist - manual validation is required for all changes
- **MANUAL UI TESTING** is mandatory after any component changes
- **LINT BEFORE COMMIT** to avoid build issues with existing warnings

## Common Command Outputs

The following are outputs from frequently run commands. Reference them instead of viewing, searching, or running bash commands to save time.

### Repository Root Structure
```
ls -la /home/runner/work/rebrand-ai-voice/rebrand-ai-voice
.git/
.github/
.gitignore
README.md
bun.lockb
components.json
database_rls_policies.sql
database_sample_data.sql
database_schema.sql
eslint.config.js
index.html
node_modules/
package-lock.json
package.json
postcss.config.js
public/
src/
supabase/
tailwind.config.ts
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

### Key npm Scripts
```
npm run dev    # Development server on port 8080
npm run build  # Production build
npm run lint   # ESLint checking
npm run preview # Preview production build on port 4173
npm run build:dev # Development build
```

### Known ESLint Issues (Existing - Don't Fix)
- React Hook useEffect missing dependencies (dashboard components)
- Fast refresh warnings for exported constants/functions
- Empty object type interface warnings
- require() import in tailwind.config.ts

### Expected Build Output
```
✓ built in 4.36s
dist/index.html                   1.00 kB │ gzip:   0.43 kB
dist/assets/index-BSmw9m18.css   61.40 kB │ gzip:  10.91 kB
dist/assets/index-D6fRzhbv.js   659.46 kB │ gzip: 192.85 kB
(!) Some chunks are larger than 500 kB after minification.
```