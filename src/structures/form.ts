import {
  MessageCollector, TextChannel, DMChannel,
  CollectorFilter, Message, Collection, User,
} from 'discord.js';

import { Question, QuestionOptions } from './question';

// tslint:disable-next-line:interface-name
export interface FormOptions {
  questions?: Question[];
  channel?: TextChannel | DMChannel;
  collector?: MessageCollector;

  timeout?: number;

  filter?: CollectorFilter;
}

// tslint:disable-next-line:interface-name
export interface FormResults {
  answers: Message[];
  status: string;

  done: boolean;
}

export class Form {
  public questions: Question[] = [];
  public channel: TextChannel | DMChannel;
  public collector: MessageCollector;
  public timeout: number = 120;
  public results: Message[] = [];

  constructor(options?: FormOptions) {
    if (!options) {
      return;
    }

    this.questions = options.questions || this.questions;
    this.channel = options.channel || this.channel;
    this.collector = options.collector || this.collector;
    this.timeout = options.timeout || this.timeout;
    this.filter = options.filter || this.filter;
  }

  public filter: CollectorFilter = (): boolean => true;

  public setQuestions(questions: Array<Question|QuestionOptions>): Form {
    if (!(questions instanceof Array) || !Boolean(questions.length)) {
      throw new Error('Cannot set form questions to a value that is not an array! Use addQuestion instead!');
    }

    this.questions = questions.map((question: Question|QuestionOptions): Question => {
      if (question instanceof Question) {
        return question;
      }

      return new Question(question);
    });

    return this;
  }

  public setChannel(channel: TextChannel | DMChannel): Form {
    this.channel = channel;

    return this;
  }

  public setFilter(filter: CollectorFilter): Form {
    this.filter = filter;

    return this;
  }

  public setUser(user: User): Form {
    return this.setFilter((message: Message): boolean => message.author != null && message.author.id === user.id);
  }

  public setCollector(collector: MessageCollector): Form {
    this.collector = collector;

    return this;
  }

  public addQuestion(question: Question|QuestionOptions): Form {
    if (question instanceof Question) {
      this.questions.push(question);
    } else {
      this.questions.push(new Question(question));
    }

    return this;
  }

  public build(): Promise<FormResults> {
    return new Promise((resolve) => {
      if (this.collector === undefined && this.channel !== undefined) {
        const options = { time: this.timeout * this.questions.length * 1000, max: 5 * this.questions.length };
        this.collector = this.channel.createMessageCollector(this.filter, options);
      }

      if (this.collector === undefined || this.channel === undefined || this.questions.length === 0) {
        throw new Error('Unable to build form with invalid data! (Could not create collector or the form was empty)');
      }

      const questions: Question[] = this.questions.reverse();

      let question: Question = questions.pop()!;

      this.channel.send(question.text);

      this.collector.on('collect', async (element: Message) => {
        if (element.content.trim().toLowerCase() === 'cancel') {
          this.collector.stop('cancelled');
        } else if (await question!.validator(element)) {
          this.results.push(element);

          if (questions.length > 0) {
            question = questions.pop()!;
          } else {
            question = undefined!;
          }

          if (question === undefined) {
            this.collector.stop('finished');
          } else {
            this.channel.send(question.text);
          }
        } else {
          this.channel.send('Invalid response! Please try again.');
        }
      });

      this.collector.once('end', (collected: Collection<string, Message>, reason: string) => {
        if (reason === 'cancelled') {
          resolve({ answers: this.results, status: 'cancel', done: false });
        } else if (questions.length > 0 || this.results.length === 0) {
          resolve({ answers: this.results, status: 'timeout', done: false });
        } else {
          resolve({ answers: this.results, status: 'done', done: true });
        }
      });
    });
  }
}
