import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { getConfigValue } from './config.js';
import { hasLinks } from './hasFunctions.js';
import { checkForbiddenLinks, checkHiddenLinks, checkLinksPermissions } from './checkLinks.js';

export const discordInstance = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
dotenv.config();

const parseMessage = (message, content, author) => {
    const links = hasLinks(content);
    if (links) {
        if (checkForbiddenLinks(message, links, author.id)) return;
        if (checkLinksPermissions(message, author)) return;
        if (checkHiddenLinks(message, content)) return;
    }
};

const onMessage = async (message) => {
    const content = message.content;
    const author = message.author;
    const authorConfig = getConfigValue('author');

    if (authorConfig.bot && author.bot) return;
    if (authorConfig.system && author.system) return;
    parseMessage(message, content, author);
};

discordInstance.on('ready', () => console.log(`Logged in as ${discordInstance.user.tag}!`));
discordInstance.on('messageCreate', message => onMessage(message));
discordInstance.on('messageUpdate', (_, newMessage) => onMessage(newMessage));
discordInstance.login(process.env.DISCORD_BOT_TOKEN);