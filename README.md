# Cliniio 2.0

A modern healthcare management system built with React, TypeScript, and Tailwind CSS.

## Features

- Modern, responsive UI design
- Secure authentication system
- OAuth integration (Google, Microsoft, Facebook, LinkedIn)
- Password strength validation
- Remember me functionality
- Device management
- Gamification System
  - Points-based task completion
  - Available points display for incomplete tasks
  - Total points tracking in gamification dashboard
  - Points automatically update when tasks are completed
  - Level progression based on total points earned

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM
- React Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/kiminator-commits/cliniio2.0.git
```

2. Install dependencies:

```bash
cd cliniio2.0
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
cliniio2.0/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── styles/        # Global styles and CSS modules
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── docs/             # Documentation
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### Workflows

1. **CI Workflow** (`.github/workflows/ci.yml`)
   - Runs on push to main/master/newmainbranch3.0 and pull requests
   - Tests on Node.js 18 and 20
   - Runs linting, tests with coverage, and security audits
   - Uploads coverage reports to Codecov
   - Builds the application to verify it compiles correctly

2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
   - Runs after successful CI completion
   - Builds and deploys the application
   - Currently includes placeholder deployment steps

3. **Pull Request Checks** (`.github/workflows/pr-checks.yml`)
   - Runs dependency review and security analysis
   - Performs CodeQL analysis for security vulnerabilities

### Setting Up CI/CD

1. **Required Secrets** (set in GitHub repository settings):

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   CODECOV_TOKEN=your_codecov_token (optional)
   ```

2. **Optional Deployment Secrets** (for actual deployment):

   ```
   VERCEL_TOKEN=your_vercel_token
   ORG_ID=your_vercel_org_id
   PROJECT_ID=your_vercel_project_id
   NETLIFY_AUTH_TOKEN=your_netlify_token
   NETLIFY_SITE_ID=your_netlify_site_id
   ```

3. **Enable GitHub Actions**:
   - Go to your repository settings
   - Navigate to Actions > General
   - Ensure "Allow all actions and reusable workflows" is selected

### Local Testing

Before pushing, run these commands locally:

```bash
npm run lint          # Check code quality
npm run test:ci       # Run tests with coverage
npm run build         # Verify build works
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

The CI pipeline will automatically run tests and checks on your PR.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
