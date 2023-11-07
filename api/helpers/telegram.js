import * as dotenv from 'dotenv'
dotenv.config()

import TelegramBot from'node-telegram-bot-api'

const defaultChat = {
  token: process.env.TGBOT,
  chatID: process.env.TGCHAT,
}

export const sendMessage = async ({
  token,
  chatID,
  message
}) => {
  try {
    const bot = new TelegramBot(token || defaultChat.token);
    await bot.sendMessage(chatID || defaultChat.chatID, message)
  } catch {
    try {
      const bot = new TelegramBot(defaultChat.token);
      await bot.sendMessage(defaultChat.chatID, message)
    } catch (error) {
      console.error(`[ telegram ] => ${error}: `, {
        token: token || defaultChat.token,
        chatID: chatID || defaultChat.chatID,
        message
      })
    }
  }
}