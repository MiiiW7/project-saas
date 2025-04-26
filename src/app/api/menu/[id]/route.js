import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
    const { id } = params;
    try {
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: parseInt(id) },
        });
        if (!menuItem) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }
        return NextResponse.json(menuItem);
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 });
    }
}


export async function PUT(request, { params }) {
    const { id } = params;
    try {
        const data = await request.json();
        const updatedMenuItem = await prisma.menuItem.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name !== undefined ? data.name : menuItem.name,
                description: data.description !== undefined ? data.description : menuItem.description,
                price: data.price !== undefined ? parseFloat(data.price) : menuItem.price,
                imageUrl: data.imageUrl !== undefined ? data.imageUrl : menuItem.imageUrl,
                category: data.category !== undefined ? data.category : menuItem.category,
                isAvailable: data.isAvailable !== undefined ? data.isAvailable : menuItem.isAvailable
            }
        });
        return NextResponse.json(updatedMenuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        await prisma.menuItem.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: 'Menu item deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}



