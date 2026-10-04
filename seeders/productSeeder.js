import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import Product from '../src/modules/product/product.model.js';
import User from '../src/modules/user/user.model.js';
import authService from '../src/modules/auth/auth.service.js';

const SEED_PASSWORD = 'Seller@12345';
const uploadRoot = path.resolve(__dirname, '../', process.env.UPLOAD_DIR || 'uploads');
const seedImageDir = path.join(uploadRoot, 'seed');

const sellers = [
  { name: 'Rahul Sharma', email: 'rahul.sharma.bsa@gmail.com', location: 'Delhi' },
  { name: 'Neha Verma', email: 'neha.verma.deals@gmail.com', location: 'Mumbai' },
  { name: 'Amit Patel', email: 'amit.patel.market@gmail.com', location: 'Ahmedabad' },
  { name: 'Pooja Singh', email: 'pooja.singh.home@gmail.com', location: 'Lucknow' },
  { name: 'Karan Mehta', email: 'karan.mehta.sell@gmail.com', location: 'Pune' },
  { name: 'Simran Kaur', email: 'simran.kaur.bazaar@gmail.com', location: 'Chandigarh' },
];

const cityCoords = {
  Delhi: [77.1025, 28.7041],
  Mumbai: [72.8777, 19.0760],
  Ahmedabad: [72.5714, 23.0225],
  Lucknow: [80.9462, 26.8467],
  Pune: [73.8567, 18.5204],
  Chandigarh: [76.7794, 30.7333],
  Jaipur: [75.7873, 26.9124],
  Bangalore: [77.5946, 12.9716],
  Hyderabad: [78.4867, 17.3850],
};

const listings = [
  ['iPhone 13 128GB Blue', 'Electronics', 'Mobiles', 38500, 'Used', 'Battery health 87%, bill aur box available. Phone daily use me tha, koi major scratch nahi hai. Genuine buyer aaye, thoda negotiate ho jayega.', 'Delhi'],
  ['Samsung 43 inch Smart TV', 'Electronics', 'TVs', 21500, 'Used', 'Netflix YouTube sab smooth chal raha hai. Panel clean hai aur remote original hai. Naya TV upgrade kiya hai isliye sell kar raha hoon.', 'Mumbai'],
  ['HP Pavilion i5 Laptop', 'Electronics', 'Laptops', 29500, 'Used', 'Office aur study ke liye best hai. 8GB RAM, 512GB SSD, charger included. Keyboard aur display bilkul sahi working me hain.', 'Pune'],
  ['Activa 6G 2021 model', 'Vehicles', 'Scooters', 58500, 'Used', 'Single owner scooter hai, insurance valid hai. Mileage achha milta hai, service time se karayi hai. Local transfer possible.', 'Ahmedabad'],
  ['Royal Enfield Classic 350', 'Vehicles', 'Motorcycles', 142000, 'Used', 'Bike well maintained hai, silencer stock hai. Long ride ke liye comfortable. RC insurance clear, test ride serious buyer ko milegi.', 'Chandigarh'],
  ['Maruti Swift VXI 2018', 'Vehicles', 'Cars', 425000, 'Used', 'Family car hai, non accidental. AC chilling, tyres recently changed. Documents clear hain, direct owner deal.', 'Jaipur'],
  ['2BHK Flat for Rent', 'Property', 'Apartments', 18500, 'Used', 'Semi furnished flat, market aur metro paas me hai. Family ya working professionals ke liye suitable. Brokerage nahi, direct owner.', 'Delhi'],
  ['Main Road Shop Space', 'Property', 'Shops', 32000, 'Used', 'Ground floor shop hai with shutter. Footfall achha hai, cafe/mobile/accessories ke liye perfect location.', 'Lucknow'],
  ['Wooden Queen Size Bed', 'Furniture', 'Beds', 12500, 'Used', 'Strong sheesham wood bed with storage. Mattress optional hai. Shifting ki wajah se urgent sale.', 'Mumbai'],
  ['Dining Table 4 Chairs', 'Furniture', 'Dining', 8500, 'Used', 'Compact dining set, normal use marks hain but structure strong hai. Small family ke liye perfect.', 'Pune'],
  ['Branded Office Chair', 'Furniture', 'Office Furniture', 4200, 'Used', 'Height adjustable chair, cushion comfortable hai. Work from home setup ke liye good option.', 'Bangalore'],
  ['Women Saree Collection', 'Fashion', 'Women Clothing', 1800, 'New', 'Party wear sarees available, multiple colours. Boutique stock hai, quality achhi hai. Bulk lene par discount.', 'Lucknow'],
  ['Men Leather Jacket', 'Fashion', 'Men Clothing', 3200, 'Used', 'Winter jacket XL size, sirf 2-3 baar pehni hai. Condition almost new jaisi hai.', 'Delhi'],
  ['Kids Study Table', 'Kids', 'Kids Furniture', 2500, 'Used', 'Children ke study ke liye table with chair. Height comfortable hai, stickers lage hain but usable condition achhi hai.', 'Chandigarh'],
  ['Baby Stroller Foldable', 'Kids', 'Baby Gear', 4800, 'Used', 'Foldable stroller, wheels smooth hain. 6 months se 3 years tak use ho sakta hai. Clean and ready to use.', 'Mumbai'],
  ['Treadmill for Home', 'Sports', 'Fitness', 18500, 'Used', 'Home use treadmill hai, motor smooth hai. Display working, speed modes proper. Pickup buyer ko arrange karna hoga.', 'Hyderabad'],
  ['Guitar Yamaha F310', 'Hobbies', 'Musical Instruments', 7200, 'Used', 'Acoustic guitar with cover. Sound warm hai, beginners aur intermediate dono ke liye good.', 'Pune'],
  ['AC Repair Service', 'Services', 'Home Services', 499, 'New', 'Split/window AC service available. Gas filling, cleaning, installation sab ka kaam hota hai. Same day visit possible.', 'Delhi'],
  ['Home Deep Cleaning', 'Services', 'Cleaning', 1499, 'New', 'Kitchen, bathroom, sofa cleaning package available. Trained staff aur proper chemicals use hote hain.', 'Bangalore'],
  ['Delivery Executive Job', 'Jobs', 'Delivery', 22000, 'New', 'Full time delivery boy required. Bike aur smartphone hona chahiye. Salary plus incentive, joining immediate.', 'Mumbai'],
  ['Telecaller Required', 'Jobs', 'Sales', 16000, 'New', 'Hindi English basic communication chahiye. Freshers apply kar sakte hain. Office timing 10 to 6.', 'Lucknow'],
  ['Indie Puppy Adoption', 'Pets', 'Dogs', 0, 'Used', 'Healthy indie puppy adoption ke liye available. Sirf caring family contact kare. Vaccination guidance de denge.', 'Ahmedabad'],
  ['Aquarium with Filter', 'Pets', 'Aquarium', 3500, 'Used', '2 feet aquarium hai filter aur light ke saath. Clean condition me hai, shifting ke karan sell.', 'Chandigarh'],
  ['JEE Books Full Set', 'Books', 'Education', 2200, 'Used', 'Physics chemistry maths books ka complete set. Notes bhi included hain. Students ke liye useful material.', 'Jaipur'],
];

