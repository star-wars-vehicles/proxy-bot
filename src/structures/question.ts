import { Message, MessageReaction, User, Emoji, EmojiResolvable } from 'discord.js';

// tslint:disable-next-line:interface-name
export interface QuestionOptions {
  text?: string;
  validator?: (message: Message) => Promise<boolean> | boolean;
}

export class Question {
  public text: string = '';
  public validator: (message: Message) => Promise<boolean> | boolean = () => true;

  constructor(options?: QuestionOptions) {
    if (!options) {
      return;
    }

    this.text = options.text || this.text;
    this.validator = options.validator || this.validator;
  }

  public setText(text: string): this {
    this.text = text;

    return this;
  }

  public setValidator(validator: (message: Message) => boolean): Question {
    this.validator = validator;

    return this;
  }
}

export interface ReactionQuestionOptions {
  text?: string;
}

export class ReactionQuestion {
  public text: string = '';
  public choices: ReactionChoice[] = [];

  constructor(options?: ReactionQuestionOptions) {
    if (!options) {
      return;
    }

    this.text = options.text || this.text;
  }

  public setText(text: string): this {
    this.text = text;

    return this;
  }

  public setChoices(choices: ReactionChoice[]): this {
    if (Array.isArray(choices)) {
      throw new Error('Cannot set question choices to a value that is not an array! Use addChoice instead!');
    }
  
    this.choices = choices;

    return this;
  }

  public addChoice(choice: ReactionChoice): this {
    this.choices.push(choice);

    return this;
  }
}

export class ReactionChoice {
  public constructor(public emoji: EmojiResolvable, public description: string) {

  }

  public setDescription(description: string): this {
    this.description= description;

    return this;
  }

  public setEmoji(emoji: EmojiResolvable): this {
    this.emoji = emoji;

    return this;
  }
}
