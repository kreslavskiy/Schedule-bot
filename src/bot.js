'use strict';

const { Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');
const { findGroup, getSchedule, currentTime } = require('../api/api.js');
const { TIMETABLE, WEEKDAYS } = require('./collections.js');
const { getPairEnd, sortPairs, convertMilisecsToMins, validateGroupName } = require('./utils.js');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const mongo = new MongoClient(process.env.DB_URL);

const connect = (async () => await mongo.connect())().then(
  console.log('Connected to database')
);

bot.telegram.setMyCommands(
  [
    {
      "command": "group",
      "description": "Обрати групу"
    },
    {
      "command": "today",
      "description": "Розклад на сьогодні"
    },
    {
      "command": "tomorrow",
      "description": "Розклад на завтра"
    },
    {
      "command": "left",
      "description": "Скільки часу залишолось до кінця пари"
    }
  ],
);

bot.command('group', async (ctx) => {
  try {
    const groups = mongo.db().collection('group-list');

    const searchedGroup = validateGroupName(ctx.message.text.split(' ').slice(1).join(' '));
    const group = await findGroup(searchedGroup);

    const chat = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });

    if (!chat) {
      await groups.insertOne({
        chatId: ctx.update.message.chat.id,
        groupId: group.id,
        groupName: group.name,
        faculty: group.faculty,
      });
    } else {
      await groups.updateOne(
        { chatId: ctx.update.message.chat.id },
        {
          $set: {
            groupId: group.id,
            groupName: group.name,
            faculty: group.faculty,
          },
        }
      );
    }

    let faculty = `(${group.faculty})`;
    if (!group.faculty) faculty = '';

    ctx.reply(`Ви обрали групу ${group.name} ${faculty}`, {
      reply_to_message_id: ctx.message.message_id,
    });
  } catch (err) {
    console.log(err);
    ctx.reply('Не можу знайти цю групу, спробуйте ввести у форматі XX-XX', {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.command('today', async (ctx) => {
  try {
    const groups = mongo.db().collection('group-list');

    const group = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });

    const now = await currentTime();
    const schedule = await getSchedule(group.groupId);

    let week = 'scheduleFirstWeek';
    if (now.currentWeek === 1) week = 'scheduleSecondWeek';

    const todaysPairs = sortPairs(schedule[week][now.currentDay - 1].pairs);
    let message = `*${WEEKDAYS[now.currentDay - 1]}*` + '\n\n';

    if (!todaysPairs.length) {
      const emoji = String.fromCodePoint(0x1F973);
      message += `_Пар немає, вихідний ${emoji}_`;
    }

    for (const pair of todaysPairs) {
      message += `_${TIMETABLE[pair.time]}_ ` + pair.name + ` (${pair.type})\n`;
    }

    ctx.replyWithMarkdown(message);

  } catch (err) {
    console.log(err);
    ctx.reply('Спочатку оберіть групу за допомогою команди group', {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.command('tomorrow', async (ctx) => {
  try {
    const groups = mongo.db().collection('group-list');

    const group = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });

    const now = await currentTime();
    const schedule = await getSchedule(group.groupId);

    let week = 'scheduleFirstWeek';
    if (now.currentWeek === 1) week = 'scheduleSecondWeek';

    const todmorrowsPairs = sortPairs(schedule[week][now.currentDay].pairs);
    let message = `*${WEEKDAYS[now.currentDay]}*` + '\n\n';

    if (!todmorrowsPairs.length) {
      const emoji = String.fromCodePoint(0x1F973);
      message += `_Пар немає, вихідний ${emoji}_`;
    }

    for (const pair of todmorrowsPairs) {
      message += `_${TIMETABLE[pair.time]}_ ` +  pair.name + ` (${pair.type})\n`;
    }

    ctx.replyWithMarkdown(message);

  } catch (err) {
    console.log(err);
    ctx.reply('Спочатку оберіть групу за допомогою команди group', {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.command('left', async ctx => {
  try {
    // const time = await currentTime();

    // let week = 'scheduleFirstWeek';
    // if (time.currentWeek === 1) week = 'scheduleSecondWeek';

    // const groups = mongo.db().collection('group-list');

    // const group = await groups.findOne({
    //   chatId: ctx.update.message.chat.id,
    // });

    // const schedule = await getSchedule(group.groupId);

    const pairEnd = getPairEnd();

    if (pairEnd) {
      const now = Date.now();
      const today = new Date();

      const neededTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), ...pairEnd.interval);

      const left = neededTime - now;

      ctx.replyWithMarkdown(`До кінця ${pairEnd.type} залишилося ${convertMilisecsToMins(left)}`);

    } else {
      ctx.reply('Зараз немає пари!')
    }
  } catch (err) {
    console.log(err);
    ctx.reply('Помилка');
  }
});

bot.launch().then(() => console.log('Bot has successfully started!'));
