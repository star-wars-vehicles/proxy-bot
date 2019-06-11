import { CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import { ProxyCommand, ProxyClient } from '@/structures';

export default class PingCommand extends ProxyCommand {
  constructor(client: ProxyClient) {
    super(client, {
      name: 'ping',
      group: 'general',
      memberName: 'ping',
      description: 'Measure bot response time.',
    });
  }

  public async run(message: CommandoMessage): Promise<Message | Message[]> {
    const response = message.channel.send('', {
      embed: {
        title: 'Measuring Latency...',
        color: 0xf44242,
      },
    });

    return response.then((value: Message | Message[]): Promise<Message | Message[]> => {
      if (value instanceof Message) {
        return value.edit('', {
          embed: {
            title: 'Latency Results',
            color: 0x41f44a,
            fields: [
              {
                name: 'Client Ping',
                value: `${value.createdTimestamp - message.createdTimestamp} ms`,
              },
              {
                name: 'API Ping',
                value: `${this.client.ws.ping} ms`,
              },
            ],
          },
        });
      }

      return Promise.all(value);
    });
  }
}
