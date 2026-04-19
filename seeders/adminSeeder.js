import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import authService from '../src/modules/auth/auth.service.js';
import User from '../src/modules/user/user.model.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dealkro.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = 'Super Admin';

const seedAdmin = async () => {
  try {
    console.log('🔌 Connecting to DB...');
    await connectDB();
    console.log('✅ DB connected');

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL, role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin already exists:', ADMIN_EMAIL);
      console.log('🔑 Password:', ADMIN_PASSWORD || 'Check .env ADMIN_PASSWORD');
      console.log('💡 Login: http://localhost:5173/admin/login');
      process.exit(0);
    }

    console.log('👤 Creating admin...');
    const newAdmin = await authService.register({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    // Force admin role
    newAdmin.role = 'admin';
    await newAdmin.save();

    console.log('✅ Super Admin created!');
    console.log('📧 Email:', newAdmin.email);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('🎉 Login: http://localhost:5173/admin/login');
    console.log('\n💡 Pro tip: Add to .env:\nADMIN_EMAIL=admin@dealkro.com\nADMIN_PASSWORD=yoursecurepass\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
