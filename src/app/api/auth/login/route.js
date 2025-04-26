import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// Login route
export async function POST(request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.email || !data.password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: true // Get password for comparison
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (user.password !== data.password) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }, { status: 200 });

        // Set the userId cookie
        response.cookies.set({
            name: 'userId',
            value: user.id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 1, // 1 day
            path: '/'
        });

        console.log(response);

        return response
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error logging in' },
            { status: 500 }
        );
    }
}

