import * as path from 'path';
import * as config from './config.json';

import { Database } from 'sqlite';
import { SQLiteProvider } from 'discord.js-commando';

import { ProxyClient } from '@/structures';

const client = new ProxyClient({
  commandPrefix: config.settings.prefix,
  invite: config.settings.invite,
  owner: config.settings.owner,
  unknownCommandResponse: false,
  config,
});

client.registry
  .registerGroups(config.groups)
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval_: false,
    ping: false,
  })
  .registerCommandsIn({
    dirname: path.join(__dirname, 'commands'),
    filter: (file: string) => file.includes('.base.js') ? false : file.split('.')[0],
  });

// client.setProvider(
//   require('sqlite').open(path.join(__dirname, 'settings.sqlite3'))
//   .then((db: Database) => new SQLiteProvider(db)))
//   .catch(console.error);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('@help', { type: 'LISTENING' });
});

client.login(config.token);
