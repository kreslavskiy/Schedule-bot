# Schedule KPI Telegram Bot

Simple Telegram bot which uses [Schedule KPI API](https://github.com/kpi-ua/schedule.kpi.ua) and can show schedule for groups.

## Download & Run

1. Clone this repository

```bash
git clone https://github.com/kreslavskiy/Schedule-bot
```

2. Install all necessary packages

```bash
npm install
```

3. Create configuration file

.env file must be in following format:

```
DB_URL=
BOT_TOKEN=
```

Where `DB_URL` is MongoDB URL and `BOT_TOKEN` is Telegram token for bot ([can be obtained here](https://t.me/BotFather))

4. Run

```bash
npm run start
```

## Available commands

- /timetable — lessons timetable
- /group \<XX-XX\> (XX-XX is name of the group) — link chat to group
- /today — schedule for today
- /tomorrow — schedule for tomorrow
- /week — schedule for week
- /nextweek — schedule for next week
- /left — show how much time is left untill the end of lesson/break
