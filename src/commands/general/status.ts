import { CommandMessage } from 'discord.js-commando';
import { Message, RichEmbed } from 'discord.js';
import { ProxyCommand, ProxyClient } from '@/structures';

function parseMilliseconds(ms: number) {
  // Get hours from milliseconds
  const hours = ms / (1000 * 60 * 60);
  const absoluteHours = Math.floor(hours);
  const h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

  // Get remainder from hours and convert to minutes
  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  const m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

  // Get remainder from minutes and convert to seconds
  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

  return h + ':' + m + ':' + s;
}

class StatusCommand extends ProxyCommand {
  constructor(client: ProxyClient) {
    super(client, {
      name: 'status',
      aliases: ['info', 'uptime'],
      group: 'general',
      memberName: 'status',
      description: 'Information about the bot and its status.',
    });
  }

  public async run(message: CommandMessage): Promise<Message | Message[] > {
    const usage = Math.round((process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100);

    const embed = new RichEmbed()
      .addField('Bot Creator', 'Doctor Jew#0001', false)
      .addField('Uptime', parseMilliseconds(this.client.uptime), false)
      .addField('Total Users', this.client.users.array().length)
      .addField('Total Channels', this.client.channels.array().length)
      .addField('Total Guilds', this.client.guilds.array().length)
      .addField('Node.js Version', process.version)
      .addField('Memory Usage', `${usage} MB`)
      .addField('Operating System', process.platform, false);

    return message.channel.send({ embed });
  }
}

export default StatusCommand;
