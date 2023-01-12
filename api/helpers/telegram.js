import * as dotenv from 'dotenv'
dotenv.config()

import TelegramBot from'node-telegram-bot-api'

const defaultChat = {
  token: process.env.TGBOT || '5713175294:AAGgu5IDy4je7_mY1p1qFLKUSCXT4uoj4ww',
  chatID: process.env.TGCHAT || '449828535',
}
// const defaultChat = {
//   token: process.env.TGBOT || '5716260887:AAG4LnserA5nCktV9OVugTrH45v-A6C1J_I',
//   chatID: process.env.TGCHAT || '839052234',
// }

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