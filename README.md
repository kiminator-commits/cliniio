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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
