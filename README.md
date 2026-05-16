<div align="center">
  <img src="/logo-1.png" alt="BuySellAdda" width="180" />

  # BuySellAdda Backend

  Har Deal, Ek Nayi Shuruaat

  A production-ready classifieds marketplace API for products, users, chats, admin workflows, notifications, uploads, content pages, and password recovery.

  ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)
  ![Cloudinary](https://img.shields.io/badge/Cloudinary-Uploads-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
</div>

## Overview

BuySellAdda Backend powers the web dashboard and Flutter app with secure authentication, product listings, real-time chat, admin moderation, Cloudinary media upload, geocoding, notification emails, and dynamic website content.

## Features

| Area | What it includes |
| --- | --- |
| Authentication | Register, login, admin login, JWT auth, forgot password, reset password |
| Products | Create, update, list, search, categories, Cloudinary image upload |
| Chat | User chats, messages, Socket.io realtime updates |
| Admin | Dashboard, users, products, reports, moderation, notifications, content pages |
| Website Content | Dynamic footer, privacy, terms, help, safety, support pages |
| Safety | Rate limiting, Helmet, validation, role middleware |
| Location | Forward and reverse geocoding support |

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT + bcryptjs
- Cloudinary + multer
- Nodemailer
- Joi validation

## Quick Start

```bash
cd backend
npm install
npm run dev
```

The API runs on:

```text
http://localhost:5000/api
```

## Environment

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/buyselladda
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
GOOGLE_MAPS_API_KEY=
```

## Scripts

```bash
npm run dev            # Start with nodemon
npm start              # Start production server
npm run seed:products  # Seed sample products
node seeders/adminSeeder.js
```

Default seeded admin:

```text
admin@buyselladda.com / admin123
```

## Main API Routes

| Module | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin-login` |
| Password | `POST /api/auth/forgot-password`, `PUT /api/auth/reset-password/:token` |
| Products | `GET /api/products`, `POST /api/products`, `GET /api/products/:id` |
| Chats | `GET /api/chats`, `GET /api/chats/:id/messages`, `POST /api/chats/:id/send` |
| Admin | `/api/admin/*` |
| Content | `GET /api/content/site`, `GET /api/admin/content`, `PUT /api/admin/content` |
| Uploads | Product image upload through Cloudinary |

## Project Structure

```text
backend/
  src/
    config/        Database, env, email, cloudinary
    middleware/    Auth, admin, upload, rate limit
    modules/       Feature modules: auth, product, chat, admin, content
    utils/         Tokens, responses, email templates, errors
  seeders/         Admin and product seed data
  server.js        App entry point
```

## Deployment Notes

- Set `NODE_ENV=production`.
- Use a strong `JWT_SECRET`.
- Set `CLIENT_URL` to the deployed frontend URL.
- Add deployed domains to `ALLOWED_ORIGINS`.
- Configure production SMTP credentials.
- Keep MongoDB, Cloudinary, and email secrets out of source control.

## Brand

Name: `BuySellAdda`

Tagline: `Har Deal, Ek Nayi Shuruaat`

Logo asset: `/logo-1.png`
