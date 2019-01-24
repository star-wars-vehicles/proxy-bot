import { ColorResolvable, RichEmbed } from 'discord.js';

function shorten(str: string, max: number = 2000): string {
  return str.length > max ? `${str.substr(0, max - 3)}...` : str;
}

function notify(title: string, message: string = '', color: ColorResolvable = 'DARK_RED'): RichEmbed {
  return new RichEmbed()
    .setTitle(shorten(title))
    .setColor(color)
    .setDescription(shorten(message));
}

function number(value: string | number) {
  return Number.parseFloat(value.toString()).toLocaleString(undefined, { maximumFractionDigits: 2});
}

export { shorten, notify, number };
