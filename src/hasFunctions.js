import { getGuild } from "./discord/utils.js";

export const hasLinks = (str) => {
  const string = str.toLowerCase();
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g;
  const matches = string.match(urlRegex);
  return matches || null;
};

export const hasHiddenLinks = (str) => {
  const string = str.toLowerCase();
  const urlRegex = /\[.*?\]\(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)\)/gi;
  const matches = string.match(urlRegex);
  return matches || null;
};

export async function hasSpentTimeOnServer(userId, days) {
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
};
