import dbConnect from '@/lib/mongoose';
import Patient from '@/models/Patient';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const contactNumber = searchParams.get('contactNumber');

  if (!contactNumber) {
    return NextResponse.json({ success: false, error: 'Contact number is required for search.' }, { status: 400 });
  }

  try {
    const patients = await Patient.find({ contactNumber }); // Changed from findOne to find
    if (patients.length > 0) {
      return NextResponse.json({ success: true, data: patients }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: 'No patients found with this mobile number.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error searching patient:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 500 });
  }
} 