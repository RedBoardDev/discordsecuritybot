import fs from 'fs';
import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] })
dotenv.config();

const getConfigValue = (key) => {
    try {
        const configData = fs.readFileSync('config.json', 'utf8');
        const config = JSON.parse(configData);
        const keys = key.split('.');
        let value = config;
        for (let i = 0; i < keys.length; i++) {
            value = value[keys[i]];
            if (value === undefined) {
                return null;
            }
        }
        return value;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const sendWarnEmbed = async (message, reason) => {
    try {
        const embed = {
            author: {
                name: `${message.author.username} has been warned!`,
                icon_url: message.author.displayAvatarURL({ dynamic: true })
            },
            description: `Reason: ${reason}`,
            color: 3447003
        };

        const sentMessage = await message.channel.send({ embeds: [embed] });
        setTimeout(() => {
            sentMessage.delete().catch(console.error);
        }, getConfigValue('delete_message.embed_show_time'));

        console.log(`Warn embed sent to ${message.channel.name}.`);
    } catch (error) {
        console.error('Failed to send the warn embed:', error);
    }
};

const deleteMessage = async (message, reason, warn = true) => {
    if (warn && getConfigValue('delete_message.show_warning_embed') === true) sendWarnEmbed(message, reason);
    try {
        await message.delete();
        console.log(`Message from ${message.author.username} deleted.`);
    } catch (error) {
        console.error('Failed to delete the message:', error);
    }
};

const hasLinks = (str) => {
    const string = str.toLowerCase();
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
    const matches = string.match(urlRegex);
    return matches || null;
}

const hasHiddenLinks = (str) => {
    const string = str.toLowerCase();
    const urlRegex = /\[.*?\]\(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)\)/gi;
    const matches = string.match(urlRegex);
    return matches || null;
}

const getGuild = () => client.guilds.cache.get(getConfigValue('server_id'));

async function banUser(userId, reason) {
    const guild = getGuild();
    const member = await guild.members.fetch(userId);
    if (!member) {
        console.error(`User with ID ${userId} not found in guild ${guild.name}.`);
        return;
    }
    try {
        await member.ban({ reason });
        console.log(`Banned user ${member.user.tag} from guild ${guild.name}.`);
    } catch (error) {
        console.error(`Failed to ban user ${member.user.tag} from guild ${guild.name}:`, error);
    }
}

async function getUserRoles(userId) {
    const guild = getGuild();
    const member = await guild.members.fetch(userId);
    if (!member) {
        console.error(`User with ID ${userId} not found in guild ${guild.name}.`);
        return null;
    }
    const roles = member.roles.cache.map(role => role.id);
    return roles;
}


async function hasSpentTimeOnServer(userId, days) {
    const guild = getGuild();
    const member = await guild.members.fetch(userId);
    if (!member) {
      console.error(`User with ID ${userId} not found in guild ${guild.name}.`);
      return true;
    }
    const now = new Date();
    const joinedAt = member.joinedAt;
    const timeSpent = now - joinedAt;
    const daysSpent = timeSpent / (1000 * 60 * 60 * 24);
    return daysSpent >= days;
}

const checkForbiddenLinks = (message, links, authorId) => {
    const forbiddenLinks = getConfigValue('forbidden_url.list');
    const urlsWithoutProtocol = links.map((url) => url.replace(/(?:https?:\/\/)?(?:www\.)?([^\s/]+).*/, '$1'));
    const isForbidden = urlsWithoutProtocol.some((url) => {
        const cleanedUrl = url.replace(/\/$/, '');
        return forbiddenLinks.includes(cleanedUrl);
    });
    if (!isForbidden) return false;
    if (getConfigValue('forbidden_url.ban_user')) banUser(authorId, 'A message containing a forbidden link was sent.');
    if (getConfigValue('forbidden_url.delete_message')) deleteMessage(message, 'Forbidden links are not allowed.', false);
    return true;
}

const checkLinksPermissions = async (message, author) => {
    const roles = await getUserRoles(author.id);
    const allowedRoleId = getConfigValue('link_permission.allowed_role_id');
    const timeSpend = getConfigValue('link_permission.time_spend');

    if (!roles) return false;
    if (allowedRoleId && roles && roles.includes(allowedRoleId)) return false;
    if (timeSpend && await hasSpentTimeOnServer(author.id, timeSpend)) return false;
    if (getConfigValue('hidden_url.delete_message')) deleteMessage(message, 'Links are not allowed for you.');
    return true;
};

const checkHiddenLinks = (message, content) => {
    const hiddenLinks = hasHiddenLinks(content);
    if (!hiddenLinks) return false;
    if (getConfigValue('hidden_url.delete_message')) deleteMessage(message, 'Hidden links are not allowed.');
    return true;
};

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

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));
client.on('messageCreate', message => onMessage(message));
client.on('messageUpdate', (_, newMessage) => onMessage(newMessage));
client.login(token);
