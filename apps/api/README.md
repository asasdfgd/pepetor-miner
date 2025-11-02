# PEPETOR-MINER Backend API

Express.js REST API server with MongoDB database integration, built with Node.js.

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## Project Structure

```
src/
├── index.js              # Main server entry point
├── config/
│   └── database.js       # MongoDB connection configuration
├── models/
│   └── User.js          # User data model with schema
├── controllers/
│   └── userController.js # Business logic for user operations
├── routes/
│   └── userRoutes.js    # User API route definitions
├── middleware/          # Custom middleware (placeholder)
└── utils/               # Utility functions (placeholder)
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and database connection status.

### API Documentation
```
GET /api
```
Lists all available endpoints.

### User Management

**Get all users**
```
GET /api/users
```

**Get user by ID**
```
GET /api/users/:id
```

**Create new user**
```
POST /api/users
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

**Update user**
```
PUT /api/users/:id
Content-Type: application/json

{
  "fullName": "John Updated",
  "role": "admin"
}
```

**Delete user**
```
DELETE /api/users/:id
```

## Database Configuration

### Local MongoDB

1. Install MongoDB locally:
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **Linux**: `apt-get install mongodb`

2. Start MongoDB:
   ```bash
   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. Verify connection:
   ```bash
   mongo
   ```

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/pepetor-miner`
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pepetor-miner
   ```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/pepetor-miner

# Authentication (Future)
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email (Future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# External APIs (Future)
API_KEY_EXTERNAL=your_api_key
```

## Data Models

### User Model
- `username` - Unique username (min 3 chars)
- `email` - Unique email address
- `password` - Encrypted password (min 6 chars)
- `fullName` - User's full name
- `avatar` - Avatar URL
- `role` - User role (user, admin, moderator)
- `isActive` - Account active status
- `lastLogin` - Last login timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Testing Endpoints

### Using cURL

```bash
# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Get all users
curl http://localhost:3001/api/users

# Get specific user
curl http://localhost:3001/api/users/[USER_ID]

# Update user
curl -X PUT http://localhost:3001/api/users/[USER_ID] \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Updated Name"}'

# Delete user
curl -X DELETE http://localhost:3001/api/users/[USER_ID]
```

### Using Postman

1. Import API collection from `/docs/postman-collection.json` (if available)
2. Set environment variables
3. Run requests

## Development

### Available Scripts

```bash
npm start       # Production server
npm run dev     # Development server with auto-reload
npm test        # Run tests
npm run lint    # Run ESLint
npm run lint:fix # Fix ESLint issues
```

### Adding New Routes

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Mount routes in `src/index.js`

## Future Enhancements

- [ ] Password hashing with bcrypt
- [ ] JWT authentication middleware
- [ ] Input validation with Joi/Zod
- [ ] Unit and integration tests
- [ ] Pagination and filtering
- [ ] API rate limiting
- [ ] Database indexing and optimization
- [ ] Logging system
- [ ] Error tracking (Sentry)
- [ ] API documentation (Swagger/OpenAPI)

## Deployment

### Heroku
```bash
heroku create pepetor-miner-api
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
```

### Docker
```bash
docker build -t pepetor-miner-api .
docker run -p 3001:3001 -e MONGODB_URI=your_mongodb_uri pepetor-miner-api
```

### AWS EC2 / DigitalOcean
```bash
npm install
PORT=3001 npm start
```

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `.env`
- Check firewall settings for port 27017
- For Atlas, ensure IP whitelist includes your machine

### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URL
- Check browser console for specific error

### Port Already in Use
```bash
# Find and kill process on port 3001
lsof -i :3001
kill -9 <PID>
```

## Support

For issues, check:
- Server logs for error messages
- MongoDB logs: `tail -f /var/log/mongodb/mongod.log`
- Network connectivity: `ping localhost`

## License

ISC
