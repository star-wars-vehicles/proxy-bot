import * as path from 'path';
import * as config from './config.json';

import { open } from 'sqlite';
import { SQLiteProvider } from 'discord.js-commando';

import { ProxyClient } from '@/structures';

(async () => {
  const client = new ProxyClient({
    commandPrefix: config.settings.prefix,
    invite: config.settings.invite,
    owner: config.settings.owner,
    config,
  });

  client.registry
    .registerGroups(config.groups)
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
      eval: false,
      ping: false,
    })
    .registerCommandsIn({
      dirname: path.join(__dirname, 'commands'),
      filter: (file: string) => file.includes('.base.') ? false : file.split('.')[0],
    });

  const provider = new SQLiteProvider(await open(path.join(__dirname, 'settings.sqlite3')));

  client.setProvider(provider);

  client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}!`);
    client.user!.setActivity('@help', { type: 'LISTENING' });
  });

  client.login(config.token);
})();
