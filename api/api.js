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
  const time = await axios
    .get('https://schedule.kpi.ua/api/time/current')
    .then((res) => res.data);
  return time.data;
};

const findGroup = async (searchedGroup) => {
  const groups = await getGroupList();
  return groups.find((group) => group.name === searchedGroup);
};

module.exports = { findGroup, getSchedule, currentTime };
