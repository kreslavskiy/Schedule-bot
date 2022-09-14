'use strict';

const { Telegraf } = require('telegraf');
const { MongoClient } = require('mongodb');
const axios = require('axios');
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
    }
  ],
);

bot.command('timetable', (ctx) => {
  ctx.replyWithMarkdown(
    '_1 пара_:  08:30 – 10:05\n' +
      '_2 пара_:  10:25 – 12:00\n' +
      '_3 пара_:  12:20 – 13:55\n' +
      '_4 пара_:  14:15 – 15:50\n' +
      '_5 пара_:  16:10 – 17:45\n'
  );
});

const TIMETABLE = { 
  '8.30': '1) 08:30 – 10:05',
  '10.25': '2) 10:25 – 12:00',
  '12.20': '3) 12:20 – 13:55',
  '14.15': '4) 14:15 – 15:50',
  '16.10': '5) 16:10 – 17:45',
  '17.55': '6) 17:55 - 19:30',
};

const WEEKDAYS = [
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  'Пʼятниця',
  'Субота',
  'Неділя',
];

bot.command('group', async (ctx) => {
  try {
    const groups = mongo.db().collection('group-list');

    const searchedGroup = ctx.message.text.split(' ').slice(1).join(' ');
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

    ctx.reply(`Ви обрали групу ${group.name}, ${group.faculty}`);
  } catch (err) {
    console.log(err);
    ctx.reply('Не можу знайти цю групу', {
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
    if (now.currentWeek === 2) week = 'scheduleSecondWeek';

    const todaysPairs = sortPairs(schedule[week][now.currentDay - 1].pairs);
    let message = `*${WEEKDAYS[now.currentDay - 1]}*` + '\n\n';

    console.log(todaysPairs);

    for (const pair of todaysPairs) {
      message += `_${TIMETABLE[pair.time]}_ ` + pair.name + ` (${pair.type})\n`;
    }

    ctx.replyWithMarkdown(message);

  } catch {
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
    if (now.currentWeek === 2) week = 'scheduleSecondWeek';

    const todmorrowsPairs = sortPairs(schedule[week][now.currentDay].pairs);
    let message = `*${WEEKDAYS[now.currentDay]}*` + '\n\n';

    for (const pair of todmorrowsPairs) {
      message += `_${TIMETABLE[pair.time]}_ ` +  pair.name + ` (${pair.type})\n`;
    }

    ctx.replyWithMarkdown(message);

  } catch {
    console.log(err);
    ctx.reply('Спочатку оберіть групу за допомогою команди group', {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

const findGroup = async (searchedGroup) => {
  const groups = await getGroupList();
  for (const group of groups) {
    if (group.name === searchedGroup) {
      return group;
    }
  }
};

const sortPairs = (pairsList) => pairsList.sort((a, b) => a.time - b.time);

const getGroupList = async () => {
  const groupList = await axios
    .get('https://schedule.kpi.ua/api/schedule/groups')
    .then((res) => res.data);
  return groupList.data;
};

const getSchedule = async (groupId) => {
  const schedule = await axios
    .get(`https://schedule.kpi.ua/api/schedule/lessons?groupId=${groupId}`)
    .then((res) => res.data);
  return schedule.data;
};

const currentTime = async () => {
  const time = await axios
    .get('https://schedule.kpi.ua/api/time/current')
    .then((res) => res.data);
  return time.data;
};

bot.launch().then(() => console.log('Bot has successfully started!'));
