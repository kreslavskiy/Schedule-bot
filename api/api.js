'use strict';

const axios = require('axios');

const getGroupList = async () => {
  const groupList = await axios
    .get('https://api.campus.kpi.ua/schedule/groups')
    .then((res) => res.data);
  return groupList.data;
};

const getSchedule = async (groupId) => {
  const schedule = await axios
    .get(`https://api.campus.kpi.ua/schedule/lessons?groupId=${groupId}`)
    .then((res) => res.data);
  return schedule.data;
};

const currentTime = async () => {
  // Determine the current week (1 or 2)
  const today = new Date();
  const start = new Date('2023-09-04');
  const daysDiff = (today - start) / (1000 * 60 * 60 * 24);
  const currentWeek = Math.floor(daysDiff / 7) % 2 + 1;

  // Determine the current day (Sunday: 0, Monday: 1, Tuesday: 2, etc.) and current lesson
  const time = await axios
    .get('https://api.campus.kpi.ua/time/current')
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
