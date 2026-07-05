const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Recipe = require('../models/Recipe');
const connectDB = require('../config/db');

const importDataset = async () => {
  await connectDB();

  try {
    // 1. Resolve path and read your JSON file
    const filePath = path.join(__dirname, '../recipes.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const customRecipes = JSON.parse(rawData);

    // 2. Clear old database entries (optional)
    await Recipe.deleteMany({});
    console.log('Cleared database of previous recipes.');

    // 3. Upload custom dataset
    const result = await Recipe.insertMany(customRecipes);
    console.log(`Successfully uploaded ${result.length} custom recipes from recipes.json into MongoDB!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Import execution failed: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

importDataset();