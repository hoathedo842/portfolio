import Contact from '../models/Contact.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    let formattedPhone = phone;

    if (phone) {
      const phoneNumber = parsePhoneNumberFromString(phone);

      if (phoneNumber && phoneNumber.isValid()) {
        formattedPhone = phoneNumber.format('E.164');
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format. Please check and try again.',
        });
      }
    }

    const newContact = new Contact({
      name,
      email,
      phone: formattedPhone,
      message,
    });

    await newContact.save();

    return res.status(201).json({
      success: true,
      message:
        'Thank you for reaching out! Your message has been sent successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error: ' + error.message,
    });
  }
};

export default {
  submitContact,
};
