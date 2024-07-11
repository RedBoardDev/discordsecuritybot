import { hasHiddenLinks, hasSpentTimeOnServer } from './hasFunctions.js';
import { getUserRoles } from './discord/getFunctions.js';
import { getConfigValue } from './config.js';
import { banUser, deleteMessage } from './discord/actions.js';

export const checkForbiddenLinks = (message, links, authorId) => {
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
};

export const checkLinksPermissions = async (message, author) => {
  const roles = await getUserRoles(author.id);
  const allowedRoleId = getConfigValue('link_permission.allowed_role_id');
  const timeSpend = getConfigValue('link_permission.time_spend');

  if (!roles) return false;
  if (allowedRoleId && roles && roles.includes(allowedRoleId)) return false;
  if (timeSpend && await hasSpentTimeOnServer(author.id, timeSpend)) return false;
  if (getConfigValue('hidden_url.delete_message')) deleteMessage(message, 'Links are not allowed for you.');
  return true;
};

export const checkHiddenLinks = (message, content) => {
  const hiddenLinks = hasHiddenLinks(content);
  if (!hiddenLinks) return false;
  if (getConfigValue('hidden_url.delete_message')) deleteMessage(message, 'Hidden links are not allowed.');
  return true;
};
