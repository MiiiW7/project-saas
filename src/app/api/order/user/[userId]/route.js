import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/order/user/[userId] - Get orders for a specific user
export async function GET(request, { params }) {
  try {
    const userId = parseInt(params.userId, 10);
    
    // Check authentication
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check authorization - only allow users to view their own orders or admin to view any orders
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to view these orders' },
        { status: 403 }
      );
    }
    
    // Get orders for the specified user
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 