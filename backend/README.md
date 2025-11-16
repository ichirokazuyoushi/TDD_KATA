# Sweet Shop Backend API

RESTful API for the Sweet Shop Management System built with Node.js, TypeScript, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sweet-shop
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Run development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

## API Documentation

See main README.md for endpoint documentation.

## Project Structure

- `src/models/` - MongoDB models (User, Sweet)
- `src/controllers/` - Route controllers
- `src/routes/` - Express routes
- `src/middleware/` - Authentication and validation middleware
- `src/config/` - Database configuration
- `src/__tests__/` - Test files

