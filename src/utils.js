'use strict';

const { PAIRS_INTERVALS, LATIN_TO_CYRILLIC } = require('./collections.js');

const getPairEnd = () => {
  const today = new Date();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  const now = hours + minutes / 100;


  for (const [time, data] of Object.entries(PAIRS_INTERVALS)) {
    if (now <= time) return data;
  }
};

const convertMilisecsToMins = (millis) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `*${minutes} хв ${(seconds < 10 ? '0' : '')}${seconds} сек*`;
}

const sortPairs = (pairsList) => pairsList.sort((firstPair, secondPair) => firstPair.time - secondPair.time);

const validateGroupName = (groupName) => {
  const normalized = groupName.replace(/[._-\s]/g, '');
  
  let validated = normalized.slice(0, 2).toUpperCase().concat('-' + normalized.slice(2));
  
  for (const [latin, cyrillic] of Object.entries(LATIN_TO_CYRILLIC)) {
    if (validated.includes(latin)) {
      validated = validated.replaceAll(latin, cyrillic);
    }
  }

  return validated;
};

module.exports = { getPairEnd, sortPairs, convertMilisecsToMins, validateGroupName };
