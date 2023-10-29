'use strict';
const { PAIRS, BREAKS, LATIN_TO_CYRILLIC } = require('./collections.js');
const {getSchedule} = require("../api/api");
const {WEEKDAYS, TIMETABLE} = require("./collections");

// Set start and end time for a pair or a break
const setTime = (start, end) => {
  const startTime = new Date();
  startTime.setHours(start.split('.')[0]);
  startTime.setMinutes(start.split('.')[1]);
  startTime.setSeconds(0);

  const endTime = new Date();
  endTime.setHours(end.split('.')[0]);
  endTime.setMinutes(end.split('.')[1]);
  endTime.setSeconds(0);

  return [startTime, endTime];
}

// Get time left to the end of the current pair or break
const getLeftTime = () => {
  const now = new Date();

  const pairsAndBreaks = [...PAIRS, ...BREAKS];

  // If it's a pair or a break
  for (let i = 0; i < pairsAndBreaks.length; i++) {
    const [start, end] = pairsAndBreaks[i];

    const [startTime, endTime] = setTime(start, end);

    // Return time left to the end of the pair or break
    if (now >= startTime && now < endTime) {
      return endTime - now;
    }
  }
}

const getCurrent = () => {
  const now = new Date();

  const setCurrent = (timeArray, type) => {
    for (const [start, end] of timeArray) {
      const [startTime, endTime] = setTime(start, end);

      if (now >= startTime && now < endTime) {
        current[type] = 1;
        break;
      }
    }
  };

  const current = {
    pair: 0,
    break: 0,
  };

  setCurrent(PAIRS, 'pair');
  setCurrent(BREAKS, 'break');

  return current;
};


// Parse time in milliseconds to human-readable format
const parseTime = (time) => {
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((time / (1000 * 60)) % 60);
  const secs = Math.floor((time / 1000) % 60);

  // Return time in format "1 год 2 хв 3 с" or "2 хв 3 с"
  return hours
    ? `${hours} год ${mins} хв ${secs} с`
    : `${mins} хв ${secs} с`;
};

const sortPairs = (pairsList) => {
  if (pairsList) return pairsList.pairs.sort((firstPair, secondPair) => firstPair.time - secondPair.time);
}

const validateGroupName = (groupName) => {
  const normalized = groupName.replace(/[._\-\s]/g, '');

  let validated = normalized
    .slice(0, 2)
    .toUpperCase()
    .concat('-' + normalized.slice(2));

  for (const [latin, cyrillic] of Object.entries(LATIN_TO_CYRILLIC)) {
    if (validated.includes(latin)) {
      validated = validated.replaceAll(latin, cyrillic);
    }
  }

  return validated;
};

const getScheduleForDay = async (group, week, day) => {
  const unsortedSchedule = (await getSchedule(group.groupId))[week][day];
  const schedule = sortPairs(unsortedSchedule);

  let message = `*${WEEKDAYS[day]}*` + '\n\n';

  if (!schedule || schedule.length === 0) {
    const emoji = String.fromCodePoint(0x1F973);
    return `_Пар немає, вихідний ${emoji}_`;
  }

  for (const pair of schedule) {
    message += `${TIMETABLE[pair.time]} ` + pair.name + ` (${pair.type})\n`;
  }

  return message;
}

const getScheduleForWeek = async (group, week) => {
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

  return message;
}

module.exports = {
  getLeftTime,
  getCurrent,
  sortPairs,
  parseTime,
  validateGroupName,
  getScheduleForWeek,
  getScheduleForDay,
};
