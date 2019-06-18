import util from 'util';

import { Mongoose } from 'mongoose';
import { Message, MessageEmbed } from 'discord.js';
import { CommandoMessage } from 'discord.js-commando';
import { Embeds } from 'discord-paginationembed';

import { ProxyCommand, ProxyClient } from '@/structures';

export default class EvalCommand extends ProxyCommand {
  private lastResult: any = null;
  private sensitivePattern: RegExp = new RegExp('');

  private hrStart: [number, number] | undefined;

  constructor(client: ProxyClient) {
    super(client, {
      name: 'eval',
      group: 'util',
      memberName: 'eval',
      description: 'Executes JavaScript code.',
      details: 'Only the bot owner(s) can use this command.',
      ownerOnly: true,
      args: [{
        key: 'script',
        prompt: 'What code would you like to evaluate?',
        type: 'string',
      }],
    });

    client.on('ready', () => {
      let pattern = '';

      if (client.token) {
        pattern += client.token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      }

      this.sensitivePattern = new RegExp(pattern, 'gi');
    });
  }

  public async run(message: CommandoMessage, args: { script: string }): Promise<Message | Message[]> {
    const client: ProxyClient = message.client as ProxyClient;
    const db: Mongoose = client.mongoose;
    const lastResult = this.lastResult;

    const reply = (val: any) => {
      if (val instanceof Error) {
        message.reply(`Callback error: \`${val}\``);
      } else {
        if (Array.isArray(val)) {
          const embeds = val.map((value: any): MessageEmbed => {
            return this.generateResultEmbed(value, process.hrtime(this.hrStart));
          });

          try {
            new Embeds()
              .setChannel(message.channel)
              .setArray(embeds)
              .setAuthorizedUsers([ message.author.id ])
              .build().catch((error: any) => {
                const embed = new MessageEmbed()
                .setTitle('Error')
                .setColor('DARK_RED')
                .addField('Input', `\`\`\`javascript\n${args.script}\n\`\`\``)
                .addField('Output', `\`\`\`javascript\n${error}\n\`\`\``);

                return message.channel.send({ embed });
              });
          } catch (error) {
            const embed = new MessageEmbed()
            .setTitle('Error')
            .setColor('DARK_RED')
            .addField('Input', `\`\`\`javascript\n${args.script}\n\`\`\``)
            .addField('Output', `\`\`\`javascript\n${error}\n\`\`\``);

            return message.channel.send({ embed });
          }
        } else {
          message.channel.send({ embed: this.generateResultEmbed(val, process.hrtime(this.hrStart)) });
        }
      }
    };

    let hrDiff;
    try {
      const hrStart = process.hrtime();

      this.lastResult = await eval(args.script);

      hrDiff = process.hrtime(hrStart);
    } catch (error) {
      const embed = new MessageEmbed()
        .setTitle('Error')
        .setColor('DARK_RED')
        .addField('Input', `\`\`\`javascript\n${args.script}\n\`\`\``)
        .addField('Output', `\`\`\`javascript\n${error}\n\`\`\``);

      return message.channel.send({ embed });
    }

    this.hrStart = process.hrtime();

    const embed = this.generateResultEmbed(this.lastResult, hrDiff, args.script);

    return message.channel.send({ embed });
  }

  private generateResultEmbed(result: any, hrDiff: [number, number], input: string | null = null): MessageEmbed {
    const inspected = util.inspect(result, { depth: 0 }).replace(this.sensitivePattern, '--snip--');

    if (input) {
      return new MessageEmbed()
        .setTitle('Results')
        .setColor('GREEN')
        .setDescription(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`)
        .addField('Input', `\`\`\`javascript\n${input}\n\`\`\``)
        .addField('Output', `\`\`\`javascript\n${inspected}\n\`\`\``);
    }

    return new MessageEmbed()
      .setTitle('Results')
      .setColor('GREEN')
      .setDescription(`*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`)
      .addField('Output', `\`\`\`javascript\n${inspected}\n\`\`\``);
  }
}
