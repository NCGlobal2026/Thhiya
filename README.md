# Thhiya

A modern web platform for payroll and HR insights.

## Project Structure

This is a monorepo containing:

- **frontend**: React application built with Vite, TypeScript, and Tailwind CSS
- **backend**: Hono API server with Bun runtime, using MongoDB and Zod validation

## Getting Started

### Prerequisites

- Node.js (for frontend)
- Bun (for backend)
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dev-team-bug/thhiya.git
   cd thhiya
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..

   # Install backend dependencies
   cd backend
   bun install
   cd ..
   ```

3. Set up environment variables (create `.env` files as needed)

4. Start the development servers:
   ```bash
   # Backend
   cd backend
   bun run dev

   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query
- **Backend**: Hono, Bun, MongoDB, Mongoose, Zod
- **Package Manager**: npm (root), bun (backend)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private repository