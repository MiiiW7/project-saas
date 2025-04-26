import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSession } from '../../../../lib/session';

// GET /api/orders/[id]
export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    
    // Check authentication
    if (!session?.user) {
      console.log('Authentication missing');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Convert orderId from string to integer
    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      console.log('Invalid order ID:', params.id);
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    const userRole = session.user.role;
    console.log('User requesting order:', { userId, role: userRole });
    console.log('Looking for order with ID:', orderId);

    // Fetch the order with related items
    try {
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          items: {
            include: {
              menuItem: true
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      console.log('Order found:', order ? 'yes' : 'no');

      // Check if order exists
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Check if the user has permission to view this order
      // Allow access if user is the order owner or an admin
      if (order.userId !== userId && userRole !== 'ADMIN') {
        console.log('Permission denied - user ID mismatch:', { orderUserId: order.userId, requestUserId: userId });
        return NextResponse.json(
          { error: 'You do not have permission to view this order' },
          { status: 403 }
        );
      }

      console.log('Returning order data with items:', order.items?.length || 0);
      return NextResponse.json(order);
    } catch (dbError) {
      console.error('Database error fetching order:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status
export async function PUT(request, { params }) {
  try {
    const session = await getSession(request);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can update order status
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can update orders' },
        { status: 403 }
      );
    }

    // Convert orderId from string to integer
    const orderId = parseInt(params.id, 10);
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE an order (admin only)
export async function DELETE(request, { params }) {
  try {
    // Convert ID to integer
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Delete order items first (due to foreign key constraints)
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });
    
    // Delete the order
    await prisma.order.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Order deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Error deleting order' },
      { status: 500 }
    );
  }
} 