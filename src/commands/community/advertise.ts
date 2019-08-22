import { Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

import { ProxyCommand, ProxyClient } from '@/structures';
import { guild } from '@/util';

export default class AdvertiseCommand extends ProxyCommand {
    constructor(client: ProxyClient) {
        super(client, {
            name: 'advertise',
            group: 'community',
            memberName: 'advertise',
            description: 'Advertise your community to the server!',
        });
    }

    @guild
    public async run(message: CommandoMessage): Promise<Message | Message[]> {
        return message.channel.send(`Testing advertising command!`);
    }
}
