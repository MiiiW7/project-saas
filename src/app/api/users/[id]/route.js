import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET a specific user by ID
export async function GET(request, { params }) {
    try {
      const id = parseInt(params.id);
      
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid ID format' },
          { status: 400 }
        );
      }
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user, { status: 200 });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: 'Error fetching user' },
        { status: 500 }
      );
    }
  }

// UPDATE a user
export async function PUT(request, { params }) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid ID format' },
                { status: 400 }
            );
        }

        const data = await request.json();

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData = {
            name: data.name
        };

        // If password is provided, use it directly
        if (data.password) {
            updateData.password = data.password;
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Error updating user' },
            { status: 500 }
        );
    }
}

// DELETE a user
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const deletedUser = await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json(deletedUser, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
