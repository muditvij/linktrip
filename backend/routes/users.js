const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'name profilePic')
            .populate('following', 'name profilePic');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.put('/follow/:id', auth, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (req.params.id === req.user.id) {
            return res.status(400).json({ msg: 'You cannot follow yourself' });
        }

        // Check if already follows
        if (currentUser.following.some(follow => follow.toString() === req.params.id)) {
            return res.status(400).json({ msg: 'Already following this user' });
        }

        currentUser.following.unshift(req.params.id);
        userToFollow.followers.unshift(req.user.id);

        await currentUser.save();
        await userToFollow.save();

        res.json(currentUser.following);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/users/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.put('/unfollow/:id', auth, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (req.params.id === req.user.id) {
            return res.status(400).json({ msg: 'You cannot unfollow yourself' });
        }

        // Check if actually following
        if (!currentUser.following.some(follow => follow.toString() === req.params.id)) {
            return res.status(400).json({ msg: 'Not following this user' });
        }

        // Remove from current user's following list
        currentUser.following = currentUser.following.filter(
            follow => follow.toString() !== req.params.id
        );

        // Remove from target user's followers list
        userToUnfollow.followers = userToUnfollow.followers.filter(
            follower => follower.toString() !== req.user.id
        );

        await currentUser.save();
        await userToUnfollow.save();

        res.json(currentUser.following);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Multer Storage Configuration for Users
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// @route   PUT api/users/edit
// @desc    Edit user profile
// @access  Private
router.put('/edit', auth, upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }]), async (req, res) => {
    try {
        console.log("DEBUG: /edit hit. req.body:", req.body, "req.files:", req.files, "headers:", req.headers['content-type']);
        const { name, bio, location } = req.body || {};

        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Build user object
        const profileFields = {};
        if (name) profileFields.name = name;
        if (bio !== undefined) profileFields.bio = bio; // Allow empty string
        if (location !== undefined) profileFields.location = location; // Allow empty string

        if (req.files) {
            if (req.files.profilePic && req.files.profilePic.length > 0) {
                profileFields.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
            }
            if (req.files.coverPic && req.files.coverPic.length > 0) {
                profileFields.coverPic = `/uploads/${req.files.coverPic[0].filename}`;
            }
        }

        // Update
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true, select: '-password' }
        );

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
