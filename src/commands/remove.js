import { User } from '../database/dbConnection.js';
import { writeToGoogleSheet } from '../services/googleSheetsService.js';

export const validateArguments = (args) => {
    if (args.length < 2) {
        throw new Error('Expected at least two arguments.');
    }

    const [mentionedUsername, goldAmount, ...rest] = args;
    const validatedArguments = {};

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
 *  Command: $remove
 *  Arguments:
 *      [Recipient Name]
 *      [Gold Amount in Thousands]
 */
export const removeCommand = async (message, args) => {
    const { userId: mentionId, goldAmount, reason } = validateArguments(args);

    const user = await User.findOne({
        where: { userId: mentionId }
    });

    if (!user) {
        throw new Error(`Not currently tracking a balance for <@${mentionId}>`);
    } else if (user.balance < goldAmount) {
        throw new Error(
            `<@${mentionId}> has a balance of ${user.balance}. Negative balances are not supported.`
        );
    }

    user.balance -= goldAmount;
    await user.save();

    message.channel.send(
        `Removed ${goldAmount}K from <@${mentionId}>'s balance. New balance is ${user.balance}K.`
    );

    const authorName = message.author.username;
    const mentionName = message.mentions.users.get(mentionId).username;

    writeToGoogleSheet({
        user: authorName,
        recipient: mentionName,
        amount: -goldAmount,
        reason
    });
};
