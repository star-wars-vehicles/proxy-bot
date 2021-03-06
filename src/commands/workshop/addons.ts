import { Message } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';

import { ProxyCommand, ProxyClient } from '@/structures';
import { guild } from '@/util';

export default class AddonsCommand extends ProxyCommand {
    constructor(client: ProxyClient) {
        super(client, {
            name: 'addons',
            group: 'workshop',
            memberName: 'addons',
            description: 'Get a list of all server supported addons.',
            args: [
                {
                    key: 'search',
                    type: 'string|integer',
                    default: -1,
                    prompt: 'Please enter a workshop ID or a search query.',
                },
            ],
        });
    }

    @guild
    public async run(message: CommandoMessage, args: { search: string | number }): Promise<Message | Message[]> {
        return message.channel.send(`If this were working, we'd look up ${args.search}.`);
    }
}
