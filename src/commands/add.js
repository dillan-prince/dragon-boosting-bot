import { User } from '../database/dbConnection.js';
import { writeToAddRemoveSheet } from '../services/googleSheetsService.js';
import { hasPermission } from '../services/permissionsService.js';
import { getServerUsername } from '../services/utilities.js';

export const validateArguments = (args) => {
    if (args.length < 2) {
        throw new Error('Expected at least two arguments.');
    }

    const [mentionedUsername, goldAmount, ...rest] = args;
    const validatedArguments = { rest };

    if (
        !mentionedUsername.startsWith('<@') ||
        !mentionedUsername.endsWith('>')
    ) {
        throw new Error(
            `Expected user name in the format @Username; received "${mentionedUsername}"`
        );
    } else {
        let userId = mentionedUsername.slice(2, -1);

        if (userId.startsWith('!')) {
            userId = userId.slice(1);
        }

        validatedArguments.userId = userId;
    }

    const goldAmountInt = parseInt(goldAmount);
    if (!goldAmountInt) {
        throw new Error(
            `Expected an integer for the gold amount; received "${goldAmount}"`
        );
    } else if (goldAmountInt < 0) {
        throw new Error(
            `Expected a positive value for the gold amount. Use $remove to decrease a user's balance.`
        );
    } else {
        validatedArguments.goldAmount = goldAmountInt;
    }

    validatedArguments.reason = rest.join(' ');

    return validatedArguments;
};

/**
 *  Command: $add
 *  Arguments:
 *      [Recipient Name]
 *      [Gold Amount in Thousands]
 */
export const addCommand = async (message, args) => {
    try {
        if (!hasPermission(message, ['Gold Dragon', 'Chromatic Dragon'])) {
            return message.reply('you are not allowed to use this command.');
        }

        const { userId, goldAmount, reason } = validateArguments(args);

        let user = await User.findOne({
            where: { userId }
        });

        if (!user) {
            user = await User.create({
                userId,
                balance: goldAmount
            });
        } else {
            user.balance += goldAmount;
            await user.save();
        }

        message.mentions.users
            .get(userId)
            .send(
                `${
                    message.author.username
                } added ${goldAmount}K to your balance. New balance is ${
                    user.balance
                }K. Reason: ${reason || 'No reason given.'}`
            );

        const authorName = getServerUsername(message, message.author.id);
        const mentionName = getServerUsername(message, userId);

        writeToAddRemoveSheet([authorName, mentionName, goldAmount, reason]);

        message.delete();
    } catch (error) {
        message.channel.send(error.toString());
    }
};
