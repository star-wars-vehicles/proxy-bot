import { Message } from 'discord.js';

// tslint:disable-next-line:interface-name
export interface QuestionOptions {
  text?: string;
  validator?: (message: Message) => Promise<boolean> | boolean;
}

export class Question {
  public text: string = '';

  constructor(options?: QuestionOptions) {
    if (!options) {
      return;
    }

    this.text = options.text || this.text;
    this.validator = options.validator || this.validator;
  }

  public validator: (message: Message) => Promise<boolean> | boolean = () => true;

  public setText(text: string): Question {
    this.text = text;

    return this;
  }

  public setValidator(validator: (message: Message) => boolean): Question {
    this.validator = validator;

    return this;
  }
}
