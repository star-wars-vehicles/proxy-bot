import { CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';

import { ProxyCommand, ProxyClient, Question, Form } from '@/structures';
import { registered } from '@/util/checks';
import { UserModel, CommissionModel } from '@/models';
import { NotifyEmbed, ErrorEmbed } from '@/util';

export default class CommissionCommand extends ProxyCommand {
  public questions: Question[] = [
    new Question({
      text: 'Do you own a community, if so what is its name? If not, enter \'no\'.',
      validator: (m: Message): boolean => m.content.length >= 2,
    }),
    new Question({
      text: 'What are the details of your commission?',
      validator: (m: Message): boolean => m.content.length >= 100 && m.content.length <= 1000,
    }),
    new Question({
      text: 'We require you to have references, please enter them as a comma separated list (link.com, link2.com)',
    }),
    new Question({
      text: 'If you would prefer a particular develop, please enter their Discord ID, otherwise enter \'no\'',
      validator: async (m: Message): Promise<boolean> => {
        return !!(await UserModel.findOne({discord: m.content}).exec());
      },
    }),
  ];

  constructor(client: ProxyClient) {
    super(client, {
      name: 'commission',
      aliases: ['job'],
      group: 'developer',
      memberName: 'commission',
      description: 'Post a commission for developers.',
      clientPermissions: ['EMBED_LINKS'],
      throttling: {
        usages: 1,
        duration: 86400,
      },
    });
  }

  @registered
  public async run(message: CommandoMessage): Promise<Message | Message[]> {
    const form = new Form()
      .setChannel(message.channel)
      .setUser(message.author)
      .setQuestions(this.questions);

    const { answers, status, done } = await form.build();

    if (!done && status !== 'cancel') {
      return message.channel.send({
        embed: ErrorEmbed('Cannot submit an incomplete commission!')
          .addField('Reason', status === 'cancel' ? 'Form cancelled.' : 'Form timed out!'),
      });
    }

    const author = await UserModel.findOne({ discord: message.author.id }).exec();

    const commission = new CommissionModel({ author });

    if (answers[0].content.toLowerCase() !== 'no') {
      commission.community = answers[0].content;
    }

    commission.details = answers[1].content;
    commission.references = answers[2].content.split(',');

    if (!isNaN(parseInt(answers[3].content, 10))) {
      const dev = await UserModel.findOne({ discord: answers[3].content }).exec();

      if (!dev) {
        return message.channel.send({ embed: ErrorEmbed('Failed to find the requested developer!') });
      }

      commission.requestedDev = dev;
    }

    await commission.save();

    return message.channel.send({
      embed: NotifyEmbed('Success', 'You have submitted a new commission!', 'GREEN')
        .addField('Author', author!.discord)
        .addField('Steam ID', author!.steam)
        .addField('Details', answers[0]),
    });
  }
}
