# Steps to configure and use this program

#### Install NVM

<https://github.com/nvm-sh/nvm?tab=readme-ov-file>

#### Activate node

Whenever you open a new terminal you should run this command to switch to the correct version of node:
```sh
nvm use
```

#### Install project dependencies

```sh
npm install
```

#### create ~/.gatorconfig.json

Put this in ~/.gatorconfig.json, replacing `<url>` with the url required to connect to the postgres database from the "Connect to postgres" step above.

```json
{"db_url":"<url>?sslmode=disable"}
```

If your database username and password are both "postgres" and your port is 5432 your ~/.gatorconfig.json should look like this:
```json
{"db_url":"postgres://postgres:postgres@localhost:5432/?sslmode=disable"}
```


#### Install postgres

##### On Ubuntu:
```sh
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### Connect to postgres

```sh
psql "postgres://postgres:postgres@localhost:5432/"

```

If you need to modify the URL the format is `postgres://username:password@domain:port/`

#### Use psql to create gator database
```sql
CREATE DATABASE gator;
```

#### Initialize the database
```sh
npx drizzle-kit migrate
```

#### Run the program

```sh
./gator <command> <args>
```

or

```sh
npm run start <command> <args>
```

Use `./gator help` to get a list of commands.
