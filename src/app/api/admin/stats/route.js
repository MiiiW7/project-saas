import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET admin dashboard statistics
export async function GET(request) {
  try {
    // Check for authentication and admin role here in a real app
    
    // Calculate each statistic from the database
    
    // 1. Count total users (customers)
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER'
      }
    });
    
    // 2. Count total menu items
    const totalMenuItems = await prisma.menuItem.count();
    
    // 3. Count total orders
    const totalOrders = await prisma.order.count();
    
    // 4. Calculate total revenue
    const orderTotals = await prisma.order.findMany({
      select: {
        totalPrice: true
      }
    });
    
    const totalRevenue = orderTotals.reduce((sum, order) => sum + order.totalPrice, 0);
    
    // Return all statistics
    return NextResponse.json({
      totalCustomers,
      totalMenuItems,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2)
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return NextResponse.json(
      { error: 'Error fetching admin statistics' },
      { status: 500 }
    );
  }
} 