const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const colorFor = (category) => {
  const colors = {
    Electronics: ['#1d4ed8', '#dbeafe'],
    Vehicles: ['#b91c1c', '#fee2e2'],
    Property: ['#047857', '#d1fae5'],
    Furniture: ['#92400e', '#fef3c7'],
    Fashion: ['#be185d', '#fce7f3'],
    Kids: ['#7c3aed', '#ede9fe'],
    Sports: ['#15803d', '#dcfce7'],
    Hobbies: ['#4338ca', '#e0e7ff'],
    Services: ['#0369a1', '#e0f2fe'],
    Jobs: ['#4d7c0f', '#ecfccb'],
    Pets: ['#a16207', '#fef9c3'],
    Books: ['#6d28d9', '#f3e8ff'],
  };
  return colors[category] || ['#334155', '#f1f5f9'];
};

const createSeedImage = (listing, index) => {
  fs.mkdirSync(seedImageDir, { recursive: true });
  const [title, category] = listing;
  const filename = `${String(index + 1).padStart(2, '0')}-${slugify(title)}.svg`;
  const filePath = path.join(seedImageDir, filename);
  const [primary, background] = colorFor(category);
  const escapedTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650">
  <rect width="900" height="650" fill="${background}"/>
  <rect x="70" y="70" width="760" height="510" rx="28" fill="#ffffff" stroke="${primary}" stroke-width="8"/>
  <circle cx="740" cy="160" r="58" fill="${primary}" opacity="0.12"/>
  <circle cx="170" cy="500" r="76" fill="${primary}" opacity="0.10"/>
  <text x="450" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="${primary}">${escapedTitle}</text>
  <text x="450" y="355" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#334155">${category} listing</text>
  <text x="450" y="430" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">BuySellAdda local photo</text>
</svg>`;
  fs.writeFileSync(filePath, svg);
  return `/uploads/seed/${filename}`;
};

const ensureSellers = async () => {
  await User.deleteMany({ email: { $in: sellers.map((seller) => seller.email) } });
  const created = [];

  for (const seller of sellers) {
    const { user } = await authService.register({
      name: seller.name,
      email: seller.email,
      password: SEED_PASSWORD,
    });
    const userDoc = typeof user.toObject === 'function' ? user.toObject() : user;
    created.push({ ...userDoc, location: seller.location });
  }

  return created;
};

const buildProducts = (users) => listings.map((listing, index) => {
  const [title, category, subCategory, price, condition, description, location] = listing;
  const seller = users[index % users.length];
  const coordinates = cityCoords[location] || cityCoords.Delhi;
  const imageUrl = createSeedImage(listing, index);

  return {
    title,
    description,
    price,
    category,
    subCategory,
    condition,
    images: [{ public_id: imageUrl.replace('/uploads/', ''), url: imageUrl }],
    location,
    locationCoords: {
      type: 'Point',
      coordinates,
    },
    user: seller._id,
    views: 20 + index * 7,
    status: 'approved',
    approvedAt: new Date(),
    approvalSource: 'auto',
    slug: `${slugify(title)}-${index + 1}`,
    contentHash: `seed-genuine-${index + 1}`,
    searchVector: [],
  };
});

const seedProducts = async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB();

    await Product.deleteMany({
      $or: [
        { contentHash: { $regex: '^seed-' } },
        { title: { $regex: '^\\[SEED\\]' } },
      ],
    });
    console.log('Removed old seeded products');

    const users = await ensureSellers();
    console.log(`Created seed sellers: ${users.length}`);

    const products = await Product.insertMany(buildProducts(users));
    console.log(`Seeded genuine products: ${products.length}`);
    console.log(`Seed seller password: ${SEED_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('Product seeder failed:', error);
    process.exit(1);
  }
};

seedProducts();
