import { Command, CommandInfo } from 'discord.js-commando';

import { ProxyClient } from '@/structures';

// tslint:disable-next-line:interface-name
interface ProxyCommandConfiguration { [key: string]: string | object; }

// tslint:disable-next-line:interface-name
interface ProxyCommandInfo extends CommandInfo {
  clientPermissions?: string[];
}

class ProxyCommand extends Command {
  public config: ProxyCommandConfiguration = {};

  constructor(client: ProxyClient, info: ProxyCommandInfo) {
    super(client, info);

    this.config = client.config.commands[info.name] || {} as ProxyCommandConfiguration;
  }
}

export { ProxyCommand, ProxyCommandInfo, ProxyCommandConfiguration };
