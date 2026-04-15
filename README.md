# <img src="https://user-images.githubusercontent.com/74038190/233945377-d0c10fde-0845-43dc-ae71-6a79456f3777.png" alt="DealKro" width="50" height="50"/> **DealKro** - NextGen Classifieds Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node-18-green?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express.js)
![MongoDB](https://img.shields.io/badge/MongoDB-4F46E5?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&color=010101)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448D0?style=for-the-badge&logo=cloudinary)

[![GitHub stars](https://img.shields.io/github/stars/yourusername/dealkro-backend?style=social)](https://github.com/yourusername/dealkro-backend)
[![GitHub license](https://img.shields.io/badge/license-MIT-green)](https://github.com/yourusername/dealkro-backend/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/dealkro-backend)](https://github.com/yourusername/dealkro-backend/issues)

</div>

## 🚀 **Production-Ready OLX Clone**

**DealKro** is full-featured classifieds marketplace backend with **AI Auto-Moderation**, **Real-time Chat**, **Multi-Image Upload**, **Professional Email System** & **Admin Dashboard**!

### ✨ **Key Features**

<div align="center">

| 🎯 **Core** | 🔐 **Security** | ⚡ **Performance** |
|-------------|-----------------|-------------------|
| Email/Phone Auth | JWT + Rate Limiting | Pagination + Indexes |
| Product Listing | Helmet + Validation | Optimized Queries |
| Real-time Chat | Admin Middleware | Mongo Indexes |
| Cloudinary Images | Password Reset | Async Processing |
| Auto Moderation | Role Protection | Email Queue Ready |

</div>

## 🛠 **Step-by-Step Setup**

### 1. Prerequisites
```bash
Node.js v18+
MongoDB Atlas account (free)
Cloudinary account (free)
Gmail App Password (for emails - optional)
```

### 2. Clone & Install
```bash
cd backend
npm install
```

### 3. Environment Configuration (Critical!)
```bash
cp .env.example .env
```

**Edit `.env` with your real values:**

```
# MongoDB Atlas (create free cluster)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dealkro?...

# JWT (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-64-char-secret-here-change-this

# Cloudinary (dashboard.cloudin
ary.com → Account Details)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Gmail (for emails - optional)
NODEMAILER_USER=your@gmail.com  
NODEMAILER_PASS=your-app-password
```

### 4. Seed Admin User
```bash
node seeders/adminSeeder.js
```
```
✅ Admin created: admin@dealkro.com / admin123
💡 Login: http://localhost:5173/login
```

### 5. Start Development Server
```bash
npm run dev
```
```
🌟 DealKro running @ http://localhost:5000
📊 MongoDB Connected: cluster0.xxxxx
🔌 Socket Ready on port 5000
```

### 6. Frontend Connection
Update Frontend `src/services/api.js`:
```js
const API_BASE = 'http://localhost:5000/api'
```

## 📱 **API Endpoints**

```
Base URL: http://localhost:5000/api
```

**Auth:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
```

**Products:**
```
POST /api/products     # AI Auto-moderated
GET /api/products      # Approved only
```

**Chat:**
```
POST /api/chat/create
GET /api/chats
POST /api/chats/:id/message
```

**Admin:**
```
GET /api/admin/dashboard
POST /api/admin/products/:id/approve
```

## 🏗 **Project Structure**

```
src/
├── config/     # db.js env.js cloudinary.js
├── middleware/ # auth.js admin.js upload.js
├── modules/    # auth/ user/ product/ chat/ admin/
└── utils/      # token.js email.js
```

## 🔧 **Production Deployment**

| Platform | Status |
|----------|--------|
| Railway | ✅ 1-click |
| Render | ✅ Docker |
| Vercel | ⚠️ Serverless (Socket tricky) |

## 🤝 **Contributing**

1. Fork & clone
2. `npm i && cp .env.example .env`
3. Create feature branch
4. PR to `main` ✨

## 📄 **License**
MIT - Free for commercial use!

---

<div align=\"center\">
**Built with ❤️ for Local Buy/Sell Revolution! 🚀**
</div>
