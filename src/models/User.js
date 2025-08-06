import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
  role: {
    type: String,
    enum: ['reception', 'doctor', 'owner'],
    required: [true, 'Please provide a role.'],
  },
}, { timestamps: true });

// Explicitly set the collection name to 'creds'
const User = mongoose.models.User || mongoose.model('User', UserSchema, 'creds');

export default User;