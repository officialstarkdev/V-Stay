const express = require('express');
const Booking = require('../models/Booking');
const Home = require('../models/Home');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/bookings — get user's bookings
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'homeId',
                populate: { path: 'hostId', select: 'firstName lastName' }
            });
        res.json(bookings);
    } catch (err) {
        console.error('Get bookings error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/bookings — create booking
router.post('/', auth, async (req, res) => {
    try {
        const { homeId, checkIn, checkOut, guests } = req.body;

        if (!homeId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({ message: 'All booking fields are required' });
        }

        const home = await Home.findById(homeId);
        if (!home) {
            return res.status(404).json({ message: 'Home not found' });
        }

        if (new Date(checkOut) <= new Date(checkIn)) {
            return res.status(400).json({ message: 'Check-out must be after check-in' });
        }

        const booking = new Booking({
            userId: req.userId,
            homeId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: parseInt(guests)
        });

        await booking.save();

        const populatedBooking = await Booking.findById(booking._id).populate({
            path: 'homeId',
            populate: { path: 'hostId', select: 'firstName lastName' }
        });

        res.status(201).json(populatedBooking);
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/bookings/:id — cancel booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error('Cancel booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
