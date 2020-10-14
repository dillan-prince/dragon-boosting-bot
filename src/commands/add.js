export const verifyArguments = (args) => {
    if (args.length !== 2) {
        throw new Error('Expected two arguments.');
    }

    const [customerName, goldAmount] = args;

    if (!parseInt(goldAmount)) {
        throw new Error(
            `Expected an integer for the gold amount; received "${goldAmount}"`
        );
    }

    return { customerName, goldAmount };
};

/**
 *  Command: $add
 *  Arguments:
 *      [Recipient Name]
 *      [Gold Amount in Thousands]
 */
export const addCommand = (message, args) => {
    try {
        const { customerName, goldAmount } = verifyArguments(args);

        message.channel.send(
            `Added ${goldAmount}K to ${customerName}'s balance.`
        );
    } catch (error) {
        message.channel.send(error.toString());
    }
};
