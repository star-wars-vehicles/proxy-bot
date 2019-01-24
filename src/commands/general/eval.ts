/* tslint:disable:no-shadowed-variable */

import * as util from 'util';

import { Message, RichEmbed } from 'discord.js';
import { CommandMessage } from 'discord.js-commando';
import { ProxyCommand, ProxyClient } from '@/structures';

class EvalCommand extends ProxyCommand {
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

  public async run(message: CommandMessage, args: { script: string }): Promise<Message | Message[]> {
    const msg: CommandMessage = message;
    const client: ProxyClient = message.client as ProxyClient;
    const objects = client.registry.evalObjects;
    const lastResult = this.lastResult;

    const reply = (val: any) => {
      if (val instanceof Error) {
        message.reply(`Callback error: \`${val}\``);
      } else {
        const embed = this.generateResultEmbed(val, process.hrtime(this.hrStart));

        if (Array.isArray(embed)) {
          for (const item of embed) {
            message.reply(item);
          }
        } else {
          message.channel.send({ embed });
        }
      }
    };

    let hrDiff;
    try {
      const hrStart = process.hrtime();

      // tslint:disable-next-line
      this.lastResult = eval(args.script);

      hrDiff = process.hrtime(hrStart);
    } catch (error) {
      const embed = new RichEmbed()
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

  private generateResultEmbed(result: any, hrDiff: [number, number], input: string | null = null): RichEmbed {
    const inspected = util.inspect(result, { depth: 0 }).replace(this.sensitivePattern, '--snip--');

    if (input) {
      return new RichEmbed()
        .setTitle('Results')
        .setColor('GREEN')
        .setDescription(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`)
        .addField('Input', `\`\`\`javascript\n${input}\n\`\`\``)
        .addField('Output', `\`\`\`javascript\n${inspected}\n\`\`\``);
    }

    return new RichEmbed()
      .setTitle('Results')
      .setColor('GREEN')
      .setDescription(`*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*`)
      .addField('Output', `\`\`\`javascript\n${inspected}\n\`\`\``);
  }
}

export default EvalCommand;
