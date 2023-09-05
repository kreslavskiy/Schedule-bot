'use strict';

const { Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');
const { findGroup, getSchedule, currentTime } = require('../api/api.js');
const { TIMETABLE, WEEKDAYS } = require('./collections.js');
const { getLeftTime, getCurrent, sortPairs, parseTime, validateGroupName } = require('./utils.js');
require('dotenv').config();
process.env.TZ = "Europe/Kyiv";

const bot = new Telegraf(process.env.BOT_TOKEN);
const mongo = new MongoClient(process.env.DB_URL);

const connect = (async () => await mongo.connect())().then(
  console.log('Connected to database')
);

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
    '_6 пара_:  17:55 – 19:30');
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
    const schedule = await getSchedule(group.groupId);

    let week = 'scheduleSecondWeek';
    if (now.currentWeek === 2) week = 'scheduleSecondWeek';

    const todaysPairs = sortPairs(schedule[week][now.currentDay - 1]);
    let message = `*${WEEKDAYS[now.currentDay - 1]}*` + '\n\n';

    if (!todaysPairs) {
      const emoji = String.fromCodePoint(0x1F973);
      message += `_Пар немає, вихідний ${emoji}_`;
    } else {
      for (const pair of todaysPairs) {
        message += `${TIMETABLE[pair.time]} ` + pair.name + ` (${pair.type})\n`;
      }
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

    console.log(now);

    let week = 'scheduleFirstWeek';
    if (now.currentWeek === 2) {
      week = 'scheduleSecondWeek';
      if (!now.currentDay) week = 'scheduleFirstWeek';
    }

    if (!now.currentDay) week = 'scheduleSecondWeek';

    const todmorrowsPairs = sortPairs(schedule[week][now.currentDay]);
    let message = `*${WEEKDAYS[now.currentDay]}*` + '\n\n';

    if (!todmorrowsPairs) {
      const emoji = String.fromCodePoint(0x1F973);
      message += `_Пар немає, вихідний ${emoji}_`;
    } else {
      for (const pair of todmorrowsPairs) {
        message += `${TIMETABLE[pair.time]} ` +  pair.name + ` (${pair.type})\n`;
      }
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
  const leftTime = getLeftTime(); // Left time in milliseconds
  const current = getCurrent(); // Determine if it's a break or a pair

  if (current.pair) {
    ctx.reply(`До початку перерви залишилось ${parseTime(leftTime)}.`);
  }

  if (current.break) {
    ctx.reply(`До початку пари залишилось ${parseTime(leftTime)}.`);
  }
})

bot.command('week', async ctx => {
  try {
    const groups = mongo.db().collection('group-list');
  
    const group = await groups.findOne({
      chatId: ctx.update.message.chat.id,
    });
  
    const now = await currentTime();
    let week = 'scheduleFirstWeek';
    if (now.currentWeek === 2) {
      week = 'scheduleSecondWeek';
      if (!now.currentDay) week = 'scheduleFirstWeek';
    } else if (now.currentWeek === 1) {
      if (!now.currentDay) week = 'scheduleSecondWeek';
    }
    console.log(week);


    const schedule = (await getSchedule(group.groupId))[week];
  
    let message = '';
    let dayCounter = 0;
  
    for (const day of schedule) {
      message += `\n*${WEEKDAYS[dayCounter]}*\n`;
      dayCounter++;
      if (day.pairs.length) {
        for (const pair of sortPairs(day)) {
          message += `${TIMETABLE[pair.time]} ` +  pair.name + ` (${pair.type})\n`;
        }
      } else {
        const emoji = String.fromCodePoint(0x1F973);
        message += `_Пар немає, вихідний ${emoji}_\n`;
      }
    }
  
    ctx.replyWithMarkdown(message);
  } catch (err) {
    console.log(err);
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
    let week = 'scheduleSecondWeek';
    if (now.currentWeek === 2) {
      week = 'scheduleFirstWeek';
      if (!now.currentDay) week = 'scheduleSecondWeek';
    } else if (now.currentWeek === 1) {
      if (!now.currentDay) week = 'scheduleFirstWeek';
    }
    const schedule = (await getSchedule(group.groupId))[week];
  
    let message = '';
    let dayCounter = 0;
  
    for (const day of schedule) {
      message += `\n*${WEEKDAYS[dayCounter]}*\n`;
      dayCounter++;
      if (day.pairs.length) {
        for (const pair of sortPairs(day)) {
          message += `${TIMETABLE[pair.time]} ` +  pair.name + ` (${pair.type})\n`;
        }
      } else {
        const emoji = String.fromCodePoint(0x1F973);
        message += `_Пар немає, вихідний ${emoji}_\n`;
      }
    }
  
    ctx.replyWithMarkdown(message);
  } catch (err) {
    console.log(err);
    ctx.reply('Помилка!');
  }
});

bot.launch().then(() => console.log('Bot has successfully started!'));
