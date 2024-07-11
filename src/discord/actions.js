import { getGuild } from './utils.js';
import { sendWarning } from './embed.js';
import { getConfigValue } from '../config.js';

export const deleteMessage = async (message, reason, warn = true) => {
  if (warn && getConfigValue('delete_message.show_warning_embed') === true) sendWarning(message, reason);
  try {
    await message.delete();
    console.log(`Message from ${message.author.username} deleted.`);
  } catch (error) {
    console.error('Failed to delete the message:', error);
  }
};

export async function banUser(userId, reason) {
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
};
