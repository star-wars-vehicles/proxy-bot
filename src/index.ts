import 'reflect-metadata';

import { join } from 'path';
import { open } from 'sqlite';
import { SQLiteProvider } from 'discord.js-commando';

import config from './config.json';
import { ProxyClient } from '@/structures';
import { ErrorEmbed } from '@/util';

async function main() {
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
        unknownCommand: false,
    })
    .registerCommandsIn({
        dirname: join(__dirname, 'commands'),
        filter: (file: string) => file.includes('.base.') ? false : file.split('.')[0],
    });
    
    client.setProvider(new SQLiteProvider(await open(join(__dirname, 'settings.sqlite3'))));
    
    client.on('ready', () => {
        console.log(`Logged in as ${client.user!.tag}!`);
        client.user!.setActivity('@help', { type: 'LISTENING' });
    });

    client.on('commandBlock', (message, reason) => {
        message.channel.send({ embed: ErrorEmbed(reason) });
    });
    
    client.login(config.token);
}

main();
