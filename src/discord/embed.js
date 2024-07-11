import { getConfigValue } from "../config.js";

export const sendWarning = async (message, reason) => {
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
