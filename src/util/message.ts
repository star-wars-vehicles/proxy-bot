import { ColorResolvable, MessageEmbed } from 'discord.js';

export function shorten(str: string, max: number = 2000): string {
  return str.length > max ? `${str.substr(0, max - 3)}...` : str;
}

export function NotifyEmbed(title: string, message: string = '', color: ColorResolvable = 'DARK_RED'): MessageEmbed {
  return new MessageEmbed()
    .setTitle(shorten(title))
    .setColor(color)
    .setDescription(shorten(message));
}

export const ErrorEmbed = NotifyEmbed.bind(null, 'ERROR');

export function number(value: string | number) {
  return Number.parseFloat(value.toString()).toLocaleString(undefined, { maximumFractionDigits: 2});
}
