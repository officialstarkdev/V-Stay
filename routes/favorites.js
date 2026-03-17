const express = require('express');
const Favorite = require('../models/Favorite');
const Home = require('../models/Home');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites — get user's favorites
router.get('/', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.userId }).populate({
            path: 'homeId',
            populate: { path: 'hostId', select: 'firstName lastName' }
        });
        const homes = favorites.map(f => f.homeId).filter(Boolean);
        res.json(homes);
    } catch (err) {
        console.error('Get favorites error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/favorites/ids — get just the favorite home IDs for current user
router.get('/ids', auth, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.userId }).select('homeId');
        const ids = favorites.map(f => f.homeId.toString());
        res.json(ids);
    } catch (err) {
        console.error('Get favorite ids error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/favorites/:homeId — add to favorites
router.post('/:homeId', auth, async (req, res) => {
    try {
        const home = await Home.findById(req.params.homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        const existing = await Favorite.findOne({ userId: req.userId, homeId: req.params.homeId });
        if (existing) {
            return res.status(400).json({ message: 'Already in favorites' });
        }

        const favorite = new Favorite({
            userId: req.userId,
            homeId: req.params.homeId
        });

        await favorite.save();
        res.status(201).json({ message: 'Added to favorites' });
    } catch (err) {
        console.error('Add favorite error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/favorites/:homeId — remove from favorites
router.delete('/:homeId', auth, async (req, res) => {
    try {
        const result = await Favorite.findOneAndDelete({ userId: req.userId, homeId: req.params.homeId });
        if (!result) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.json({ message: 'Removed from favorites' });
    } catch (err) {
        console.error('Remove favorite error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
