import { Schema, model } from 'mongoose';

const HuntSchema = new Schema({
  code: { type: String, required: true, unique: true },
  clues: [{
    description: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }],
  prize: { type: String, required: true },
  adminPassword: { type: String, required: true }, // Password for admin management
  participants: [{ name: String }], // List of participant names
  maxDistance: { type: Number, default: 20 }
});

export default model('Hunt', HuntSchema);