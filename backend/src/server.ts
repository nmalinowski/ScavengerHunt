import express from 'express';
import mongoose from 'mongoose';
import huntRoutes from './routes/huntRoutes';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scavenger-hunt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/hunts', huntRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
