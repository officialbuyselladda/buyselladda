import User from '../user/user.model.js';
import Product from '../product/product.model.js';
import Chat from '../chat/chat.model.js';
import Message from '../chat/message.model.js';
import SupportTicket from '../support/support.model.js';

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth() + 1}`;
const monthLabel = (date) => date.toLocaleString('en-US', { month: 'short' });

const getMonthSeries = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: monthKey(date),
      month: monthLabel(date),
      users: 0,
      products: 0,
    };
  });
};

const getWeekSeries = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return Array.from({ length: 4 }, (_, index) => {
    const end = new Date(today);
    end.setDate(today.getDate() - (3 - index) * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return {
      label: `W${index + 1}`,
      start,
      end,
      listingValue: 0,
      products: 0,
    };
  });
};

const mapStatusCounts = (statusCounts) => {
  const labels = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    suspicious: 'Suspicious',
    sold: 'Sold',
    deleted: 'Deleted',
  };

  return statusCounts.map((item) => ({
    name: labels[item._id] || item._id || 'Unknown',
    status: item._id || 'unknown',
    value: item.value,
  }));
};

const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const activeSince = new Date();
  activeSince.setMinutes(activeSince.getMinutes() - 15);

  const monthSeries = getMonthSeries();
  const firstMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
  const weekSeries = getWeekSeries();
  const firstWeekStart = weekSeries[0].start;

  const [
    totalUsers,
    totalProducts,
    approvedProducts,
    pendingProducts,
    rejectedProducts,
    suspiciousProducts,
    soldProducts,
    totalChats,
    totalMessages,
    newUsersToday,
    todayProducts,
    yesterdayProducts,
    activeUsers,
    totalViews,
    listingValue,
    openSupportTickets,
    urgentSupportTickets,
    statusCounts,
    monthlyUsers,
    monthlyProducts,
    weeklyProducts,
    recentUsers,
    recentProducts,
    recentSupportTickets,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ status: { $ne: 'deleted' } }),
    Product.countDocuments({ status: 'approved' }),
    Product.countDocuments({ status: 'pending' }),
    Product.countDocuments({ status: 'rejected' }),
    Product.countDocuments({ status: 'suspicious' }),
    Product.countDocuments({ status: 'sold' }),
    Chat.countDocuments(),
    Message.countDocuments(),
    User.countDocuments({ role: 'user', createdAt: { $gte: today } }),
    Product.countDocuments({ createdAt: { $gte: today }, status: { $ne: 'deleted' } }),
    Product.countDocuments({ createdAt: { $gte: yesterday, $lt: today }, status: { $ne: 'deleted' } }),
    User.countDocuments({ role: 'user', lastSeen: { $gte: activeSince } }),
    Product.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]),
    Product.aggregate([
      { $match: { status: { $in: ['approved', 'sold'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress', 'waiting_user'] } }),
    SupportTicket.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
    Product.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),
    User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: firstMonthStart } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, users: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Product.aggregate([
      { $match: { status: { $ne: 'deleted' }, createdAt: { $gte: firstMonthStart } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, products: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Product.aggregate([
      { $match: { status: { $in: ['approved', 'sold'] }, createdAt: { $gte: firstWeekStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, dayOfYear: { $dayOfYear: '$createdAt' } },
          listingValue: { $sum: '$price' },
          products: { $sum: 1 },
          firstDate: { $min: '$createdAt' },
        },
      },
      { $sort: { firstDate: 1 } },
    ]),
    User.find({ role: 'user' }).sort('-createdAt').limit(5).select('name email role trustScore createdAt lastSeen isBlocked').lean(),
    Product.find({ status: { $ne: 'deleted' } })
      .populate('user', 'name email trustScore')
      .sort('-createdAt')
      .limit(5)
      .select('title price status views createdAt images category user')
      .lean(),
    SupportTicket.find()
      .populate('user', 'name email')
      .sort('-updatedAt')
      .limit(5)
      .select('ticketNumber subject status priority category updatedAt user')
      .lean(),
  ]);

  const growthMap = monthSeries.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {});

  monthlyUsers.forEach((entry) => {
    const key = `${entry._id.year}-${entry._id.month}`;
    if (growthMap[key]) growthMap[key].users = entry.users;
  });

  monthlyProducts.forEach((entry) => {
    const key = `${entry._id.year}-${entry._id.month}`;
    if (growthMap[key]) growthMap[key].products = entry.products;
  });

  weeklyProducts.forEach((entry) => {
    const itemDate = new Date(entry.firstDate);
    const week = weekSeries.find((series) => itemDate >= series.start && itemDate <= series.end);
    if (week) {
      week.listingValue += entry.listingValue;
      week.products += entry.products;
    }
  });

  const reviewQueue = pendingProducts + suspiciousProducts;
  const todayDelta = todayProducts - yesterdayProducts;

  return {
    totalUsers,
    totalProducts,
    approvedProducts,
    pendingProducts,
    rejectedProducts,
    suspiciousProducts,
    soldProducts,
    reviewQueue,
    totalChats,
    totalMessages,
    newUsersToday,
    todayProducts,
    yesterdayProducts,
    todayDelta,
    activeUsers,
    totalViews: totalViews[0]?.total || 0,
    listingValue: listingValue[0]?.total || 0,
    revenue: listingValue[0]?.total || 0,
    openSupportTickets,
    urgentSupportTickets,
    statusData: mapStatusCounts(statusCounts),
    growthData: Object.values(growthMap),
    weeklyListingValue: weekSeries.map((week) => ({
      week: week.label,
      listingValue: week.listingValue,
      products: week.products,
    })),
    recentUsers,
    recentProducts,
    recentSupportTickets,
  };
};

export default { getDashboardStats };
