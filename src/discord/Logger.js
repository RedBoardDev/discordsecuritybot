import { getConfigValue } from "../config.js";

export class Logger {
  constructor(client, logChannelId) {
    this.client = client;
    this.logChannelId = logChannelId;
  }

  async warning(message, reason) {
    try {
      const embed = {
        title: `[WARNING]`,
        fields: [
          {
            name: 'User',
            value: `<@${message.author.id}>`,
            inline: true
          },
          {
            name: 'Reason',
            value: reason,
            inline: true
          },
          {
            name: 'Channel',
            value: message.channel.toString(),
            inline: false,
          },
          {
            name: 'Message',
            value: message.content.length > 1024 ? message.content.slice(0, 1021) + '...' : message.content
          }
        ],
        color: 0x3498DB,
        timestamp: new Date()
      };

      const channel = await this.client.channels.fetch(this.logChannelId);
      await channel.send({ embeds: [embed] });

      console.log(`Warn embed sent to ${channel.name}.`);
    } catch (error) {
      console.error('Failed to send the warn embed:', error);
    }
  }

  async bann(message, reason) {
    try {
      const embed = {
        title: `[BAN]`,
        fields: [
          {
            name: 'User',
            value: `<@${message.author.id}>`,
            inline: true
          },
          {
            name: 'Reason',
            value: reason,
            inline: true
          },
          {
            name: 'Channel',
            value: message.channel.toString(),
            inline: false,
          },
          {
            name: 'Message',
            value: message.content.length > 1024 ? message.content.slice(0, 1021) + '...' : message.content
          }
        ],
        color: 0x3498DB,
        timestamp: new Date()
      };

      const channel = await this.client.channels.fetch(this.logChannelId);
      await channel.send({ embeds: [embed] });

      console.log(`Ban embed sent to ${channel.name}.`);
    } catch (error) {
      console.error('Failed to send the ban embed:', error);
    }
  }

  async info(messageContent) {
    try {
      const embed = {
        description: messageContent,
        color: 3447003
      };

      const channel = await this.client.channels.fetch(this.logChannelId);
      await channel.send({ embeds: [embed] });
      console.log(`Info embed sent to ${channel.name}.`);
    } catch (error) {
      console.error('Failed to send the info embed:', error);
    }
  }
}
