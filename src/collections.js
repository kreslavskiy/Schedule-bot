'use strict';

const PAIRS_INTERVALS = {
  10.05: { interval: [10, 5], type: 'перерви' },
  10.25: { interval: [10, 25], type: 'пари' },
  12.00: { interval: [12, 0], type: 'перерви ' },
  12.20: { interval: [12, 20], type: 'пари' },
  13.55: { interval: [13, 55], type: 'перерви' },
  14.15: { interval: [14, 15], type: 'пари' },
  15.50: { interval: [15, 50], type: 'перерви' },
  16.10: { interval: [16, 10], type: 'пари' },
  17.45: { interval: [17, 45], type: 'перерви' },
  17.55: { interval: [17, 55], type: 'пари' },
  19.30: { interval: [19, 30], type: 'перерви' },
};

const TIMETABLE = {
  '8.30': '1) _08:30 – 10:05_',
  '10.25': '2) _10:25 – 12:00_',
  '12.20': '3) _12:20 – 13:55_',
  '14.15': '4) _14:15 – 15:50_',
  '16.10': '5) _16:10 – 17:45_',
  '17.55': '6) _17:55 - 19:30_',
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

const LATIN_TO_CYRILLIC = {
  A: 'А',
  B: 'Б',
  V: 'В',
  G: 'Г',
  H: 'Г',
  D: 'Д',
  E: 'Е',
  Z: 'З',
  K: 'К',
  L: 'Л',
  M: 'М',
  N: 'Н',
  O: 'О',
  P: 'П',
  R: 'Р',
  S: 'С',
  T: 'Т',
  U: 'У',
  Y: 'У',
  F: 'Ф',
  C: 'Ц',
  I: 'І',
  X: 'Х',
};

module.exports = { TIMETABLE, WEEKDAYS, PAIRS_INTERVALS, LATIN_TO_CYRILLIC };
