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
  // Temporary solution
  const today = new Date();
  const startDate = new Date('2023-09-04');

  const difference = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 7));
  const currentWeek = Math.floor(difference) % 2 + 1;
  // End of temporary solution

  const time = await axios
    .get('https://schedule.kpi.ua/api/time/current')
    .then((res) => res.data);

  // Temporary solution
  time.data.currentWeek = currentWeek;
  // End of temporary solution

  return time.data;
};

const findGroup = async (searchedGroup) => {
  const groups = await getGroupList();
  return groups.find((group) => group.name === searchedGroup);
};

module.exports = { findGroup, getSchedule, currentTime };
