const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 1 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    description: { type: String, required: true, trim: true },
    photo: { type: String, default: 'default' },
    imageUrl: { type: String, default: '' },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Home', homeSchema);
