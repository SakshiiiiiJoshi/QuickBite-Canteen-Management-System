const express = require('express');
const Food = require('../models/Food');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/foods
// @desc    Get all food items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find().sort({ category: 1, name: 1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/foods/:id
// @desc    Get single food item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/foods
// @desc    Add a new food item
// @access  Private (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;

    const food = await Food.create({
      name,
      description,
      price,
      category,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json(food);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/foods/:id
// @desc    Update a food item
// @access  Private (Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const { name, description, price, category, image, isAvailable } = req.body;

    food.name = name || food.name;
    food.description = description !== undefined ? description : food.description;
    food.price = price !== undefined ? price : food.price;
    food.category = category || food.category;
    food.image = image !== undefined ? image : food.image;
    food.isAvailable = isAvailable !== undefined ? isAvailable : food.isAvailable;

    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/foods/:id
// @desc    Delete a food item
// @access  Private (Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    await food.deleteOne();
    res.json({ message: 'Food item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
