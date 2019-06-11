import { prop, plugin, Typegoose, InstanceType } from 'typegoose';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

@plugin(require('mongoose-findorcreate'))
export class User extends Typegoose {
  public static findOrCreate: (condition: Partial<Omit<User, keyof Typegoose>>, doc: Omit<User, keyof Typegoose>) =>
    Promise<{ doc: InstanceType<User>, created: boolean }>;

  @prop({ unique: true })
  public discord: string;

  @prop({ unique: true })
  public steam: string;
}

export const UserModel = new User().getModelForClass(User);
