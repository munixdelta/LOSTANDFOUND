const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

// add item
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    const item = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      user: req.user.id
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// get all items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// search items by name
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { name } = req.query;
    const items = await Item.find({
      itemName: { $regex: name, $options: 'i' }
    }).populate('user', 'name email');
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// get single item
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email');
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// update item - only owner can update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// delete item - only owner can delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
