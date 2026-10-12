// src/utils/calc.js
// Basic health calculations: BMI, BMR (Mifflin-St Jeor), daily calorie estimate
exports.calculateBMI = ({ weightKg, heightCm }) => {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  return Math.round(bmi * 10) / 10;
};

// Mifflin-St Jeor BMR
// sex: 'male' | 'female' ; age: years
exports.calculateBMR = ({ weightKg, heightCm, age, sex }) => {
  if (!weightKg || !heightCm || !age) return null;
  const s = (sex === 'male') ? 5 : -161;
  const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + s;
  return Math.round(bmr);
};

// activityLevel: sedentary, light, moderate, active, very_active
exports.estimateDailyCalories = ({ bmr, activityLevel }) => {
  if (!bmr) return null;
  const factors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const factor = factors[activityLevel] || 1.375;
  return Math.round(bmr * factor);
};
