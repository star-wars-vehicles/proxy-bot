import { prop, plugin, Typegoose, Ref, InstanceType } from 'typegoose';
import { User } from './User';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

@plugin(require('mongoose-autopopulate'))
@plugin(require('mongoose-findorcreate'))
export class Commission extends Typegoose {
    // tslint:disable-next-line:max-line-length
    public static findOrCreate: (condition: Partial<Omit<Commission, keyof Typegoose>>, doc: Omit<Commission, keyof Typegoose>, options?: { upsert?: boolean }) =>
        Promise<{ doc: InstanceType<Commission>, created: boolean }>;

    @prop({ ref: User, required: true })
    public author: Ref<User>;

    @prop({ ref: User })
    public developer?: Ref<User>;

    @prop({ ref: User })
    public requestedDev?: Ref<User>;

    @prop({ default: false })
    public assigned?: boolean;

    @prop({ default: false })
    public completed?: boolean;

    @prop()
    public community?: string;

    @prop({ required: true })
    public details: string;

    @prop({ required: true })
    public references: string[];
}

export const CommissionModel = new Commission().getModelForClass(Commission);
