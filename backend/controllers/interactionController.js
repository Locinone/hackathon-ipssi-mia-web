const Interaction = require('../models/Interaction');
const Post = require('../models/Post');
const NotificationManager = require('../utils/notificationManager');

const createInteraction = async (req, res) => {
    const io = req.app.get('io');
    const notificationManager = new NotificationManager(io);

    const userId = req.user.id;
    const { postId, like } = req.body;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post introuvable' });
        }

        let interaction = await Interaction.findOne({ post: postId, user: userId });

        if (interaction) {
            interaction.like = like;
            await interaction.save();
        } else {
            interaction = new Interaction({ post: postId, user: userId, like });
            await interaction.save();
            post.interactions.push(interaction._id);
            await post.save();
        }

        const notificationType = like ? 'like' : 'dislike';
        const message = like ? 'Votre post a été liké' : 'Votre post a été disliké';

        await notificationManager.sendNotification({
            sender: userId,
            receiver: post.author,
            type: notificationType,
            post: postId,
            message,
        });

        res.status(201).json(interaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteInteraction = async (req, res) => {
    const io = req.app.get('io');
    const notificationManager = new NotificationManager(io);

    const userId = req.user.id;
    const { interactionId } = req.params;

    try {
        const interaction = await Interaction.findById(interactionId);

        if (!interaction) {
            return res.status(404).json({ message: 'Interaction introuvable' });
        }

        if (interaction.user.toString() !== userId) {
            return res.status(403).json({
                message: "Vous n'êtes pas autorisé à supprimer cette interaction",
            });
        }

        await Interaction.findByIdAndDelete(interactionId);
        await Post.findByIdAndUpdate(interaction.post, { $pull: { interactions: interactionId } });

        const notificationType = interaction.like ? 'like' : 'dislike';
        const message = interaction.like ? 'Un utilisateur a retiré son like de votre post.' : 'Un utilisateur a retiré son dislike de votre post.';

        await notificationManager.deleteNotification({
            sender: userId,
            receiver: interaction.post.author,
            type: notificationType,
            post: interaction.post,
            message,
            customType: 'uninteraction',
        });

        res.status(200).json({ message: 'Interaction et notification supprimées avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInteractionsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        const interactions = await Interaction.find({ post: postId }).populate('user', 'username email');
        res.status(200).send(interactions);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { createInteraction, deleteInteraction, getInteractionsByPost }; 