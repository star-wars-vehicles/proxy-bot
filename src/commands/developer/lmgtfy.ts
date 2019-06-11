import { CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';

import { ProxyCommand, ProxyClient } from '@/structures';
import { NotifyEmbed } from '@/util';

export default class LmgtfyCommand extends ProxyCommand {
  constructor(client: ProxyClient) {
    super(client, {
      name: 'lmgtfy',
      aliases: ['google'],
      group: 'developer',
      memberName: 'lmgtfy',
      description: 'When somebody asks you some dumb shit, reply with this.',
      args: [
        {
          key: 'query',
          prompt: 'What is your query?',
          type: 'string',
        },
      ],
    });
  }

  public async run(message: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
    const embed = NotifyEmbed('Let Me Google That for You', args.query, 'BLUE')
      .setThumbnail('https://i.imgur.com/DT7YdC7.png')
      .setURL(`https://lmgtfy.com/?q=${args.query.replace(/ /g, '+')}`);

    return message.channel.send({ embed });
  }
}
