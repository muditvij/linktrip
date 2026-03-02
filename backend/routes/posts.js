const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});
const upload = multer({ storage: storage });

// Gamification Helper
const checkAndAwardBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;
        let newBadges = [...user.badges];
        if (user.points >= 10 && !newBadges.includes('Novice Explorer')) newBadges.push('Novice Explorer');
        if (user.points >= 50 && !newBadges.includes('Traveler')) newBadges.push('Traveler');
        if (user.points >= 100 && !newBadges.includes('Globetrotter')) newBadges.push('Globetrotter');
        if (user.points >= 500 && !newBadges.includes('World Nomad')) newBadges.push('World Nomad');
        if (newBadges.length > user.badges.length) {
            user.badges = newBadges;
            await user.save();
        }
    } catch (err) {
        console.error('Badge award error:', err);
    }
};

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        let imagePath = '';
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            imagePath = req.body.image;
        }

        const newPost = new Post({
            caption: req.body.caption,
            location: req.body.location,
            image: imagePath,
            user: req.user.id
        });

        const post = await newPost.save();

        // Gamification: Award 10 points
        const user = await User.findById(req.user.id);
        user.points += 10;
        await user.save();
        await checkAndAwardBadges(req.user.id);

        // Populate user info for immediate display
        await post.populate('user', 'name profilePic');
        res.json(post);
    } catch (err) {
        console.error(err.stack);
        res.status(500).send(err.stack);
    }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }).populate('user', 'name profilePic');
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/feed
// @desc    Get posts from followed users
// @access  Private
router.get('/feed', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        // Include self and following
        const feedUserIds = [...currentUser.following, req.user.id];

        const posts = await Post.find({ user: { $in: feedUserIds } })
            .sort({ date: -1 })
            .populate('user', 'name profilePic');

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked
        if (post.likes.some(like => like.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift(req.user.id);
        await post.save();

        // Gamification: Award 2 points to the post owner if it's not a self-like
        if (post.user.toString() !== req.user.id) {
            const author = await User.findById(post.user);
            if (author) {
                author.points += 2;
                await author.save();
                await checkAndAwardBadges(post.user);
            }
        }

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   GET api/posts/user/:userId
// @desc    Get all posts by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId }).sort({ date: -1 }).populate('user', 'name profilePic');
        res.json(posts);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
