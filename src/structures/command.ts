// tslint:disable:ban-types
// tslint:disable:interface-name

import { Command } from 'discord.js-commando';

import { ProxyClient } from '@/structures';
import { PermissionResolvable, BitFieldResolvable, PermissionString } from 'discord.js';

interface ThrottlingOptions {
  usages: number;
  duration: number;
}

interface ArgumentInfo {
  key: string;
  label?: string;
  prompt: string;
  error?: string;
  type?: string;
  max?: number;
  min?: number;
  oneOf?: any[];
  default?: any | Function;
  infinite?: boolean;
  validate?: Function;
  parse?: Function;
  isEmpty?: Function;
  wait?: number;
}

interface CommandInfo {
  name: string;
  aliases?: string[];
  autoAliases?: boolean;
  group: string;
  memberName: string;
  description: string;
  format?: string;
  details?: string;
  examples?: string[];
  nsfw?: boolean;
  guildOnly?: boolean;
  ownerOnly?: boolean;
  clientPermissions?: PermissionResolvable[];
  userPermissions?: PermissionResolvable[];
  defaultHandling?: boolean;
  throttling?: ThrottlingOptions;
  args?: ArgumentInfo[];
  argsPromptLimit?: number;
  argsType?: string;
  argsCount?: number;
  argsSingleQuotes?: boolean;
  patterns?: RegExp[];
  guarded?: boolean;
  hidden?: boolean;
  unknown?: boolean;
}

export interface ProxyCommandConfiguration { [key: string]: string | object; }

// tslint:disable-next-line:no-empty-interface
export interface ProxyCommandInfo extends CommandInfo {

}

const defaultPermissions: Array<BitFieldResolvable<PermissionString>> = ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'];

export class ProxyCommand extends Command {
  public config: ProxyCommandConfiguration = {};
  public client: ProxyClient;

  constructor(client: ProxyClient, info: ProxyCommandInfo) {
    super(client, {
      ...info,
      ...{
        clientPermissions: [...defaultPermissions, ...info.clientPermissions || []],
      },
    });

    this.config = client.config.commands[info.name] || {} as ProxyCommandConfiguration;
  }
}
