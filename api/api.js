'use strict';

const axios = require('axios');

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
  // Determine the current week (1 or 2)
  const today = new Date();

  const start = '2023-09-04';
  const startArray = start.split('-');
  const monday = new Date([startArray[0], startArray[1], startArray[2]].join('-'));
  const tuesday = new Date([startArray[0], startArray[1], startArray[2] + 1].join('-'));
  const wednesday = new Date([startArray[0], startArray[1], startArray[2] + 2].join('-'));
  const thursday = new Date([startArray[0], startArray[1], startArray[2] + 3].join('-'));
  const friday = new Date([startArray[0], startArray[1], startArray[2] + 4].join('-'));
  const saturday = new Date([startArray[0], startArray[1], startArray[2] + 5].join('-'));
  const sunday = new Date([startArray[0], startArray[1], startArray[2] + 6].join('-'));

  let difference = 0;
  switch (today.getDay()) {
    case 0:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - sunday;
      break;
    case 1:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - monday;
      break;
    case 2:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - tuesday;
      break;
    case 3:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - wednesday;
      break;
    case 4:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - thursday;
      break;
    case 5:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - friday;
      break;
    case 6:
      difference = new Date(today.getFullYear(), today.getMonth(), today.getDate()) - saturday;
      break;
  }

  const currentWeek = (Math.round(difference / (1000 * 60 * 60 * 24 * 7)) + 1) % 2 === 0 ? 2 : 1

  // Determine the current day (Sunday: 0, Monday: 1, Tuesday: 2, etc.) and current lesson
  const time = await axios
    .get('https://schedule.kpi.ua/api/time/current')
    .then((res) => res.data);

  // Rewrite the current week and day
  time.data.currentWeek = currentWeek; // 1 or 2
  time.data.currentDay = today.getDay(); // Sunday: 0, Monday: 1, Tuesday: 2, etc.

  return time.data;
};

const findGroup = async (searchedGroup) => {
  const groups = await getGroupList();
  return groups.find((group) => group.name === searchedGroup);
};

module.exports = { findGroup, getSchedule, currentTime };

currentTime();
