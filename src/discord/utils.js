import { getConfigValue } from "../config.js";
import { discordInstance } from "../index.js";

export const getGuild = () => discordInstance.guilds.cache.get(getConfigValue('server_id'));
