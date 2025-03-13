const Hashtag = require('../models/Hashtag');
const Theme = require('../models/Theme');
const jsonResponse = require('../utils/jsonResponse');

const getTrendings = async (req, res) => {
    const { period } = req.body;
    if (period === 'week') {
        const hashtags = await Hashtag.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).limit(5);
        const themes = await Theme.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).limit(5);
        jsonResponse(res, "Trendings récupérés avec succès", 201, { hashtags, themes });
    } else {
        const hashtags = await Hashtag.find().limit(5);
        const themes = await Theme.find().limit(5);
        jsonResponse(res, "Trendings récupérés avec succès", 201, { hashtags, themes });
    }

}

module.exports = { getTrendings };
