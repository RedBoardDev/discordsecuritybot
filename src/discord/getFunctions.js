import { getGuild } from "./utils.js";

export async function getUserRoles(userId) {
  const guild = getGuild();
  const member = await guild.members.fetch(userId);
  if (!member) {
    console.error(`User with ID ${userId} not found in guild ${guild.name}.`);
    return null;
  }
  const roles = member.roles.cache.map(role => role.id);
  return roles;
};