import dbConnect from '@/lib/mongoose';
import Patient from '@/models/Patient';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = await params; 

  try {
    const body = await req.json();
    console.log('PUT /api/patients/[id] - Request Body:', body);

    let patient;

    let existingPatient = await Patient.findOne({ patientIdentifier: id });

    if (!existingPatient) {
      return NextResponse.json({ success: false, error: 'Patient not found.' }, { status: 404 });
    }

    // Capture treatmentCountAtLeadOpen if lead is becoming 'open'
    if (body.lead === 'open' && existingPatient.lead !== 'open') {
      existingPatient.treatmentCountAtLeadOpen = (existingPatient.treatments || []).length;
    }

    if (body._id && body.isTreatmentUpdate) {
      // This is an update to an existing treatment
      const { isTreatmentUpdate, ...treatmentUpdateData } = body;

      const treatmentIndex = existingPatient.treatments.findIndex(t => t._id.toString() === body._id);

      if (treatmentIndex > -1) {
        // Apply updates to the specific treatment
        Object.assign(existingPatient.treatments[treatmentIndex], treatmentUpdateData);
      } else {
        return NextResponse.json({ success: false, error: 'Treatment not found for update.' }, { status: 404 });
      }
    } else if (body.isNewTreatment) {
      // This is a new treatment to be added
      const { isNewTreatment, ...newTreatmentData } = body; // Exclude internal flag

      // Ensure treatments array exists
      if (!existingPatient.treatments) {
        existingPatient.treatments = [];
      }
      existingPatient.treatments.push(newTreatmentData);
    } else {
      // Regular patient field update
      // Filter out treatment-related fields if they are not meant for the top-level patient document
      const { treatments, isTreatmentUpdate, isNewTreatment, ...updateData } = body;
      // Apply updates to the top-level patient fields
      Object.assign(existingPatient, updateData);
    }

    // Save the modified patient document
    patient = await existingPatient.save({ runValidators: true });
    console.log('Patient document after save:', patient);

    return NextResponse.json({ success: true, data: patient }, { status: 200 });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 400 });
  }
} 