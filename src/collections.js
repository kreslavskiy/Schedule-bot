'use strict';

const PAIRS_INTERVALS = {
  10.05: { interval: [10, 5], type: 'пари' },
  10.25: { interval: [10, 25], type: 'перерви' },
  12.00: { interval: [12, 0], type: 'пари' },
  12.20: { interval: [12, 20], type: 'перерви' },
  13.55: { interval: [13, 55], type: 'пари' },
  14.15: { interval: [14, 15], type: 'перерви' },
  15.50: { interval: [15, 50], type: 'пари' },
  16.10: { interval: [16, 10], type: 'перерви' },
  17.45: { interval: [17, 45], type: 'пари' },
  17.55: { interval: [17, 55], type: 'перерви' },
  19.30: { interval: [19, 30], type: 'пари' },
};

const TIMETABLE = {
  '8.30': '1) 08:30 – 10:05',
  '10.25': '2) 10:25 – 12:00',
  '12.20': '3) 12:20 – 13:55',
  '14.15': '4) 14:15 – 15:50',
  '16.10': '5) 16:10 – 17:45',
  '17.55': '6) 17:55 - 19:30',
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
