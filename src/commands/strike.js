import { embedColors } from '../common/constants.js';
import { hasPermission } from '../services/permissionsService.js';
import { removeCommand, validateArguments } from './remove.js';

export const strikeCommand = (message, args) => {
    if (!hasPermission(message, ['Gold Dragon', 'Chromatic Dragon'])) {
        return message.reply('you are not allowed to use this command.');
    }

    removeCommand(message, args, false);
    const { userId, goldAmount, reason } = validateArguments(args);

    message.channel.send({
        embed: {
            color: embedColors.red,
            title: '🚨 STRIKE 🚨',
            fields: [
                {
                    name: 'User',
                    value: `<@${userId}>`,
                    inline: true
                },
                {
                    name: 'Amount',
                    value: `${goldAmount}K`,
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason || 'No reason given.'
                }
            ]
        }
    });

    message.delete();
};
