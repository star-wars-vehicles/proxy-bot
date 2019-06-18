import {
  MessageCollector, TextChannel, DMChannel,
  CollectorFilter, Message, Collection, User, ReactionCollector, MessageReaction, MessageEmbed,
} from 'discord.js';

import { Question, QuestionOptions, ReactionQuestion, ReactionQuestionOptions } from './question';

export interface FormOptions {
  questions?: Question[];
  channel?: TextChannel | DMChannel;
  collector?: MessageCollector;

  timeout?: number;

  filter?: CollectorFilter;
}

export interface FormResults {
  answers: Message[];
  status: 'done' | 'cancel' | 'timeout';
}

export interface ReactionFormResults {
  answers: MessageReaction[];
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

  public filter: CollectorFilter = (...args: any[]): boolean => true;

  public setQuestions(questions: Array<Question|QuestionOptions>): this {
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

  public setChannel(channel: TextChannel | DMChannel): this {
    this.channel = channel;

    return this;
  }

  public setFilter(filter: CollectorFilter): this {
    this.filter = filter;

    return this;
  }

  /**
   * Shortcut for filtering by user(s)
   * @param user Discord user that the form belongs to.
   */
  public setUser(user: User | User[]): this {
    if (Array.isArray(user)) {
      return this.setFilter((message): boolean => user.some((u) => message.author != null && message.author.id === u.id));
    }
  
    return this.setFilter((message): boolean => message.author != null && message.author.id === user.id);
  }

  public setCollector(collector: MessageCollector): this {
    this.collector = collector;

    return this;
  }

  public addQuestion(question: Question|QuestionOptions): this {
    if (question instanceof Question) {
      this.questions.push(question);
    } else {
      this.questions.push(new Question(question));
    }

    return this;
  }

  public async build(): Promise<FormResults> {
    // if (this.collector === undefined && this.channel !== undefined) {
    //   const options = { time: this.timeout * this.questions.length * 1000, max: 5 * this.questions.length };
    //   this.collector = this.channel.createMessageCollector(this.filter, options);
    // }

    // if (this.collector === undefined || this.channel === undefined || this.questions.length === 0) {
    //   throw new Error('Unable to build form with invalid data! (Could not create collector or the form was empty)');
    // }

    const answers: Message[] = [];
    const questions: Question[] = this.questions.reverse();

    for (let question; question = questions.pop();) {
      if (!question) continue;

      await this.channel.send(question.text);

      try {
        const messages = await this.channel.awaitMessages(this.filter, { time: this.timeout * this.questions.length * 1000, max: 1, errors: ['time'] });

        const message = messages.first();

        if (message && message.content.trim().toLowerCase() === 'cancel') {
          return { answers, status: 'cancel' };
        }

        if (!message || !question.validator(message)) {
          await this.channel.send('Invalid response! Please try again.');
          questions.push(question);
        } else {
          answers.push(message);
        }
      } catch {
        return { answers, status: 'timeout'};
      }
    }

    return { answers, status: 'done' };

    // let question: Question | undefined = questions.pop();

    // if (!question) throw new Error('Tried to continue form with missing question!');

    // this.channel.send(question.text);

    // this.collector.on('collect', async (message: Message) => {
    //   if (!question) throw new Error('Tried to continue form with missing question!');

    //   if (message.content.trim().toLowerCase() === 'cancel') {
    //     this.collector.stop('cancelled');
    //   } else if (await question.validator(message)) {
    //     this.results.push(message);

    //     question = questions.pop();

    //     if (!question) {
    //       this.collector.stop('finished');
    //     } else {
    //       this.channel.send(question.text);
    //     }
    //   } else {
    //     this.channel.send('Invalid response! Please try again.');
    //   }
    // });

    // this.collector.once('end', (collected: Collection<string, Message>, reason: string) => {
    //   if (reason === 'cancelled') {
    //     resolve({ answers: this.results, status: 'cancel', done: false });
    //   } else if (questions.length > 0 || this.results.length === 0) {
    //     resolve({ answers: this.results, status: 'timeout', done: false });
    //   } else {
    //     resolve({ answers: this.results, status: 'done', done: true });
    //   }
    // });
  }
}

export interface ReactionFormOptions {
  questions?: ReactionQuestion[];
  message?: Message;
  collector?: ReactionCollector;

