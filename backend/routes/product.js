const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const upload = require('../config/multer');
const fs = require('fs');
const path = require('path');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create product (admin only)
router.post('/', authMiddleware, roleMiddleware('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, brand, price, stock, category, description } = req.body;

    // Validation
    if (!name || !brand || !price || !stock || !category || !description) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Image path - store relative path or filename
    const imagePath = req.file ? `/images/products/${req.file.filename}` : null;

    const product = new Product({
      name,
      brand,
      price,
      stock,
      category,
      description,
      image: imagePath
    });

    await product.save();
    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully', 
      product 
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, roleMiddleware('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, brand, price, stock, category, description, isActive } = req.body;

    const updateData = { name, brand, price, stock, category, description, isActive };

    // If new image is uploaded
    if (req.file) {
      updateData.image = `/images/products/${req.file.filename}`;
      
      // Delete old image
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join('F:\\adrs\\images\\myapp\\products', path.basename(oldProduct.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      // Delete uploaded file if product not found
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ 
      success: true, 
      message: 'Product updated successfully', 
      product 
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete image file from disk
    if (product.image) {
      const imagePath = path.join('F:\\adrs\\images\\myapp\\products', path.basename(product.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get products by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
