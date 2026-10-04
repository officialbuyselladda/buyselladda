/**
 * Mega Seeder — creates 5000+ realistic users and a full multi-category
 * product catalog (electronics, fashion, vehicles, property, furniture,
 * jobs, services, pets, kids & more) with photos, ready for demo/testing.
 *
 * Run: npm run seed:mega
 * Override size:  SEED_USER_COUNT=8000 SEED_PRODUCTS_PER_SUBCATEGORY=60 npm run seed:mega
 *
 * All seeded users share one login password (see SEED_PASSWORD below).
 * Emails look like genuine personal addresses (name-based, at real
 * providers like gmail.com/yahoo.com) instead of a giveaway seed domain, so
 * re-runs track which users they created in a local state file
 * (seeders/.mega-seed-state.json, gitignored) and delete only those before
 * inserting a fresh batch — safe to re-run without piling up duplicates.
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import User from '../src/modules/user/user.model.js';
import Product from '../src/modules/product/product.model.js';
import Category from '../src/modules/category/category.model.js';

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const USER_COUNT = Number(process.env.SEED_USER_COUNT) || 5200;
const PRODUCTS_PER_SUBCATEGORY = Number(process.env.SEED_PRODUCTS_PER_SUBCATEGORY) || 50;
const SEED_PASSWORD = 'Seed@12345';
const BATCH_SIZE = 500;
const STATE_FILE = path.resolve(__dirname, '.mega-seed-state.json');
// Weighted so gmail.com dominates, matching real-world Indian inbox share
const EMAIL_DOMAINS = ['gmail.com', 'gmail.com', 'gmail.com', 'gmail.com', 'yahoo.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'icloud.com'];

// ---------------------------------------------------------------------------
// NAME / LOCATION DATA BANKS
// ---------------------------------------------------------------------------
const MALE_FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan',
  'Kabir', 'Aryan', 'Dhruv', 'Karan', 'Rahul', 'Rajesh', 'Suresh', 'Amit', 'Vikas', 'Ankit',
  'Manish', 'Sandeep', 'Deepak', 'Ravi', 'Vijay', 'Anil', 'Sunil', 'Naveen', 'Praveen', 'Gaurav',
  'Nikhil', 'Abhishek', 'Harsh', 'Yash', 'Aman', 'Saurabh', 'Vishal', 'Pankaj', 'Rakesh', 'Mohit',
  'Siddharth', 'Varun', 'Tarun', 'Akash', 'Rohit', 'Sachin', 'Ajay', 'Vinod', 'Ramesh', 'Mahesh',
  'Imran', 'Faisal', 'Zeeshan', 'Arbaaz', 'Salman', 'Irfan', 'Kamal', 'Jaspreet', 'Gurpreet', 'Harpreet',
];
const FEMALE_FIRST_NAMES = [
  'Saanvi', 'Ananya', 'Diya', 'Aadhya', 'Kiara', 'Myra', 'Sara', 'Ira', 'Anika', 'Pari',
  'Priya', 'Neha', 'Pooja', 'Anjali', 'Kavita', 'Sunita', 'Rekha', 'Meena', 'Geeta', 'Seema',
  'Shreya', 'Riya', 'Isha', 'Tanya', 'Nisha', 'Divya', 'Swati', 'Preeti', 'Kritika', 'Simran',
  'Pallavi', 'Rashmi', 'Vidya', 'Suman', 'Kajal', 'Aarti', 'Bhavna', 'Chitra', 'Deepika', 'Esha',
  'Farida', 'Gauri', 'Heena', 'Jyoti', 'Komal', 'Lata', 'Madhuri', 'Nidhi', 'Payal', 'Ritu',
  'Sana', 'Ayesha', 'Zoya', 'Fatima', 'Amrita', 'Harleen', 'Navneet', 'Manpreet', 'Rupinder', 'Jasleen',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Yadav', 'Mishra', 'Pandey', 'Chauhan', 'Rathore',
  'Agarwal', 'Bansal', 'Jain', 'Mehta', 'Malhotra', 'Kapoor', 'Chopra', 'Khanna', 'Arora', 'Sethi',
  'Reddy', 'Rao', 'Naidu', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Krishnan', 'Subramaniam', 'Varma',
  'Das', 'Roy', 'Ghosh', 'Banerjee', 'Chatterjee', 'Mukherjee', 'Bose', 'Sarkar', 'Dutta', 'Sen',
  'Patel', 'Desai', 'Shah', 'Trivedi', 'Joshi', 'Thakkar', 'Modi', 'Chauhan', 'Solanki', 'Rana',
  'Khan', 'Ansari', 'Sheikh', 'Siddiqui', 'Qureshi', 'Malik', 'Baig', 'Chowdhury', 'Hussain', 'Akhtar',
];
const CITIES = [
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
];

// ---------------------------------------------------------------------------
// CATEGORY TREE + PRODUCT TITLE BANKS
// ---------------------------------------------------------------------------
const CATEGORY_TREE = [
  {
    name: 'Electronics', icon: '💻',
    children: [
      { name: 'Mobile Phones', keyword: 'smartphone', priceRange: [3000, 95000], bank: ['Apple iPhone 13 128GB', 'Samsung Galaxy S22 Ultra', 'OnePlus 11R 5G', 'Xiaomi Redmi Note 12 Pro', 'Realme Narzo 60', 'Vivo V27', 'Oppo Reno 8', 'Google Pixel 7a', 'Apple iPhone SE 2022', 'Samsung Galaxy M34 5G'] },
      { name: 'Laptops', keyword: 'laptop', priceRange: [10000, 160000], bank: ['Dell Inspiron 15 3000', 'HP Pavilion 14 Ryzen 5', 'Lenovo IdeaPad Slim 3', 'Apple MacBook Air M1', 'Asus VivoBook 15', 'Acer Aspire 7 Gaming', 'HP Victus Gaming Laptop', 'Dell XPS 13', 'Lenovo ThinkPad E14', 'MSI Modern 14'] },
      { name: 'Televisions', keyword: 'television', priceRange: [6000, 110000], bank: ['Samsung 43 inch Crystal 4K Smart TV', 'LG 55 inch NanoCell 4K TV', 'Sony Bravia 32 inch HD Ready TV', 'Mi TV 5X 50 inch 4K', 'OnePlus TV Y1S Pro 43 inch', 'TCL 32 inch HD Smart Android TV', 'Panasonic 40 inch Full HD TV', 'Redmi Smart TV X55'] },
      { name: 'Cameras', keyword: 'camera', priceRange: [5000, 90000], bank: ['Canon EOS 1500D DSLR', 'Nikon D3500 DSLR Camera', 'Sony Alpha a6400 Mirrorless', 'GoPro Hero 10 Black', 'Canon PowerShot G7X', 'DJI Osmo Pocket 2'] },
      { name: 'Audio & Speakers', keyword: 'speaker', priceRange: [800, 30000], bank: ['JBL Flip 6 Bluetooth Speaker', 'Boat Stone 1401 Speaker', 'Sony WH-1000XM4 Headphones', 'Marshall Emberton Speaker', 'boAt Rockerz 450 Headphones', 'Sonos One Smart Speaker'] },
      { name: 'Home Appliances', keyword: 'appliance', priceRange: [1500, 60000], bank: ['LG 7kg Front Load Washing Machine', 'Samsung 253L Double Door Refrigerator', 'Whirlpool 1.5 Ton Split AC', 'Prestige Induction Cooktop', 'Philips Air Fryer', 'Bajaj Mixer Grinder', 'IFB Microwave Oven 25L'] },
      { name: 'Computer Accessories', keyword: 'keyboard', priceRange: [400, 25000], bank: ['Logitech MX Master 3 Mouse', 'Mechanical RGB Gaming Keyboard', 'Dell 24 inch Full HD Monitor', 'HP LaserJet Printer', 'WD 1TB External Hard Drive', 'Corsair 16GB RAM Kit'] },
    ],
  },
  {
    name: 'Fashion', icon: '👗',
    children: [
      { name: "Men's Clothing", keyword: 'mensfashion', priceRange: [300, 5000], bank: ["Levi's Slim Fit Jeans", 'Allen Solly Formal Shirt', 'Puma Track Jacket', 'Adidas Cotton T-Shirt Pack', 'Van Heusen Blazer', 'US Polo Casual Shirt', 'Nike Dri-Fit Joggers'] },
      { name: "Women's Clothing", keyword: 'womensfashion', priceRange: [300, 6000], bank: ['Fabindia Cotton Kurti', 'Zara Floral Summer Dress', 'W Anarkali Suit Set', 'Biba Printed Saree', 'H&M Denim Jacket', 'Global Desi Ethnic Set'] },
      { name: 'Kids Clothing', keyword: 'kidsclothing', priceRange: [200, 2500], bank: ['Kids Winter Jacket Set', 'H&M Baby Rompers Pack', 'Cotton Kids T-Shirt Combo', 'School Uniform Set', 'Kids Ethnic Wear Set'] },
      { name: 'Footwear', keyword: 'shoes', priceRange: [400, 8000], bank: ['Nike Air Max Sneakers', 'Adidas Running Shoes', 'Bata Formal Leather Shoes', 'Woodland Trekking Shoes', 'Puma Casual Sneakers', 'Crocs Clogs'] },
      { name: 'Watches & Bags', keyword: 'watch', priceRange: [500, 15000], bank: ['Fossil Chronograph Watch', 'Titan Analog Watch', 'Fastrack Sports Watch', 'American Tourister Backpack', 'Wildcraft Travel Backpack', 'Michael Kors Handbag'] },
    ],
  },
  {
    name: 'Vehicles', icon: '🚗',
    children: [
      { name: 'Cars', keyword: 'car', priceRange: [150000, 1200000], bank: ['Maruti Suzuki Swift VXI 2019', 'Hyundai i20 Sportz 2020', 'Honda City VX 2018', 'Tata Nexon XZ 2021', 'Toyota Innova Crysta 2017', 'Maruti Baleno Zeta 2020', 'Hyundai Creta SX 2019'] },
      { name: 'Motorcycles', keyword: 'motorcycle', priceRange: [25000, 250000], bank: ['Royal Enfield Classic 350', 'Bajaj Pulsar 150', 'Honda CB Shine', 'Yamaha FZ-S V3', 'TVS Apache RTR 160', 'KTM Duke 200'] },
      { name: 'Scooters', keyword: 'scooter', priceRange: [20000, 100000], bank: ['Honda Activa 6G', 'TVS Jupiter 125', 'Suzuki Access 125', 'Yamaha Fascino 125', 'Hero Pleasure Plus'] },
      { name: 'Bicycles', keyword: 'bicycle', priceRange: [2500, 30000], bank: ['Hero Sprint Pro Mountain Bike', 'Btwin Rockrider Cycle', 'Firefox Road Runner Cycle', 'Hercules Roadeo Cycle'] },
      { name: 'Spare Parts', keyword: 'carparts', priceRange: [300, 15000], bank: ['Car Alloy Wheels Set of 4', 'Bike Helmet - ISI Marked', 'Car Seat Covers Set', 'Bike Side Bags Pair', 'Car Music System with Bluetooth'] },
    ],
  },
  {
    name: 'Property', icon: '🏠',
    children: [
      { name: 'Flats for Rent', keyword: 'apartment', priceRange: [6000, 60000], bank: ['2BHK Flat for Rent near Metro', '1BHK Fully Furnished Flat', '3BHK Apartment for Rent', 'Studio Apartment for Rent'] },
      { name: 'Flats for Sale', keyword: 'apartment', priceRange: [1500000, 12000000], bank: ['2BHK Flat for Sale in Prime Location', '3BHK Apartment for Sale', 'Ready to Move 1BHK Flat', 'Luxury 4BHK Penthouse for Sale'] },
      { name: 'PG & Rooms', keyword: 'bedroom', priceRange: [3000, 15000], bank: ['Single Room PG for Boys', 'PG for Girls with Food', 'Shared Room Available Near College', 'Independent Room for Rent'] },
      { name: 'Shops & Offices', keyword: 'office', priceRange: [10000, 150000], bank: ['Commercial Shop on Main Road', 'Office Space for Rent', 'Showroom Space Available', 'Small Shop for Rent in Market'] },
      { name: 'Plots & Land', keyword: 'land', priceRange: [500000, 8000000], bank: ['Residential Plot for Sale', 'Commercial Land for Sale', 'Agricultural Land for Sale', 'Corner Plot in Gated Society'] },
    ],
  },
  {
    name: 'Furniture & Home', icon: '🛋️',
    children: [
      { name: 'Sofas & Chairs', keyword: 'sofa', priceRange: [3000, 45000], bank: ['3 Seater Fabric Sofa Set', 'L Shape Sofa Cum Bed', 'Recliner Chair', 'Wooden Rocking Chair'] },
      { name: 'Beds & Wardrobes', keyword: 'bed', priceRange: [4000, 40000], bank: ['Queen Size Wooden Bed', 'King Size Bed with Storage', '3 Door Wardrobe', 'Study Table with Chair'] },
      { name: 'Dining & Kitchen', keyword: 'diningtable', priceRange: [2500, 30000], bank: ['4 Seater Dining Table Set', '6 Seater Dining Set', 'Kitchen Storage Rack', 'Modular Kitchen Trolley'] },
      { name: 'Home Decor', keyword: 'homedecor', priceRange: [300, 8000], bank: ['Wall Clock Set', 'Decorative Wall Art', 'LED String Lights', 'Table Lamp'] },
    ],
  },
  {
    name: 'Jobs', icon: '💼',
    children: [
      { name: 'Delivery & Logistics', keyword: 'delivery', priceRange: [10000, 25000], bank: ['Delivery Executive Required', 'Two Wheeler Delivery Boy Needed', 'Warehouse Helper Job', 'Driver Required for Cab Service'] },
      { name: 'Sales & Marketing', keyword: 'salesmeeting', priceRange: [12000, 40000], bank: ['Field Sales Executive', 'Telecaller for Insurance Company', 'Marketing Executive Required', 'Business Development Executive'] },
      { name: 'IT & Software', keyword: 'programming', priceRange: [20000, 90000], bank: ['React Developer Required', 'Node.js Backend Developer', 'Android App Developer', 'QA Tester Needed'] },
      { name: 'Customer Support', keyword: 'callcenter', priceRange: [12000, 30000], bank: ['Customer Support Executive', 'Call Center Agent Required', 'Chat Support Executive'] },
      { name: 'Data Entry & Back Office', keyword: 'office', priceRange: [10000, 22000], bank: ['Data Entry Operator Needed', 'Back Office Executive', 'Computer Operator Required'] },
    ],
  },
  {
    name: 'Books, Sports & Hobbies', icon: '📚',
    children: [
      { name: 'Books', keyword: 'books', priceRange: [100, 3000], bank: ['NCERT Class 12 Book Set', 'JEE Main Preparation Books', 'Fiction Novel Collection', 'UPSC GS Book Set'] },
      { name: 'Musical Instruments', keyword: 'guitar', priceRange: [1500, 40000], bank: ['Yamaha Acoustic Guitar', 'Casio Keyboard 61 Keys', 'Djembe Drum', 'Violin with Case'] },
      { name: 'Sports Equipment', keyword: 'sportsequipment', priceRange: [500, 25000], bank: ['Yonex Badminton Racket Set', 'Cricket Kit Full Set', 'Adjustable Dumbbells Set', 'Treadmill for Home Use'] },
      { name: 'Gaming', keyword: 'videogame', priceRange: [2000, 55000], bank: ['PlayStation 5 Console', 'Xbox Series S', 'Gaming Chair', 'Nintendo Switch OLED'] },
    ],
  },
  {
    name: 'Pets', icon: '🐾',
    children: [
      { name: 'Dogs', keyword: 'puppy', priceRange: [3000, 40000], bank: ['Labrador Puppy for Sale', 'German Shepherd Puppy', 'Golden Retriever Puppy', 'Pug Puppy for Sale'] },
      { name: 'Cats', keyword: 'kitten', priceRange: [1500, 25000], bank: ['Persian Kitten for Sale', 'Siamese Kitten', 'Indian Cat for Adoption'] },
      { name: 'Birds & Fish', keyword: 'aquarium', priceRange: [500, 8000], bank: ['Aquarium Fish Tank Setup', 'Budgerigar Pair', 'Love Birds Pair'] },
      { name: 'Pet Accessories', keyword: 'petsupplies', priceRange: [300, 6000], bank: ['Dog Cage Large Size', 'Pet Grooming Kit', 'Cat Litter Box'] },
    ],
  },
  {
    name: 'Kids & Baby', icon: '🧸',
    children: [
      { name: 'Toys & Games', keyword: 'toys', priceRange: [200, 4000], bank: ['Remote Control Car Toy', 'Building Blocks Set', 'Barbie Doll House', 'Kids Bicycle'] },
      { name: 'Baby Gear', keyword: 'baby', priceRange: [800, 12000], bank: ['Baby Stroller Pram', 'Baby Car Seat', 'Baby Walker', 'High Chair for Baby'] },
      { name: 'Baby Clothing', keyword: 'babyclothes', priceRange: [200, 2000], bank: ['Newborn Baby Clothes Set', 'Baby Winter Wear Set', 'Baby Shoes Pack'] },
    ],
  },
  {
    name: 'Services', icon: '🛠️',
    children: [
      { name: 'Home Repair', keyword: 'repairman', priceRange: [200, 5000], bank: ['AC Repair and Service', 'Plumber Available', 'Electrician Home Service', 'RO Water Purifier Repair'] },
      { name: 'Tutoring & Classes', keyword: 'tutoring', priceRange: [500, 8000], bank: ['Home Tutor for Maths', 'Spoken English Classes', 'Guitar Classes at Home', 'Dance Classes for Kids'] },
      { name: 'Beauty & Wellness', keyword: 'beauty', priceRange: [500, 15000], bank: ['Bridal Makeup Artist', 'Home Salon Services', 'Yoga Trainer at Home', 'Massage Therapist'] },
      { name: 'Event & Catering', keyword: 'partydecoration', priceRange: [1000, 50000], bank: ['Birthday Party Decoration', 'Wedding Catering Service', 'DJ and Sound System', 'Event Photography'] },
    ],
  },
];

const DETAIL_PHRASES = {
  Electronics: ['Bill and box available', 'Still under warranty', 'All original accessories included', 'No scratches, excellent condition', 'Genuine bill available on request'],
  Fashion: ['Barely worn, like new', 'Original brand tag attached', 'Machine washable, no stains', 'True to size', 'Premium fabric, comfortable fit'],
  Vehicles: ['Single owner', 'Full service history maintained', 'Insurance valid', 'New tyres fitted recently', 'No accident history'],
  Property: ['Well ventilated with ample sunlight', 'Close to market and schools', 'Water and power backup available', '24x7 security', 'Ready to move in'],
  'Furniture & Home': ['Sturdy build, no damage', 'Minor wear consistent with age', 'Easy to assemble', 'Termite free', 'Recently polished'],
  Jobs: ['Immediate joining preferred', 'Fresher and experienced both can apply', 'Incentives on top of fixed salary', 'Flexible working hours', 'Training will be provided'],
  'Books, Sports & Hobbies': ['All pages intact, no markings', 'Great for beginners', 'Barely used, like new condition', 'Comes with original accessories'],
  Pets: ['Vaccinated and dewormed', 'Very friendly with kids', 'Comes with food bowl and leash', 'Healthy and active'],
  'Kids & Baby': ['Non-toxic, safe material', 'Gently used and sanitized', 'All parts included, nothing missing'],
  Services: ['Verified and experienced professional', 'Affordable rates, no hidden charges', 'Available on weekends too', 'Free first consultation'],
};
const CLOSING_PHRASES = [
  'Serious buyers only please.',
  'Contact for more details or to schedule a visit.',
  'Price slightly negotiable on genuine deal.',
  'Available for immediate pickup.',
  'Feel free to message for more photos.',
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slugify = (text) => String(text)
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

async function insertInBatches(Model, docs, label) {
  const inserted = [];
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const result = await Model.insertMany(batch, { ordered: false });
      inserted.push(...result);
    } catch (err) {
      if (err.insertedDocs?.length) inserted.push(...err.insertedDocs);
      console.warn(`  ⚠️  ${label} batch had errors: ${err.writeErrors?.length || err.message}`);
    }
    console.log(`  ${label}: ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`);
  }
  return inserted;
}

// ---------------------------------------------------------------------------
// SEED USERS
// ---------------------------------------------------------------------------
const readPreviousSeedUserIds = () => {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.userIds) ? parsed.userIds : [];
  } catch {
    return [];
  }
};

const seedUsers = async () => {
  const previousIds = readPreviousSeedUserIds();
  if (previousIds.length) {
    console.log(`🧹 Removing ${previousIds.length} users from the previous seed run...`);
    await User.deleteMany({ _id: { $in: previousIds } });
  }

  // One-time cleanup for users created by an older version of this script
  // that used the @seed.buyselladda.com domain instead of real-looking emails.
  const legacy = await User.deleteMany({ email: { $regex: '@seed\\.buyselladda\\.com$', $options: 'i' } });
  if (legacy.deletedCount) {
    console.log(`🧹 Removed ${legacy.deletedCount} leftover users from an older @seed.buyselladda.com run...`);
  }

  console.log('🔐 Hashing shared seed password...');
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const usedEmails = new Set();
  const usedPhones = new Set();
  const docs = [];

  for (let i = 0; i < USER_COUNT; i += 1) {
    const isMale = Math.random() < 0.5;
    const first = randomFrom(isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const name = `${first} ${last}`;
    const firstClean = first.toLowerCase().replace(/[^a-z]/g, '');
    const lastClean = last.toLowerCase().replace(/[^a-z]/g, '');

    let email;
    do {
      const sep = randomFrom(['.', '_', '']);
      const domain = randomFrom(EMAIL_DOMAINS);
      email = `${firstClean}${sep}${lastClean}${randomInt(1, 99999)}@${domain}`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    let phone;
    do {
      phone = `${randomFrom(['6', '7', '8', '9'])}${randomInt(100000000, 999999999)}`;
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    const city = randomFrom(CITIES);
    const userType = Math.random() < 0.08 ? 'dealer' : 'normal';

    docs.push({
      name,
      email,
      password: passwordHash,
      phone,
      role: 'user',
      userType,
      subscriptionGroup: userType === 'dealer' ? 'dealer' : 'free',
      isEmailVerified: true,
      location: city.name,
      trustScore: randomInt(0, 95),
      lastSeen: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
    });
  }

  console.log(`👥 Inserting ${docs.length} users...`);
  const inserted = await insertInBatches(User, docs, 'users');
  fs.writeFileSync(STATE_FILE, JSON.stringify({ userIds: inserted.map((u) => u._id.toString()) }, null, 2));
  console.log(`✅ Seeded ${inserted.length} users. Shared login password: ${SEED_PASSWORD}`);
  return inserted;
};

// ---------------------------------------------------------------------------
// SEED CATEGORIES (matches product.service.js normalizeCategory rules)
// ---------------------------------------------------------------------------
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds an existing category by slug OR case-insensitive name (same lookup
// product.service.js's normalizeCategory uses) so we reuse whatever already
// lives in this database instead of colliding with it on the unique
// name/slug indexes. Never renames or re-slugs an existing category — only
// fills in isActive/parent when missing. Only brand-new categories get our
// full intended shape.
const findOrCreateCategory = async ({ name, slug, parent, icon, sortOrder }) => {
  const existing = await Category.findOne({
    $or: [{ slug }, { name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } }],
  });

  if (existing) {
    let changed = false;
    if (!existing.isActive) { existing.isActive = true; changed = true; }
    if (!existing.parent && parent) { existing.parent = parent; changed = true; }
    if (changed) await existing.save({ validateBeforeSave: false });
    return existing;
  }

  try {
    return await Category.create({ name, slug, parent: parent || null, icon: icon || '', isActive: true, sortOrder });
  } catch (err) {
    if (err.code === 11000) {
      const doc = await Category.findOne({ $or: [{ slug }, { name }] });
      if (doc) return doc;
    }
    throw err;
  }
};

const seedCategories = async () => {
  console.log('🗂️  Seeding category tree...');
  const categoryMap = {};
  let topSort = 0;

  for (const top of CATEGORY_TREE) {
    topSort += 1;
    const parentDoc = await findOrCreateCategory({
      name: top.name,
      slug: slugify(top.name),
      parent: null,
      icon: top.icon,
      sortOrder: topSort,
    });
    categoryMap[top.name] = parentDoc;

    let childSort = 0;
    for (const child of top.children) {
      childSort += 1;
      const childDoc = await findOrCreateCategory({
        name: child.name,
        slug: slugify(child.name),
        parent: parentDoc._id,
        sortOrder: childSort,
      });
      categoryMap[child.name] = childDoc;
    }
  }

  console.log(`✅ Seeded ${Object.keys(categoryMap).length} categories.`);
  return categoryMap;
};

// ---------------------------------------------------------------------------
// SEED PRODUCTS
// ---------------------------------------------------------------------------
const buildDescription = (topCategoryName, baseTitle, cityName) => {
  const conditionPhrase = randomFrom(['excellent', 'very good', 'good', 'like new']);
  const details = DETAIL_PHRASES[topCategoryName] || DETAIL_PHRASES.Services;
  const d1 = randomFrom(details);
  const rest = details.filter((d) => d !== d1);
  const d2 = randomFrom(rest.length ? rest : details);
  const closing = randomFrom(CLOSING_PHRASES);
  return `${baseTitle} in ${conditionPhrase} condition. ${d1}. ${d2}. Located in ${cityName}. ${closing}`;
};

const seedProducts = async (categoryMap, users) => {
  console.log('🧹 Clearing previously seeded products...');
  await Product.deleteMany({ contentHash: { $regex: '^seed-' } });

  console.log('📦 Building product listings...');
  const docs = [];
  let counter = 0;

  for (const top of CATEGORY_TREE) {
    const topDoc = categoryMap[top.name];
    for (const sub of top.children) {
      const subDoc = categoryMap[sub.name];
      for (let i = 0; i < PRODUCTS_PER_SUBCATEGORY; i += 1) {
        counter += 1;
        const baseTitle = randomFrom(sub.bank);
        const city = randomFrom(CITIES);
        const [minPrice, maxPrice] = sub.priceRange;
        const price = randomInt(minPrice, maxPrice);
        const seller = randomFrom(users);
        const condition = Math.random() < 0.35 ? 'New' : 'Used';
        const imageCount = randomInt(2, 4);
        const images = Array.from({ length: imageCount }, (_, idx) => ({
          public_id: `seed-${slugify(sub.name)}-${counter}-${idx}`,
          url: `https://loremflickr.com/640/480/${encodeURIComponent(sub.keyword)}?random=${counter * 10 + idx}`,
        }));

        docs.push({
          title: baseTitle,
          description: buildDescription(top.name, baseTitle, city.name),
          price,
          category: topDoc.name,
          subCategory: subDoc.name,
          condition,
          images,
          location: city.name,
          locationCoords: {
            type: 'Point',
            coordinates: [city.lng + (Math.random() - 0.5) * 0.1, city.lat + (Math.random() - 0.5) * 0.1],
          },
          user: seller._id,
          views: randomInt(0, 1500),
          status: 'approved',
          approvedAt: new Date(),
          approvalSource: 'auto',
          slug: `${slugify(baseTitle)}-${counter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          contentHash: `seed-${seller._id}-${counter}-${Date.now().toString(36)}`,
          searchVector: [],
        });
      }
    }
  }

  console.log(`📦 Inserting ${docs.length} products...`);
  const inserted = await insertInBatches(Product, docs, 'products');
  console.log(`✅ Seeded ${inserted.length} products.`);
  return inserted;
};

// ---------------------------------------------------------------------------
// RUN
// ---------------------------------------------------------------------------
const run = async () => {
  try {
    console.log('🔌 Connecting to DB...');
    await connectDB();
    console.log('✅ DB connected');

    const users = await seedUsers();
    const categoryMap = await seedCategories();
    const products = await seedProducts(categoryMap, users);

    console.log('\n📊 Summary');
    console.log(`   Users:      ${users.length}`);
    console.log(`   Categories: ${Object.keys(categoryMap).length}`);
    console.log(`   Products:   ${products.length}`);
    console.log(`   Login for any seed user: <their email> / ${SEED_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Mega seeder failed:', error);
    process.exit(1);
  }
};

run();
