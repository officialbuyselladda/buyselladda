import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 🔥 Fix __dirname (ESM me required)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Force correct .env path (backend root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import User from '../src/modules/user/user.model.js';
import AdminService from '../src/modules/admin/admin.service.js';

const ADMIN_EMAIL = 'admin@dealkro.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'Super Admin';

const seedAdmin = async () => {
  try {
    // 🔍 Debug check (important)
    console.log("MONGO URI:", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI missing in .env file");
    }

    // ✅ Connect DB
    await connectDB();

    // ✅ Check existing admin
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('✅ Admin already exists:', ADMIN_EMAIL);
      process.exit(0);
    }

    // ✅ Create admin
    const adminService = new AdminService();
    const admin = await adminService.registerAdmin({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('💡 Login: http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
