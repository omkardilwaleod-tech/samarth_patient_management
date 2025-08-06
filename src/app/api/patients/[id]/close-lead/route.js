import dbConnect from '@/lib/mongoose';
import Patient from '@/models/Patient';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const patient = await Patient.findOneAndUpdate(
      { patientIdentifier: id },
      { lead: 'closed' },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return NextResponse.json({ success: false, error: 'Patient not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patient }, { status: 200 });
  } catch (error) {
    console.error('Error closing lead:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 400 });
  }
}