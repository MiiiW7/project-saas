import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const users = await prisma.user.findMany();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.email || !data.password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Create the user (no password hashing for development)
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password, // Store password as plain text for development
                role: data.role || 'CUSTOMER' // Default to CUSTOMER role
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Error creating user' },
            { status: 500 }
        );
    }
} 