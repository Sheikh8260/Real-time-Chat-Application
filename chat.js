const express = require('express');
const Room = require('../models/Room');
const Message = require('../models/Message');
const router = express.Router();

router.post('/rooms', async (req, res) => {
    const { name } = req.body;

    try {
        let room = new Room({ name });
        await room.save();
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/messages', async (req, res) => {
    const { sender, content, room } = req.body;

    try {
        let message = new Message({ sender, content, room });
        await message.save();
        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/messages/:roomId', async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId }).populate('sender', ['username']);
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;