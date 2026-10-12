const Appointment = require('../models/Appointment');

/**
 * List appointments for logged-in user
 */
exports.listAppointments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const appointments = await Appointment.find({ user: userId }).sort({ dateTime: 1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new appointment
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { expertName, expertRole, dateTime, notes } = req.body;

    if (!expertName || !expertRole || !dateTime) {
      return res.status(400).json({ message: 'expertName, expertRole, and dateTime are required' });
    }

    const appointment = await Appointment.create({
      user: userId,
      expertName,
      expertRole,
      dateTime: new Date(dateTime),
      notes: notes || '',
      status: 'scheduled'
    });

    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
};
