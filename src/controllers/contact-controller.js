'use strict';

import ContactService from "../services/contact-service";

const createContact = (req, res) => {
    ContactService.createContact(
        req.body.email,
        req.body.text
    ).then((contact) => {
        return contact._id;
    }).then((contactResponse) => {
        res.status(200).json(contactResponse);
        return;
    }).catch((error) => {
        console.log(error);
        res.status(500).send(error);
        return;
    })
    return;
}

module.exports = {
    createContact
}