  timeout?: number;

  filter?: CollectorFilter;
}

export class ReactionForm {
  public questions: ReactionQuestion[] = [];
  public message: Message;
  public collector: ReactionCollector;
  public timeout: number = 120;
  public results: MessageReaction[] = [];

  constructor(options?: ReactionFormOptions) {
    if (!options) {
      return;
    }

    this.questions = options.questions || this.questions;
    this.message = options.message || this.message;
    this.collector = options.collector || this.collector;
    this.timeout = options.timeout || this.timeout;
    this.filter = options.filter || this.filter;
  }

  public filter: CollectorFilter = (...args: any[]): boolean => true;

  public setQuestions(questions: Array<ReactionQuestion|ReactionQuestionOptions>): this {
    if (!Array.isArray(questions)) {
      throw new Error('Cannot set form questions to a value that is not an array! Use addQuestion instead!');
    }

    this.questions = questions.map((question): ReactionQuestion => {
      if (question instanceof ReactionQuestion) {
        return question;
      }

      return new ReactionQuestion(question);
    });

    return this;
  }

  public setMessage(message: Message): this {
    this.message = message;

    return this;
  }

  public setFilter(filter: CollectorFilter): this {
    this.filter = filter;

    return this;
  }

  /**
   * Shortcut for filtering by user(s).
   * @param user Discord user that the form is restricted to
   */
  public setUser(user: User | User[]): this {
    if (Array.isArray(user)) {
      return this.setFilter((reaction, reactor): boolean => user.some((u) => reactor != null && reactor.id === u.id));
    }
  
    return this.setFilter((reaction, reactor): boolean => reactor != null && reactor.id === user.id);
  }

  /**
   * A more readable alternative to `.setUser` for arrays.
   * @param users Array of Discord users to restrict the form to
   */
  public setUsers(users: User[]): this {
    return this.setUser(users);
  }

  public setCollector(collector: ReactionCollector): this {
    this.collector = collector;

    return this;
  }

  public addQuestion(question: ReactionQuestion|ReactionQuestionOptions): this {
    if (question instanceof ReactionQuestion) {
      this.questions.push(question);
    } else {
      this.questions.push(new ReactionQuestion(question));
    }

    return this;
  }

  public async build(): Promise<ReactionFormResults> {
    return new Promise(async (resolve) => {
      if (this.collector === undefined && this.message !== undefined) {
        const options = { time: this.timeout * this.questions.length * 1000, max: 5 * this.questions.length };
        this.collector = this.message.createReactionCollector(this.filter, options);
      }

      if (this.collector === undefined || this.message === undefined || this.questions.length === 0) {
        throw new Error('Unable to build form with invalid data! (Could not create collector or the form was empty)');
      }

      await this.message.edit(new MessageEmbed({ title: 'Building form...', color: 'YELLOW' }));

      const questions: ReactionQuestion[] = this.questions.reverse();

      let question: ReactionQuestion | undefined = questions.pop();

      if (!question) throw new Error('Tried to continue form with missing question!');

      const edit = async ({ choices, text }: ReactionQuestion) => {
        const message = await this.message.edit(new MessageEmbed({
          title: text,
          fields: choices.map((choice) => ({ name: choice.emoji.toString(), value: choice.description })),
        }));

        for (const choice of choices) {
          await message.react(choice.emoji);
        }

        return message
      }

      this.message = await edit(question);

      this.collector.on('collect', async (reaction: MessageReaction, user: User) => {
        if (!question) throw new Error('Tried to continue form with missing question!');

        if (reaction.emoji.toString().toLowerCase() === 'cancel') {
          this.collector.stop('cancelled');
        } else {
          this.results.push(reaction);

          question = questions.pop();

          if (!question) {
            this.collector.stop('finished');
          } else {
            await edit(question);
          }
        }
      });

      this.collector.once('end', (collected: Collection<string, MessageReaction>, reason: string) => {
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
