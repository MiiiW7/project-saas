import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const menu = await prisma.menu.findMany({
            include: {
                items: true,
            },
        });
        return NextResponse.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.price || !data.category) {
            return NextResponse.json(
                { error: 'Name, price, and category are required' },
                { status: 400 }
            );
        }

        // Ensure the category value is valid for the enum
        const validCategories = ['MAINCOURSE', 'COFFEE', 'NONCOFFEE', 'SNACK', 'DESERT'];
        if (!validCategories.includes(data.category)) {
            return NextResponse.json(
                { error: 'Invalid category. Must be one of: MAINCOURSE, COFFEE, NONCOFFEE, SNACK, DESERT' },
                { status: 400 }
            );
        }

        const newMenuItem = await prisma.menuItem.create({
            data: {
                name: data.name,
                description: data.description || null,
                price: parseFloat(data.price),
                imageUrl: data.imageUrl || null,
                category: data.category,
                isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
            }
        });

        return NextResponse.json(newMenuItem, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: `Error creating menu item: ${error.message}` },
            { status: 500 }
        );
    }
} 