import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getSession } from '../../../lib/session';

// POST /api/orders - Create a new order
export async function POST(request) {
    try {    
      const session = await getSession(request);
      console.log('Session:', session);
      
      // Check authentication
      if (!session?.user) {
        console.log('No user in session');
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
  
      const userId = session.user.id;
      console.log('User ID:', userId);
      
      const requestBody = await request.json();
      console.log('Request body:', JSON.stringify(requestBody));
      
      const { items } = requestBody;
  
      // Validate request body
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('Missing or invalid items array');
        return NextResponse.json(
          { error: 'Order must contain at least one item' },
          { status: 400 }
        );
      }
  
      // Extract menu item IDs to fetch their prices
      const menuItemIds = items.map(item => item.menuItemId);
      console.log('Menu item IDs:', menuItemIds);
  
      // Fetch menu items to get their prices
      const menuItems = await prisma.menuItem.findMany({
        where: {
          id: {
            in: menuItemIds,
          },
        },
      });
      
      console.log('Menu items found:', menuItems.length);
      
      if (menuItems.length === 0) {
        console.log('No menu items found');
        return NextResponse.json(
          { error: 'No valid menu items found' },
          { status: 400 }
        );
      }
  
      // Calculate order total and create items array
      let total = 0;
      const orderItems = [];
  
      for (const item of items) {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        
        if (!menuItem) {
          console.log(`Menu item with ID ${item.menuItemId} not found`);
          return NextResponse.json(
            { error: `Menu item with ID ${item.menuItemId} not found` },
            { status: 400 }
          );
        }
  
        const quantity = item.quantity || 1;
        const subtotal = menuItem.price * quantity;
        
        total += subtotal;
        
        orderItems.push({
          menuItemId: menuItem.id,
          quantity: quantity,
          price: menuItem.price,
        });
      }
      
      console.log('Total calculated:', total);
      console.log('Order items:', orderItems);
  
      try {
        // Create the order in the database
        console.log('Creating order with data:', {
          userId,
          totalPrice: total,
          status: 'PENDING',
          items: orderItems.length
        });
        
        const order = await prisma.order.create({
          data: {
            userId,
            totalPrice: total,
            status: 'PENDING',
            items: {
              create: orderItems,
            },
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
        
        console.log('Order created successfully, order ID:', order.id);
        return NextResponse.json(order, { status: 201 });
      } catch (dbError) {
        console.error('Database error creating order:', dbError);
        return NextResponse.json(
          { error: 'Database error: ' + dbError.message },
          { status: 500 }
        );
      }
  
    } catch (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order: ' + error.message },
        { status: 500 }
      );
    }
  } 