import { CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';

import { ProxyCommand, ProxyClient } from '@/structures';
import { UserModel } from '@/models';
import { ErrorEmbed, NotifyEmbed } from '@/util';

export default class RegisterCommand extends ProxyCommand {
  constructor(client: ProxyClient) {
    super(client, {
      name: 'register',
      group: 'general',
      memberName: 'register',
      description: 'Register your Discord with the bot.',
      args: [
        {
          key: 'steam',
          prompt: 'What is your SteamID64?',
          type: 'integer',
        },
      ],
    });
  }

  public async run(message: CommandoMessage, args: { steam: number }): Promise<Message | Message[]> {
    if (await UserModel.findOne({ discord: message.author.id }).exec()) {
      return message.channel.send({ embed: ErrorEmbed('You are already registered!') });
    }

    const user = new UserModel({ discord: message.author.id, steam: args.steam });
    await user.save();

    const embed = NotifyEmbed('Success', 'You have registered your account!', 'GREEN')
      .addField('Discord ID', user.discord)
      .addField('Steam ID', user.steam);

    return message.channel.send({ embed });
  }
}
