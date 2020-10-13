export const verifyArguments = (args) => {
    if (args.length < 6) {
        return 'Expected at least 6 arguments.';
    }

    const [customerName, goldAmount, realm, runType, boosterNames] = args;
    return `${customerName}, ${goldAmount}, ${realm}, ${runType}, ${boosterNames}`;
};

export const addrunCommand = (channel, rawArgs) => {
    const args = verifyArguments(rawArgs);
    channel.send(args);
};
