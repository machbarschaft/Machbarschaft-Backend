import mongoose from 'mongoose';

const contactFormSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ContactForm = mongoose.model('ContactForm', contactFormSchema);

export default ContactForm;
