'use strict';

const { Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');
const { findGroup, getSchedule, currentTime } = require('../api/api.js');
const { TIMETABLE, WEEKDAYS } = require('./collections.js');
const {
  getLeftTime,
  getCurrent,
  sortPairs,
  parseTime,
  validateGroupName,
  getScheduleForWeek,
  getScheduleForDay
} = require('./utils.js');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const mongo = new MongoClient(process.env.DB_URL);

const connect = (async () => await mongo.connect())().then(
  console.log('Connected to database')
);

const firstWeek = 'scheduleFirstWeek';
const secondWeek = 'scheduleSecondWeek';

bot.telegram.setMyCommands(
  [
    {
      "command": "timetable",
      "description": "Розклад дзвінків"
    },
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
      "command": "week",
      "description": "Розклад на цей тиждень"
    },
    {
      "command": "nextweek",
      "description": "Розклад на наступний тиждень"
    },
    {
      "command": "left",
      "description": "Скільки часу залишилось до початку пари або перерви"
    }
  ],
);

bot.help(ctx => {
  ctx.replyWithMarkdown(
    '/timetable – *подивитись розклад дзвінків*\n' +
    '/group _<код групи>_ – *змінити групу або подивитись обрану*\n' +
    '/today – *розклад на сьогодні для обраної групи*\n' +
    '/tomorrow – *розклад на завтра для обраної групи*\n' +
    '/week – *розклад на цей тиждень*\n' +
    '/nextweek – *розклад на наступний тиждень*\n' +
    '/left – *подивитись скільки часу залишилось до початку пари або перерви*'
  );
})

bot.command('timetable', ctx => {
  ctx.replyWithMarkdown(
    '_1 пара_:  08:30 – 10:05\n' +
    '_2 пара_:  10:25 – 12:00\n' +
    '_3 пара_:  12:20 – 13:55\n' +
    '_4 пара_:  14:15 – 15:50\n' +
    '_5 пара_:  16:10 – 17:45\n' +
    '_6 пара_:  18:30 - 20:05');
});

bot.command('group', async (ctx) => {
  try {
    const groups = mongo.db().collection('group-list');

    const searchedGroup = validateGroupName(ctx.message.text.split(' ').slice(1).join(' '));
    const group = await findGroup(searchedGroup);

    const chat = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });

    if (!chat) {

      ctx.reply(`Ви обрали групу ${group.name} (${group.faculty ? group.faculty : ''})`, {
        reply_to_message_id: ctx.message.message_id,
      });

      await groups.insertOne({
        chatId: ctx.update.message.chat.id,
        groupId: group.id,
        groupName: group.name,
        faculty: group.faculty,
      });

    } else {
      if (ctx.message.text.split(' ').slice(1).join(' ')) {

        ctx.reply(`Ви обрали групу ${group.name} (${group.faculty ? group.faculty : ''})`, {
          reply_to_message_id: ctx.message.message_id,
        });

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

      } else {
        ctx.reply(`Обрана група: ${chat.groupName} (${chat.faculty})`, {
          reply_to_message_id: ctx.message.message_id,
        });
      }
    }

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

    const week = now.currentWeek === 1 ? firstWeek : secondWeek;

    const schedule = await getScheduleForDay(group, week, now.currentDay - 1);

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

    const sunday = 7;

    let week = now.currentWeek === 1 ? firstWeek : secondWeek;
    if (now.currentDay === sunday) {
      week = now.currentWeek === 1 ? secondWeek : firstWeek;
      now.currentDay = 0;
    }

    const schedule = await getScheduleForDay(group, week, now.currentDay);

    ctx.replyWithMarkdown(schedule);
  } catch (err) {
    console.log(err);
    ctx.reply('Спочатку оберіть групу за допомогою команди group', {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.command('left', async ctx => {
  const now = new Date();
  const leftTime = getLeftTime(); // Left time in milliseconds
  const current = getCurrent(); // Determine if it's a break or a pair

  if (current.pair) {
    ctx.reply(`До перерви залишилось ${parseTime(leftTime)}.`);
  }

  if (current.break) {
    ctx.reply(`До пари залишилось ${parseTime(leftTime)}.`);
  }

  if (!current.pair && !current.break) {
    ctx.reply('У вас шо, пара зараз??');
  }
})

bot.command('week', async ctx => {
  try {
    const groups = mongo.db().collection('group-list');

    const group = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });

    const now = await currentTime();

    const week = now.currentWeek === 1 ? firstWeek : secondWeek;

    const schedule = await getScheduleForWeek(group, week);

    ctx.replyWithMarkdown(schedule);
  } catch (err) {
    ctx.reply('Помилка!');
  }
});

bot.command('nextweek', async ctx => {
  try {
    const groups = mongo.db().collection('group-list');

    const group = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });

    const now = await currentTime();

    const week = now.currentWeek === 1 ? secondWeek : firstWeek;

    const schedule = await getScheduleForWeek(group, week);

    ctx.replyWithMarkdown(schedule);
  } catch (err) {
    ctx.reply('Помилка!');
  }
});

bot.command('getTime', async ctx => {
  const now = await currentTime();
  ctx.reply(now);
})

bot.launch().then(() => console.log('Bot has successfully started!'));
