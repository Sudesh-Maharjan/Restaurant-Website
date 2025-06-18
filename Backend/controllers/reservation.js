const Reservation = require('../models/Reservation');
const nodemailer = require('nodemailer');

// Email configuration
let transporter;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('Reservation email transporter configured');
  } else {
    console.log('Email credentials not found in environment variables');
  }
} catch (error) {
  console.error('Error setting up email transporter:', error);
}

// Function to send reservation email to restaurant owner
const sendReservationEmail = async (reservation) => {
  if (!transporter) {
    console.log('Email transporter not configured, skipping email notification');
    return;
  }

  try {
    const { name, email, phone, partySize, date, time, specialRequests } = reservation;
    
    // Format date for email
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RESTAURANT_EMAIL || process.env.EMAIL_USER, // Send to restaurant email or fall back to sender
      subject: `New Table Reservation - ${name}`,
      html: `
        <h2>New Table Reservation</h2>
        <p>You have received a new table reservation request:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Party Size:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${partySize} people</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${time}</td>
          </tr>
          ${specialRequests ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Special Requests:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${specialRequests}</td>
          </tr>
          ` : ''}
        </table>
        <p>Please confirm this reservation as soon as possible.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Reservation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending reservation email:', error);
    return false;
  }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Public
exports.createReservation = async (req, res, next) => {
  try {
    const { name, email, phone, partySize, date, time, specialRequests } = req.body;

    // Create reservation
    const reservation = await Reservation.create({
      name,
      email,
      phone,
      partySize,
      date,
      time,
      specialRequests
    });

    // Send email notification to restaurant owner
    sendReservationEmail(reservation);

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
exports.getReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private/Admin
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
