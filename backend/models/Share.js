const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

const Share = mongoose.model('Share', shareSchema);

module.exports = Share;