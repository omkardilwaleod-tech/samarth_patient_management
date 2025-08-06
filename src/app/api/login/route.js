import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await dbConnect();

  try {
    const { userName, password } = await req.json(); // Use userName instead of username

    if (!userName || !password) {
      return NextResponse.json({ success: false, message: 'Please provide both username and password.' }, { status: 400 });
    }

    const user = await User.findOne({ userName }); // Use userName for lookup

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid username or password.' }, { status: 401 });
    }

    // For simplicity, directly comparing plain text passwords.
    // In a real application, you should use bcrypt or a similar library for hashing passwords.
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid username or password.' }, { status: 401 });
    }

    // Successfully authenticated, return the user's role
    return NextResponse.json({ success: true, role: user.role }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred during login.' }, { status: 500 });
  }
}