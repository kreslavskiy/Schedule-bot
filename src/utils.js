'use strict';
const { PAIRS, BREAKS, LATIN_TO_CYRILLIC } = require('./collections.js');
process.env.TZ = "Europe/Kyiv";

const getLeftTime = () => {
  const now = new Date();
  const currentTime = now.getHours() + now.getMinutes() / 100 + now.getSeconds() / 10000;

  for (const pairIndex in PAIRS) {
    const [start, end] = PAIRS[pairIndex];
    if (currentTime >= start && currentTime < end) {
      return end - currentTime;
    }
  }

  for (const breakIndex in BREAKS) {
    const [start, end] = BREAKS[breakIndex];
    if (currentTime >= start && currentTime < end) {
      return end - currentTime;
    }
  }
}

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
  getLeftTime,
  sortPairs,
  convertMilisecsToMins,
  validateGroupName,
};
