# Steps to configure and use this program

## Install NVM

<https://github.com/nvm-sh/nvm?tab=readme-ov-file>

## Activate node

Whenever you open a new terminal you should run this command to switch to the correct version of node:
```sh
nvm use
```

## Install project dependencies

```sh
npm install
```

## Install postgres

### On Ubuntu

```sh
sudo apt update
sudo apt install postgresql postgresql-contrib
```

## Connect to postgres

### First time connecting

Change the postgres system user's password to something you'll remember:
```sh
sudo passwd postgres
```

Run the postgres shell. Use the password you just set.
```sh
sudo -u postgres psql
```

That should give you a prompt that looks like this
```
postgres=#
```

### On Ubuntu

Set the database password in the postgres shell
```sql
ALTER USER postgres PASSWORD 'postgres';
```

### Connecting from a different user account

```sh
psql "postgres://postgres:postgres@localhost:5432/"

```

If you used a different user, database password, domain, or port, the URL format is `postgres://username:password@domain:port/`

## Use psql to create the database

From the postgres shell run

```sql
CREATE DATABASE gator;
```

You can then connect to the gator database with `\c gator`


## Create ~/.gatorconfig.json

Put this in ~/.gatorconfig.json, replacing `<url>` with the url required to connect to the postgres database from the "Connect to postgres" step above.

```json
{"db_url":"<url>/<database>?sslmode=disable"}
```

If your database username and password are both "postgres", your database is "gator", and your port is 5432 your ~/.gatorconfig.json should look like this:
```json
{"db_url":"postgres://postgres:postgres@localhost:5432/gator?sslmode=disable"}
```

## Initialize the database

```sh
npx drizzle-kit migrate
```

## Run the program

```sh
./gator <command> <args>
```

or

```sh
npm run start <command> <args>
```

Use `./gator help` to get a list of commands.
