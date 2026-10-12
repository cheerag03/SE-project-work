// src/seed/seed.js
// Rich seed script to populate test data: users (admin + user), workouts, meals, supplements, posts, conversation + messages.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const Supplement = require('../models/Supplement');
const Post = require('../models/Post');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const config = require('../config/index');

async function clearCollections() {
  const collections = ['users', 'workouts', 'meals', 'supplements', 'posts', 'conversations', 'messages'];
  for (const name of collections) {
    if (mongoose.connection.collections[name]) {
      try {
        await mongoose.connection.collections[name].deleteMany({});
      } catch (err) { /* ignore */ }
    }
  }
}

async function seed() {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await clearCollections();

    // Create admin
    const adminEmail = config.seedAdminEmail || 'admin@local';
    const adminPass = config.seedAdminPassword || 'admin123';
    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      role: 'admin',
      isOnboarded: true
    });
    await admin.setPassword(adminPass);
    await admin.save();

    // Create standard user
    const user = new User({
      name: 'Seed User',
      email: 'seed@gmail.com',
      isOnboarded: true,
      heightCm: 175,
      weightKg: 72,
      lifestyle: { activityLevel: 'light', dailySteps: 4000 }
    });
    await user.setPassword('password123');
    await user.save();

    console.log(`Admin created: ${admin.email} / ${adminPass}`);
    console.log(`User created: ${user.email} / password123`);

    // Seed workouts
    const workouts = [
      { title: 'Full Body Beginner', description: '20-min full body routine', durationMin: 20, caloriesBurn: 150, category: 'fullbody' },
      { title: 'Morning Yoga', description: 'Gentle yoga for mobility', durationMin: 30, caloriesBurn: 100, category: 'yoga' },
      { title: 'HIIT Quick', description: 'Short high-intensity interval training', durationMin: 15, caloriesBurn: 200, category: 'hiit' }
    ];
    const createdWorkouts = await Workout.insertMany(workouts);
    console.log(`Inserted ${createdWorkouts.length} workouts.`);

    // Seed meals for today & yesterday
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);

    const breakfast = new Meal({
      user: user._id,
      name: 'Oats with banana',
      calories: 350,
      protein: 12,
      carbs: 55,
      fat: 8,
      mealType: 'breakfast',
      date: new Date(today.setHours(8, 0, 0, 0))
    });
    const lunch = new Meal({
      user: user._id,
      name: 'Grilled chicken salad',
      calories: 480,
      protein: 40,
      carbs: 20,
      fat: 18,
      mealType: 'lunch',
      date: new Date(today.setHours(13, 0, 0, 0))
    });
    const dinner = new Meal({
      user: user._id,
      name: 'Rice, dal, veg',
      calories: 600,
      protein: 20,
      carbs: 85,
      fat: 15,
      mealType: 'dinner',
      date: new Date(yesterday.setHours(19, 0, 0, 0))
    });
    await Meal.insertMany([breakfast, lunch, dinner]);
    console.log('Inserted sample meals.');

    // Seed supplements
    const supplements = [
      { name: 'Whey Protein 1kg', sku: 'WP-1KG', description: 'Premium whey protein', priceCents: 2499, stock: 50, category: 'protein' },
      { name: 'Omega-3 Fish Oil', sku: 'OM3-60', description: '1200mg EPA/DHA', priceCents: 1599, stock: 30, category: 'omega' }
    ];
    const createdSupps = await Supplement.insertMany(supplements);
    console.log(`Inserted ${createdSupps.length} supplements.`);

    // Seed posts and comments
    const post1 = new Post({ author: user._id, title: 'Best pre-workout snack?', content: 'What do you prefer before workouts?', category: 'nutrition' });
    await post1.save();
    const post2 = new Post({ author: admin._id, title: 'Welcome to WellNexus!', content: 'Say hi and share your goals.', category: 'general', pinned: true });
    await post2.save();
    console.log('Inserted posts.');

    // Create a conversation between user and admin and some messages
    const convo = new Conversation({ participants: [user._id, admin._id], type: 'user-therapist', title: 'Seed conversation' });
    await convo.save();
    const m1 = new Message({ conversation: convo._id, sender: user._id, role: 'user', content: 'Hi, I want help with a workout plan.' });
    const m2 = new Message({ conversation: convo._id, sender: admin._id, role: 'therapist', content: 'Sure — tell me your schedule.' });
    await Message.insertMany([m1, m2]);
    convo.lastMessageAt = new Date();
    await convo.save();
    console.log('Created conversation and messages.');

    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
