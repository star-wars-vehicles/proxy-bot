import { CommandoMessage } from 'discord.js-commando';

import { ProxyCommand } from '@/structures';
import { UserModel } from '@/models';

export function customCheck(check: (message: CommandoMessage, args: object) => Promise<boolean> | boolean, reason?: string) {
    return function <T extends ProxyCommand>(target: T, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const message: CommandoMessage = args[0];
            const commandArgs = args[1];

            if (await check(message, commandArgs)) {
                return method.apply(this, args);
            }

            message.client.emit('commandBlock', message, reason || 'customCheck');
        };

        return descriptor;
    };
}

export const registered = customCheck(async (message: CommandoMessage) => {
    const author = await UserModel.findOne({ discord: message.author.id }).exec();

    return author != null;
}, 'This command requires you have registered yourself with the bot!');

export const guild = customCheck(async (message: CommandoMessage) => {
    return message.guild != undefined;
}, 'This command is restricted to use within guilds only!');
