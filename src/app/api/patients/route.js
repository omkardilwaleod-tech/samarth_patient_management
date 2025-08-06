import dbConnect from '@/lib/mongoose';
import Patient from '@/models/Patient';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid'; // Import nanoid

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    console.log('POST /api/patients - Request Body:', body);
    
    // Generate a unique patientIdentifier
    const patientIdentifier = nanoid(10); // Generate a 10-character ID
    body.patientIdentifier = patientIdentifier;
    body.treatments = []; // Initialize treatments as an empty array
    body.treatmentCountAtLeadOpen = 0; // Initialize treatment count when lead is opened

    const patient = await Patient.create(body);

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error) {
    console.error('Error saving patient:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 400 });
  }
}

export async function GET(req) {
  await dbConnect();

  try {
    const patients = await Patient.find({});
    return NextResponse.json({ success: true, data: patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 400 });
  }
} 