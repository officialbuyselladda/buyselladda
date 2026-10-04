import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../src/config/db.js';
import Product from '../src/modules/product/product.model.js';
import User from '../src/modules/user/user.model.js';
import authService from '../src/modules/auth/auth.service.js';

const SEED_PASSWORD = 'Seller@12345';
const SELLER_COUNT = Number(process.env.SEED_SELLER_COUNT) || 80;
const PRODUCT_COUNT = Number(process.env.SEED_PRODUCT_COUNT) || 5200;
const BATCH_SIZE = 500;

const firstNames = ['Rahul', 'Neha', 'Amit', 'Pooja', 'Karan', 'Simran', 'Vikas', 'Riya', 'Aman', 'Priya', 'Nikhil', 'Anjali', 'Sandeep', 'Komal', 'Rohit', 'Sakshi', 'Mohit', 'Divya', 'Arjun', 'Kavita'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Mehta', 'Kaur', 'Gupta', 'Yadav', 'Jain', 'Khan', 'Malhotra', 'Reddy', 'Iyer', 'Chauhan', 'Bansal', 'Nair', 'Agarwal', 'Kapoor', 'Joshi', 'Rao'];

const cities = [
  ['Delhi', 77.1025, 28.7041],
  ['Mumbai', 72.8777, 19.0760],
  ['Bangalore', 77.5946, 12.9716],
  ['Hyderabad', 78.4867, 17.3850],
  ['Pune', 73.8567, 18.5204],
  ['Jaipur', 75.7873, 26.9124],
  ['Lucknow', 80.9462, 26.8467],
  ['Ahmedabad', 72.5714, 23.0225],
  ['Chandigarh', 76.7794, 30.7333],
  ['Indore', 75.8577, 22.7196],
  ['Bhopal', 77.4126, 23.2599],
  ['Surat', 72.8311, 21.1702],
  ['Nagpur', 79.0882, 21.1458],
  ['Noida', 77.3910, 28.5355],
  ['Gurgaon', 77.0266, 28.4595],
];

const templates = [
  { category: 'Electronics', subCategories: ['Mobiles', 'Laptops', 'TVs', 'Cameras', 'Speakers', 'Smart Watches'], items: ['iPhone 13 128GB', 'Samsung Galaxy S22', 'OnePlus Nord CE', 'MacBook Air M1', 'HP Pavilion i5 Laptop', 'Lenovo ThinkPad', 'Sony Bravia 43 inch TV', 'Canon DSLR Camera', 'JBL Bluetooth Speaker', 'Apple Watch SE'], price: [2500, 95000], keywords: ['smartphone', 'laptop', 'television', 'camera', 'speaker', 'smartwatch'] },
  { category: 'Vehicles', subCategories: ['Cars', 'Motorcycles', 'Scooters', 'Bicycles', 'Commercial Vehicles'], items: ['Maruti Swift VXI', 'Honda City Petrol', 'Hyundai i20 Sportz', 'Royal Enfield Classic 350', 'Yamaha R15 V3', 'Honda Activa 6G', 'TVS Jupiter', 'Hero Splendor Plus', 'Firefox Gear Cycle', 'Tata Ace Mini Truck'], price: [12000, 850000], keywords: ['car', 'motorcycle', 'scooter', 'bicycle', 'vehicle'] },
  { category: 'Property', subCategories: ['Apartments', 'Rooms', 'Shops', 'Office Space', 'Plots'], items: ['2BHK Flat for Rent', '1RK Room Near Metro', 'Main Road Shop Space', 'Small Office Cabin', 'Residential Plot', 'PG Room with Food', 'Warehouse Space', 'Studio Apartment', 'Independent Floor', 'Commercial Basement'], price: [4500, 3500000], keywords: ['apartment', 'house interior', 'shop', 'office space', 'real estate'] },
  { category: 'Furniture', subCategories: ['Beds', 'Sofas', 'Tables', 'Chairs', 'Wardrobes'], items: ['Queen Size Bed with Storage', 'L Shape Sofa Set', 'Dining Table 4 Chairs', 'Ergonomic Office Chair', 'Wooden Wardrobe', 'Study Table', 'Center Table', 'Recliner Chair', 'Bookshelf', 'Shoe Rack'], price: [800, 65000], keywords: ['bed furniture', 'sofa', 'dining table', 'office chair', 'wardrobe'] },
  { category: 'Fashion', subCategories: ['Women Clothing', 'Men Clothing', 'Shoes', 'Watches', 'Bags'], items: ['Party Wear Saree', 'Lehenga Set', 'Men Leather Jacket', 'Nike Running Shoes', 'Fossil Watch', 'Bridal Dupatta', 'Office Blazer', 'Handbag Combo', 'Kids Ethnic Dress', 'Ray-Ban Sunglasses'], price: [250, 25000], keywords: ['saree', 'jacket', 'shoes', 'watch', 'handbag'] },
  { category: 'Kids', subCategories: ['Toys', 'Baby Gear', 'Kids Furniture', 'Books', 'Clothes'], items: ['Baby Stroller Foldable', 'Kids Study Table', 'Remote Control Car', 'Baby Walker', 'School Books Set', 'Kids Bicycle', 'Toy Kitchen Set', 'Baby Cot', 'Soft Toys Bundle', 'Kids Winter Jacket'], price: [200, 18000], keywords: ['baby stroller', 'kids table', 'toy car', 'baby walker', 'kids bicycle'] },
  { category: 'Sports', subCategories: ['Fitness', 'Cricket', 'Cycling', 'Football', 'Outdoor'], items: ['Home Treadmill', 'Cricket Bat English Willow', 'Dumbbell Set 20kg', 'Football Stud Shoes', 'Exercise Cycle', 'Badminton Racket Pair', 'Yoga Mat Combo', 'Gym Bench', 'Skating Shoes', 'Camping Tent'], price: [300, 55000], keywords: ['treadmill', 'cricket bat', 'dumbbells', 'football shoes', 'exercise bike'] },
  { category: 'Services', subCategories: ['Home Services', 'Cleaning', 'Repair', 'Tutors', 'Events'], items: ['AC Repair Service', 'Home Deep Cleaning', 'Laptop Repair', 'Maths Home Tutor', 'Wedding Photographer', 'Plumber on Call', 'Electrician Service', 'Packers and Movers', 'Interior Painting', 'Sofa Cleaning'], price: [199, 45000], keywords: ['air conditioner repair', 'home cleaning', 'laptop repair', 'tutor', 'photographer'] },
  { category: 'Jobs', subCategories: ['Delivery', 'Sales', 'Office', 'Part Time', 'Hospitality'], items: ['Delivery Executive Job', 'Telecaller Required', 'Office Assistant', 'Sales Executive', 'Restaurant Helper', 'Data Entry Operator', 'Receptionist Job', 'Driver Required', 'Part Time Tutor', 'Store Manager'], price: [8000, 65000], keywords: ['delivery job', 'call center', 'office work', 'sales job', 'restaurant staff'] },
  { category: 'Pets', subCategories: ['Dogs', 'Cats', 'Fish', 'Birds', 'Pet Accessories'], items: ['Indie Puppy Adoption', 'Persian Cat Kitten', 'Aquarium with Filter', 'Love Birds Pair', 'Dog Crate Large Size', 'Cat Tree', 'Fish Tank Accessories', 'Pet Carrier Bag', 'Labrador Puppy', 'Bird Cage'], price: [0, 45000], keywords: ['puppy', 'kitten', 'aquarium', 'love birds', 'pet carrier'] },
  { category: 'Books', subCategories: ['Education', 'Competitive Exams', 'Novels', 'Comics', 'Stationery'], items: ['JEE Books Full Set', 'NEET Study Material', 'UPSC Books Combo', 'Harry Potter Set', 'School Books Class 10', 'Accounting Books', 'NCERT Full Set', 'Comics Bundle', 'Engineering Books', 'Drawing Stationery Kit'], price: [100, 12000], keywords: ['study books', 'exam books', 'novels', 'school books', 'stationery'] },
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const photoUrl = (keyword, index) => `https://loremflickr.com/900/650/${encodeURIComponent(keyword)}?lock=${100000 + index}`;

const descriptionFor = (title, city) => {
  const openers = [
    'Condition kaafi achhi hai, daily use me koi issue nahi.',
    'Ghar ka personal item hai, dealer listing nahi.',
    'Well maintained product hai, serious buyer ko details share kar dunga.',
    'Urgent sale hai kyunki upgrade/shifting plan chal raha hai.',
    'Original photos aur details chat par mil jayengi.',
  ];
  const details = [
    'Minor use marks ho sakte hain but overall product clean hai.',
    'Price thoda negotiable hai, please low offer mat karna.',
    'Pickup preferred hai, nearby buyer ke liye easy rahega.',
    'Bill/box/accessories available honge to listing ke hisab se de dunga.',
    'Same day deal possible hai agar buyer genuine ho.',
  ];
  return `${title} available in ${city}. ${randomFrom(openers)} ${randomFrom(details)} OLX style direct owner deal, chat karke visit/test kar sakte ho.`;
};

const makeSellers = async () => {
  const emails = Array.from({ length: SELLER_COUNT }, (_, i) => `seller${String(i + 1).padStart(3, '0')}@seed.buyselladda.local`);
  await User.deleteMany({ email: { $in: emails } });

  const sellers = [];
  for (let i = 0; i < SELLER_COUNT; i += 1) {
    const name = `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
    const { user } = await authService.register({
      name,
      email: emails[i],
      password: SEED_PASSWORD,
      phone: `9${randomInt(100000000, 999999999)}`,
    });
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    sellers.push(user);
  }

  return sellers;
};

const buildProduct = (index, sellers) => {
  const template = templates[index % templates.length];
  const city = cities[index % cities.length];
  const baseTitle = randomFrom(template.items);
  const variant = randomFrom(['', 'Good Condition', 'Urgent Sale', 'Single Owner', 'Almost New', 'Best Deal']);
  const title = variant ? `${baseTitle} - ${variant}` : baseTitle;
  const subCategory = randomFrom(template.subCategories);
  const keyword = baseTitle;
  const seller = sellers[index % sellers.length];
  const [cityName, lng, lat] = city;
  const photoCount = randomInt(1, 3);
  const images = Array.from({ length: photoCount }, (_, imgIndex) => ({
    public_id: `seed-photo-${index + 1}-${imgIndex + 1}`,
    url: photoUrl(keyword, (index + 1) * 10 + imgIndex),
  }));

  return {
    title,
    description: descriptionFor(baseTitle, cityName),
    price: randomInt(template.price[0], template.price[1]),
    category: template.category,
    subCategory,
    condition: Math.random() < 0.22 ? 'New' : 'Used',
    images,
    location: cityName,
    locationCoords: {
      type: 'Point',
      coordinates: [lng + (Math.random() - 0.5) * 0.08, lat + (Math.random() - 0.5) * 0.08],
    },
    user: seller._id,
    views: randomInt(0, 2400),
    isBoosted: Math.random() < 0.08,
    status: 'approved',
    approvedAt: new Date(),
    approvalSource: 'auto',
    slug: `${slugify(baseTitle)}-${index + 1}-${Date.now().toString(36)}`,
    contentHash: `seed-realistic-${index + 1}`,
    searchVector: [],
  };
};

const insertInBatches = async (docs) => {
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await Product.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`Inserted products: ${inserted}/${docs.length}`);
  }
};

const seedProducts = async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB();

    await Product.deleteMany({ contentHash: { $regex: '^seed-' } });
    await User.deleteMany({ email: /@seed\.buyselladda\.local$/ });
    console.log('Cleared old product mock data');

    const sellers = await makeSellers();
    console.log(`Created seed sellers: ${sellers.length}`);

    const docs = Array.from({ length: PRODUCT_COUNT }, (_, index) => buildProduct(index, sellers));
    await insertInBatches(docs);

    console.log(`Seeded realistic products: ${PRODUCT_COUNT}`);
    console.log(`Seed seller password: ${SEED_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('Product seeder failed:', error);
    process.exit(1);
  }
};

seedProducts();
