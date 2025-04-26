import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
    try {
        const response = NextResponse.json({
            message: 'Logged out successfully'
        }, { status: 200 });

        // Clear the userId cookie
        response.cookies.set({
            name: 'userId',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
