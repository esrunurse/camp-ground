# Campground Booking API

Backend REST API for a campground booking website. Users register, browse campgrounds and book up to 3 nights. They can view, edit and cancel their own bookings and apply promotion codes for a discount. Admins manage campgrounds, promotion codes and all bookings.

Built with Express, Mongoose (MongoDB) and JWT authentication.

## Prerequisites

- Node.js 20 or newer
- A MongoDB database (MongoDB Atlas or local)

### Command Scripts

1. **Install Dependencies**
   Installs all packages listed in `package.json`.

   ```sh
   npm install
   ```

2. **Create Environment File**
   Copy the example file, then fill in the empty values.

   ```sh
   cp config/example.env config/config.env
   ```

3. **Run Development Server**
   Starts the server with nodemon and restarts on file changes.

   ```sh
   npm run dev
   ```

4. **Run Production Server (Optional)**

   ```sh
   npm start
   ```

The API runs at `http://localhost:5003`.

# Project Structure

```plaintext
.
├── server.js        # Entry point of the application
├── config/          # Environment variables and database connection
├── controllers/     # Request handlers (business logic for each resource)
├── middleware/      # Authentication and role checks
├── models/          # Mongoose schemas
├── routes/          # API route definitions
└── postman/         # Postman collection for API testing
```

# API Endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/logout` | Public |
| GET | `/api/v1/auth/me` | Logged in |
| GET | `/api/v1/campgrounds` | Public |
| GET | `/api/v1/campgrounds/:id` | Public |
| POST | `/api/v1/campgrounds` | Admin |
| PUT, DELETE | `/api/v1/campgrounds/:id` | Admin |
| GET | `/api/v1/bookings` | Logged in (user sees own, admin sees all) |
| GET, PUT, DELETE | `/api/v1/bookings/:id` | Owner or admin |
| POST | `/api/v1/campgrounds/:campgroundId/bookings` | User or admin |
| GET, POST | `/api/v1/promotioncodes` | Admin |
| GET, PUT, DELETE | `/api/v1/promotioncodes/:id` | Admin |

Send the token as `Authorization: Bearer <token>`.