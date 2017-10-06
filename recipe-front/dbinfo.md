Start up postgres: sudo -u postgres psql

This starts postgres as the user postgres.

To list databases use \l

Then use \c to connect to one! Connect to the proper one, create a table, set up login credentials, and go nuts.

\q to exit

* You can create and drop databases
* You can create and drop tables

\d will list tables (all of them)

\d tablename will list the details of a single table

\dn to list schema

INSERT INTO recipes (name, ingr) VALUES ('Good morning Liana', 'Have a great day, I love you, drive safe, see you tonight, made you a sandwich');


Example jsonb card table:

CREATE TABLE cards (
  id integer NOT NULL,
  board_id integer NOT NULL,
  data jsonb
);