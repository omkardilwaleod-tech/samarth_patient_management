import mongoose from 'mongoose';

const TreatmentSchema = new mongoose.Schema({
  treatment: {
    type: String,
    maxlength: [500, 'Treatment notes cannot be more than 500 characters'],
    default: '',
  },
  amountToCollect: {
    type: Number,
    default: 0,
  },
  doctorName: {
    type: String,
    maxlength: [60, 'Doctor name cannot be more than 60 characters'],
    default: '',
  },
  treatmentStatus: {
    type: String,
    enum: ['Pending', 'Complete', 'Next Visit Required'],
    default: 'Pending',
  },
  nextVisitDate: {
    type: Date,
    default: null,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', ''],
    default: '',
  },
}, { timestamps: true });

const PatientSchema = new mongoose.Schema({
  patientIdentifier: {
    type: String,
    required: [true, 'Please provide a unique identifier for this patient.'],
    unique: true,
    maxlength: [20, 'Patient Identifier cannot be more than 20 characters'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for this patient.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide a date of birth for this patient.'],
  },
  gender: {
    type: String,
    required: [true, 'Please specify the gender of this patient.'],
    enum: ['Male', 'Female', 'Other'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number.'],
    maxlength: [20, 'Contact number cannot be more than 20 characters'],
  },
  address: {
    type: String,
    required: [true, 'Please provide an address.'],
    maxlength: [200, 'Address cannot be more than 200 characters'],
  },
  lead: {
    type: String,
    default: 'open',
  },
  treatmentCountAtLeadOpen: {
    type: Number,
    default: 0,
  },
  isNewEnquiry: {
    type: Boolean,
    default: true,
  },
  treatments: [TreatmentSchema], // Array of treatment objects
}, { timestamps: true });

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema); 