import * as dotenv from 'dotenv';

import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

const defaultChat = {
  token: process.env.TGBOT,
  chatID: process.env.TGCHAT,
};

/* eslint-disable import/prefer-default-export */
export const sendMessage = async ({
  token,
  chatID,
  message,
}) => {
  try {
    const bot = new TelegramBot(token || defaultChat.token);
    await bot.sendMessage(chatID || defaultChat.chatID, message);
  } catch {
    try {
      const bot = new TelegramBot(defaultChat.token);
      await bot.sendMessage(defaultChat.chatID, message);
    } catch (error) {
      console.error(`[ telegram ] => ${error}: `, {
        token: token || defaultChat.token,
        chatID: chatID || defaultChat.chatID,
        message,
      });
    }
  }
};
