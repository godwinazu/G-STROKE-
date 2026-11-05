import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { artworks, commissions, orders } from '@/lib/schema';
import { isAdminCookieHeader } from '@/lib/admin';

export async function GET(request: Request) {
  if (!isAdminCookieHeader(request.headers.get('cookie'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [allOrders, allCommissions, allArtworks] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100),
      db.select().from(commissions).orderBy(desc(commissions.createdAt)).limit(100),
      db.select().from(artworks).orderBy(desc(artworks.createdAt)).limit(100),
    ]);

    const paidOrders = allOrders.filter((order) => order.status === 'PAID' || order.status === 'FULFILLED');
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return { date, label: date.toLocaleDateString('en', { weekday: 'short' }), revenue: 0 };
    });
    for (const order of paidOrders) {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      const day = days.find((entry) => entry.date.getTime() === orderDate.getTime());
      if (day) day.revenue += Number(order.totalAmount);
    }

    const topProducts = new Map<string, number>();
    for (const order of paidOrders) {
      for (const item of order.items) {
        topProducts.set(item.name, (topProducts.get(item.name) || 0) + item.quantity);
      }
    }
    const topSelling = [...topProducts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    return NextResponse.json({
      stats: { revenue, paidOrders: paidOrders.length, downloads: allOrders.reduce((sum, order) => sum + order.downloadCount, 0) },
      analytics: {
        revenueByDay: days.map(({ label, revenue: dayRevenue }) => ({ label, revenue: dayRevenue })),
        topSelling,
      },
      orders: allOrders,
      commissions: allCommissions,
      artworks: allArtworks,
    });
  } catch (error) {
    console.error('Admin data error', error);
    return NextResponse.json({ error: 'Unable to load studio data' }, { status: 500 });
  }
}