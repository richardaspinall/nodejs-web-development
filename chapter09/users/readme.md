# Users information service

## CLI Commands:

Help:

`node cli.mjs --help`

Add a user:

`node cli.mjs add richie --password wOrd --family-name Aspinall --given-name Richard --email test@test.com`

Find a user:

`node cli.mjs find richie`

List all users:

`node cli.mjs list-users`

Update a user:

`node cli.mjs update richie --password password --family-name Aspinall --given-name Richard --email test@updatedemailaddress.com`

Delete a user:

`node cli.mjs destroy richie`

Password check a user:

`node cli.mjs password-check richie wOrd`

---

## SQLite Commands

Start sqlite3 shell: `sqlite3 users-sequelize.sqlite3`

Add columns to output `.mode column`

^ This can also be added to your `~/.sqliterc` file ref: https://dba.stackexchange.com/questions/40656/how-to-properly-format-sqlite-shell-output

## Start users service:

`npm start` (see `package.json` for details)
