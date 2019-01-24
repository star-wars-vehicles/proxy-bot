import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import { ProxyCommandConfiguration } from './command';

// tslint:disable-next-line:interface-name
interface ProxyClientConfiguration {
  token: string;
  groups: string[][];
  settings: { [key: string]: string };
  commands: { [key: string]: ProxyCommandConfiguration };
}

// tslint:disable-next-line:interface-name
interface ProxyClientOptions extends CommandoClientOptions {
  config: ProxyClientConfiguration;
}

class ProxyClient extends CommandoClient {
  public config: ProxyClientConfiguration = {} as ProxyClientConfiguration;

  constructor(options: ProxyClientOptions) {
    super(options);

    this.config = options.config || {};
  }
}

export { ProxyClient, ProxyClientOptions, ProxyClientConfiguration };
