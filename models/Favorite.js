const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    homeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
    createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ userId: 1, homeId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
