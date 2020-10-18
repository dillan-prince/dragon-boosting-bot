import { User } from '../database/dbConnection.js';
import { hasPermission } from '../services/permissionsService.js';

export const validateArguments = (args) => {
    if (args.length > 1) {
        throw new Error('Expected at most 1 argument.');
    }

    const [mentionedUsername] = args;

    if (!mentionedUsername) {
        return mentionedUsername;
    }

    if (
        !mentionedUsername.startsWith('<@') ||
        !mentionedUsername.endsWith('>')
    ) {
        throw new Error(
            `Expected user name in the format @Username; received "${mentionedUsername}"`
        );
    }

    let userId = mentionedUsername.slice(2, -1);

    if (userId.startsWith('!')) {
        userId = userId.slice(1);
    }

    return userId;
};

/**
 *  Command: $balance
 *  Arguments:
 *      [User Name] - Optional
 */
export const balanceCommand = async (message, args) => {
    try {
        let userId = validateArguments(args);

        if (!userId) {
            userId = message.author.id;
        } else if (
            !hasPermission(message, ['Chromatic Dragon', 'Gold Dragon'])
        ) {
            return message.reply(
                'you may only use the `$balance` command without any arguments.'
            );
        }

        const user = await User.findOne({
            where: { userId }
        });

        if (!user) {
            throw new Error(
                `Not currently tracking a balance for <@${userId}>`
            );
        }

        message.author.send(`<@${userId}>'s balance is ${user.balance}K.`);
    } catch (error) {
        message.channel.send(error.toString());
    }
};
