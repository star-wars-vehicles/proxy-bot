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
