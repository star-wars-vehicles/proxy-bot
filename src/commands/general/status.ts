import { CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
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

export default class StatusCommand extends ProxyCommand {
    constructor(client: ProxyClient) {
        super(client, {
            name: 'status',
            aliases: ['info', 'uptime'],
            group: 'general',
            memberName: 'status',
            description: 'Information about the bot and its status.',
        });
    }

    public async run(message: CommandoMessage): Promise<Message | Message[]> {
        const usage = Math.round((process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100);

        const { uptime, users, channels, guilds, user } = this.client;

        if (user == null) {
            return message.channel.send('Error!');
        }

        const embed = new MessageEmbed()
            .setThumbnail(user.avatar || user.defaultAvatarURL)
            .setTimestamp()
            .addField('Bot Creator', 'Doctor Jew#0001', true)
            .addField('Uptime', parseMilliseconds(uptime!), true)
            .addField('Total Users', users.array().length)
            .addField('Total Channels', channels.array().length)
            .addField('Total Guilds', guilds.array().length)
            .addField('Node.js Version', process.version)
            .addField('Memory Usage', `${usage} MB`)
            .addField('Operating System', process.platform, false);

        if (message.guild) {
            embed.setColor(message.guild!.me!.roles.highest.color);
        }

        return message.channel.send({ embed });
    }
}
