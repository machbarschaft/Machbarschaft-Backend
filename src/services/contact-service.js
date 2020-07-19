import models from '../models/bundle';

export default class ContactService {
  static async createContact(email, text) {
    const contact = new models.ContactForm({
      email: email,
      text: text,
    });
    return contact.save();
  }
}
