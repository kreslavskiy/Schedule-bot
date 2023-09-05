'use strict';

const { PAIRS_INTERVALS, LATIN_TO_CYRILLIC } = require('./collections.js');

const getPairEnd = () => {
  const today = new Date();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const now = hours + minutes / 100;

  for (const [time, data] of Object.entries(PAIRS_INTERVALS)) {
    if (now < time) return data === 'пари' ? 'перерви' : 'пари'
  }
};

const convertMilisecsToMins = (millis) => {
  const secs = Math.floor((millis / 1000) % 60);
  const mins = Math.floor((millis / (1000 * 60)) % 60);
  const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);

  return hours
    ? `*${hours} год ${mins} хв ${secs < 10 ? '0' + secs : secs} с*`
    : `*${mins} хв ${secs < 10 ? '0' + secs : secs} с*`;
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
  getPairEnd,
  sortPairs,
  convertMilisecsToMins,
  validateGroupName,
};
