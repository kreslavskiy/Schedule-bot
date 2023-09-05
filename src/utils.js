'use strict';
const { PAIRS, BREAKS, LATIN_TO_CYRILLIC } = require('./collections.js');

// Get time left to the end of the current pair or break
const getLeftTime = () => {
  const now = new Date();

  // If it's a pair
  for (let i = 0; i < PAIRS.length; i++) {
    const [start, end] = PAIRS[i];

    // Set start and end time
    const startTime = new Date();
    startTime.setHours(start.split('.')[0]);
    startTime.setMinutes(start.split('.')[1]);
    startTime.setSeconds(0);

    const endTime = new Date();
    endTime.setHours(end.split('.')[0]);
    endTime.setMinutes(end.split('.')[1]);
    endTime.setSeconds(0);

    // Return time left to the end of the pair
    if (now >= startTime && now < endTime) {
      return endTime - now;
    }
  }

  // If it's a break
  for (let i = 0; i < BREAKS.length; i++) {
    const [start, end] = BREAKS[i];

    // Set start and end time
    const startTime = new Date();
    startTime.setHours(start.split('.')[0]);
    startTime.setMinutes(start.split('.')[1]);
    startTime.setSeconds(0);

    const endTime = new Date();
    endTime.setHours(end.split('.')[0]);
    endTime.setMinutes(end.split('.')[1]);
    endTime.setSeconds(0);

    // Return time left to the end of the break
    if (now >= startTime && now < endTime) {
      return endTime - now;
    }
  }
}

const getCurrent = () => {
  const now = new Date();

  // Object to determine if it's a pair or a break
  const current = {
    pair: 0,
    break: 0,
  }

  for (const pairIndex in PAIRS) {
    const [start, end] = PAIRS[pairIndex];

    // Set start and end time
    const startTime = new Date();
    startTime.setHours(start.split('.')[0]);
    startTime.setMinutes(start.split('.')[1]);
    startTime.setSeconds(0);

    const endTime = new Date();
    endTime.setHours(end.split('.')[0]);
    endTime.setMinutes(end.split('.')[1]);
    endTime.setSeconds(0);

    // Set current pair number
    if (now >= startTime && now < endTime) {
      current.pair += parseInt(pairIndex) + 1;
    }
  }

  for (const breakIndex in BREAKS) {
    const [start, end] = BREAKS[breakIndex];

    // Set start and end time
    const startTime = new Date();
    startTime.setHours(start.split('.')[0]);
    startTime.setMinutes(start.split('.')[1]);
    startTime.setSeconds(0);

    const endTime = new Date();
    endTime.setHours(end.split('.')[0]);
    endTime.setMinutes(end.split('.')[1]);
    endTime.setSeconds(0);

    // Set current break number
    if (now >= startTime && now < endTime) {
      current.break += parseInt(breakIndex) + 1;
    }
  }

  return current;
}

// Parse time in milliseconds to human-readable format
const parseTime = (time) => {
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((time / (1000 * 60)) % 60);
  const secs = Math.floor((time / 1000) % 60);

  // Return time in format "1 год 2 хв 3 с" or "2 хв 3 с"
  return hours
    ? `${hours} год ${mins} хв ${secs < 10 ? '0' + secs : secs} с`
    : `${mins} хв ${secs < 10 ? '0' + secs : secs} с`;
};

const sortPairs = (pairsList) => {
  if (pairsList) return pairsList.pairs.sort((firstPair, secondPair) => firstPair.time - secondPair.time);
}

const validateGroupName = (groupName) => {
  const normalized = groupName.replace(/[._-\s]/g, '');

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

module.exports = {
  getLeftTime,
  getCurrent,
  sortPairs,
  parseTime,
  validateGroupName,
};
