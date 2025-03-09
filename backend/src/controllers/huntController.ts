import { Request, Response } from 'express';
import Hunt from '../models/Hunt';
import { validateClueLocations, geocodeAddress, ClueInput } from '../services/geoService';

export const createHunt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, clues, prize, adminPassword } = req.body;

    if (!code || !clues || !prize || !adminPassword) {
      res.status(400).json({ error: 'Code, clues, prize, and admin password are required' });
      return;
    }

    const processedClues = await Promise.all(clues.map(async (clue: ClueInput) => {
      if (clue.address && (!clue.latitude || !clue.longitude)) {
        const { latitude, longitude } = await geocodeAddress(clue.address);
        return { description: clue.description, latitude, longitude };
      }
      return {
        description: clue.description,
        latitude: clue.latitude,
        longitude: clue.longitude
      };
    }));

    if (!validateClueLocations(processedClues)) {
      res.status(400).json({ error: 'All clues must be within 20 miles of the first clue' });
      return;
    }

    const hunt = new Hunt({ code, clues: processedClues, prize, adminPassword, participants: [] });
    await hunt.save();
    res.status(201).json(hunt);
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to create hunt: ${errorMessage}` });
  }
};

export const getHuntByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const hunt = await Hunt.findOne({ code });

    if (!hunt) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    res.json(hunt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hunt' });
  }
};

// New endpoint for participants to join
export const joinHunt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name } = req.body;

    if (!code || !name) {
      res.status(400).json({ error: 'Code and name are required' });
      return;
    }

    const hunt = await Hunt.findOne({ code });
    if (!hunt) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    if (!hunt.participants.some(p => p.name === name)) {
      hunt.participants.push({ name });
      await hunt.save();
    }

    res.json(hunt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join hunt' });
  }
};

// New endpoint for admin validation
export const validateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, adminPassword } = req.body;

    if (!code || !adminPassword) {
      res.status(400).json({ error: 'Code and admin password are required' });
      return;
    }

    const hunt = await Hunt.findOne({ code });
    if (!hunt) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    if (hunt.adminPassword !== adminPassword) {
      res.status(403).json({ error: 'Incorrect admin password' });
      return;
    }

    res.json({ message: 'Admin validated', hunt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate admin' });
  }
};