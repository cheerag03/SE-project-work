const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const LifestyleSchema = new Schema({
  activityLevel: { type: String, enum: ['sedentary','light','moderate','active','very_active'], default: 'moderate' },
  dailySteps: { type: Number, default: 0 }
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  loginMethod: { type: String, enum: ['email','google','facebook','apple'], default: 'email' },
  age: { type: Number },
  gender: { type: String, enum: ['male','female','other'], default: 'other' },
  height: { type: Number },
  weight: { type: Number },
  lifestyle: { type: LifestyleSchema, default: () => ({}) },
  goals: { type: [String], default: [] },
  medicalConditions: { type: [String], default: [] },
  medications: { type: [String], default: [] },
  isOnboarded: { type: Boolean, default: false },
  avatarUrl: { type: String, default: '' },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  preferences: {
    units: { type: String, enum: ['metric','imperial'], default: 'metric' },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },
  // store refresh token hash if you want to support refresh tokens securely
  refreshTokenHash: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.passwordHash; delete ret.__v; delete ret.refreshTokenHash; return ret; } }
});

// Index commonly queried fields
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Virtual: BMI
UserSchema.virtual('bmi').get(function(){
  if (!this.height || !this.weight) return null;
  const heightM = this.height / 100;
  const bmi = this.weight / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
});

// Instance method: set password
UserSchema.methods.setPassword = async function(password){
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
  return this.passwordHash;
};

// Instance method: verify password
UserSchema.methods.verifyPassword = async function(password){
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

// Static: find by email (case-insensitive)
UserSchema.statics.findByEmail = function(email){
  return this.findOne({ email: email.toLowerCase().trim() });
};

module.exports = mongoose.model('User', UserSchema);
