#### Install NVM

<https://github.com/nvm-sh/nvm?tab=readme-ov-file>

#### Activate node

```sh
nvm use
```

#### Install project dependencies

```sh
npm install
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

#### create ~/.gatorconfig.json

Put this in ~/.gatorconfig.json, replacing `<url>` with the url required to connect to the postgres database from the "Connect to postgres" step above.

```json
{"db_url":"<url>?sslmode=disable"}
```

#### Run the program

```sh
./gator <command> <args>
```

or

```sh
npm run start <command> <args>
```
