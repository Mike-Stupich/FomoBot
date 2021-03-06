/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MESSENGER =============================================================
import sendApi from './send';

// ===== MODELS ================================================================
import Portfolios from '../models/portfolios';

/**
 * sendSharedPortfolios - Gets & Sends a list of all portfolios a user owns.
 * @param   {Number} senderId - FB ID to send to.
 * @param   {String} type - Postback Action type to respond to.
 * @returns {Undefined} - .
 */
const sendOwnedPortfolios = (senderId, type) => {
    Portfolios.getOwnedForUser(senderId)
        .then((portfolios) => {
            sendApi.sendPortfolios(senderId, type, portfolios, Number(type.substring(19)));
        });
};

/**
 * sendSharedPortfolios - Gets & Sends a list of all portfolios a user is associated with.
 * @param   {Number} senderId - FB ID to send to.
 * @param   {String} type - Action type to send.
 * @returns {Undefined} - .
 */
const sendSharedPortfolios = (senderId, type) => {
    Portfolios.getSharedToUser(senderId)
        .then((portfolios) => {
            sendApi.sendPortfolios(senderId, type, portfolios, Number(type.substring(22)));
        });
};

/*
 * handleReceivePostback — Postback event handler triggered by a postback
 * action you, the developer, specify on a button in a template. Read more at:
 * developers.facebook.com/docs/messenger-platform/webhook-reference/postback
 */
const handleReceivePostback = (event) => {
    /**
     * The 'payload' param is a developer-defined field which is
     * set in a postbackbutton for Structured Messages.
     *
     * In this case we've defined our payload in our postback
     * actions to be a string that represents a JSON object
     * containing `type` and `data` properties. EG:
     */
    const type = event.postback.payload;
    const senderId = event.sender.id;

    // Perform an action based on the type of payload received.
    if (type.substring(0, 11) === 'owned_portfolios') {
        sendOwnedPortfolios(senderId, type);
    } else if (type.substring(0, 16) === 'subscribed_portfolios') {
        sendSharedPortfolios(senderId, type);
    } else if (type.substring(0, 11) === 'get_started') {
        sendApi.sendWelcomeMessage(senderId);
        return;
    }
    // eslint-enable camelcase

    sendApi.sendMessage(senderId, `Unknown Postback called: ${type}`);
};

/*
 * handleReceiveMessage - Message Event called when a message is sent to
 * your page. The 'message' object format can vary depending on the kind
 * of message that was received. Read more at: https://developers.facebook.com/
 * docs/messenger-platform/webhook-reference/message-received
 */
const handleReceiveMessage = (event) => {
    const message = event.message;
    const senderId = event.sender.id;

    // It's good practice to send the user a read receipt so they know
    // the bot has seen the message. This can prevent a user
    // spamming the bot if the requests take some time to return.
    sendApi.sendReadReceipt(senderId);

    if (message.text) { sendApi.sendWelcomeMessage(senderId); }
};

export default {
    handleReceivePostback,
    handleReceiveMessage,
};