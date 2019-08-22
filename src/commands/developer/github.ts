import fetch from 'node-fetch';

import { CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';

import { ProxyClient, ProxyCommand } from '@/structures';
import { number, shorten, ErrorEmbed } from '@/util';

export default class GithubCommand extends ProxyCommand {
    constructor(client: ProxyClient) {
        super(client, {
            name: 'github',
            aliases: ['repo', 'gh'],
            group: 'developer',
            memberName: 'github',
            description: 'Responds with information on a GitHub repository.',
            clientPermissions: ['EMBED_LINKS'],
            args: [
                {
                    key: 'author',
                    prompt: 'Who is the author of the repository?',
                    type: 'string',
                },
                {
                    key: 'repository',
                    prompt: 'What is the name of the repository?',
                    type: 'string',
                },
            ],
        });

        if (!(this.config.username && this.config.password)) {
            throw new Error('Cannot setup GitHub command with missing configuration options!');
        }
    }

    public async run(message: CommandoMessage, args: { author: string, repository: string }): Promise<Message | Message[]> {
        const { author, repository } = args;

        try {
            const response = await fetch(`https://api.github.com/repos/${author}/${repository}`, {
                method: 'GET',
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`,
                },
            });

            const json = await response.json();

            const embed = new MessageEmbed()
                .setColor(0xFFFFFF)
                .setAuthor('GitHub', 'https://i.imgur.com/e4HunUm.png', 'https://github.com/')
                .setTitle(json.full_name)
                .setURL(json.html_url)
                .setDescription(json.description ? shorten(json.description) : 'No description.')
                .setThumbnail(json.owner.avatar_url)
                .addField('Stars', number(json.stargazers_count), true)
                .addField('Forks', number(json.forks))
                .addField('Issues', number(json.open_issues))
                .addField('Language', json.language || 'Unknown', true);

            return message.say({ embed });
        } catch (err) {
            if (err.status === 404) {
                return message.say({ embed: ErrorEmbed('Could not find any results from GitHub!') });
            }

            return message.say({ embed: ErrorEmbed('An error occured while trying to fetch data from GitHub.') });
        }
    }
}
