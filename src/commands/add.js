import { User } from '../database/dbConnection.js';

export const validateArguments = (args) => {
    if (args.length !== 2) {
        throw new Error('Expected two arguments.');
    }

    const [mentionedUsername, goldAmount] = args;
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
        const { userId, goldAmount } = validateArguments(args);

        const user = await User.findOne({
            where: { userId }
        });

        if (!user) {
            await User.create({
                userId,
                balance: goldAmount
            });
        } else {
            user.balance += goldAmount;
            await user.save();
        }

        message.channel.send(`Added ${goldAmount}K to <@${userId}>'s balance.`);
    } catch (error) {
        message.reply(error.toString());
    }
};
