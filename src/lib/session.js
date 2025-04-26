import { cookies } from 'next/headers';
import prisma from './prisma';

export async function getSession(request) {
  console.log('getSession called');
  
  // For API routes, extract the cookie from the request
  let userId;
  if (request) {
    console.log('Processing request object');
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookie header:', cookieHeader);
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
      console.log('Parsed cookies:', cookies);
      
      const userCookie = cookies.find(cookie => cookie.startsWith('userId='));
      console.log('Found userCookie:', userCookie);
      
      userId = userCookie ? userCookie.split('=')[1] : null;
    }
  } else {
    // For server components, use the cookies() function
    console.log('Using cookies() for server component');
    try {
      const cookieStore = cookies();
      userId = cookieStore.get('userId')?.value;
      console.log('userId from cookieStore:', userId);
    } catch (error) {
      console.error('Error getting cookies:', error);
    }
  }

  console.log('Final userId from cookie:', userId);
  
  if (!userId) {
    console.log('No userId found in cookies');
    return null;
  }

  try {
    // Convert userId string to integer for Prisma
    const userIdInt = parseInt(userId, 10);
    console.log('Looking up user with id:', userIdInt);
    
    // Get user data from the database
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    console.log('User found:', user);
    return { user };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
} 