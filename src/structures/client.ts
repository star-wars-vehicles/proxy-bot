import { CommandoClient } from 'discord.js-commando';
import { ProxyCommandConfiguration } from './command';

import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import { ClientOptions } from 'discord.js';

type CommandoClientOptions = {
  commandPrefix?: string;
  commandEditableDuration?: number;
  nonCommandEditable?: boolean;
  owner?: string | string[] | Set<string>;
  invite?: string;
} & ClientOptions;

// tslint:disable-next-line:interface-name
export interface ProxyClientConfiguration {
  token: string;
  groups: string[][];
  settings: { [key: string]: any };
  commands: { [key: string]: ProxyCommandConfiguration };
}

// tslint:disable-next-line:interface-name
export interface ProxyClientOptions extends CommandoClientOptions {
  config: ProxyClientConfiguration;
}

export class ProxyClient extends CommandoClient {
  public config: ProxyClientConfiguration = {} as ProxyClientConfiguration;
  public db: mongoose.Connection;
  public mongoose: mongoose.Mongoose;

  constructor(options: ProxyClientOptions) {
    super(options);

    const password = encodeURIComponent(options.config.settings.database.password);

    const MONGO_URI = `mongodb+srv://proxy:${password}@proxy-kph3v.gcp.mongodb.net/test?retryWrites=true`;

    mongoose.connect(
      MONGO_URI,
      { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true },
      (err: MongoError) => {
        if (err) {
          throw new Error('Unable to connect to database!');
        } else {
          console.log('Database is ready.');
        }
      },
    );

    this.mongoose = mongoose;
    this.db = mongoose.connection;
    this.config = options.config || {};
  }
}
