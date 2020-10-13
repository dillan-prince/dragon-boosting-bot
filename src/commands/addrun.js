export const verifyArguments = (args) => {
    if (args.length < 5) {
        return 'Expected at least 5 arguments.';
    }

    const [customerName, goldAmount, realm, runType, ...boosterNames] = args;

    if (!parseInt(goldAmount)) {
        return `Expected an integer for the gold amount; received "${goldAmount}"`;
    }

    if (!realm.includes('-')) {
        return `Expected realm in format <Realm Name>-<Faction>; received "${realm}"`;
    } else {
        const [, faction] = realm.split('-');
        if (!['a', 'h'].includes(faction.toLowerCase())) {
            return `Expected faction part of realm argument to be "A" or "H"; received "${faction}"`;
        }
    }

    if (!['m+', 'raid', 'pvp'].includes(runType.toLowerCase())) {
        return `Expected run type to be one of "M+", "Raid", or "PvP"; received "${runType}"`;
    } else {
        switch (runType.toLowerCase()) {
            case 'm+':
                if (boosterNames.length !== 4) {
                    return `Expected 4 booster name arguments; received ${boosterNames.length}`;
                }
                break;
            case 'raid':
                if (boosterNames.length !== 1) {
                    return `Expected 1 booster name argument; received ${boosterNames.length}`;
                }
                break;
            case 'pvp':
                if (boosterNames.length !== 1 || boosterNames.length !== 2) {
                    return `Expected 1 or 2 booster name arguments; received ${boosterNames.length}`;
                }
                break;
        }
    }

    return {
        customerName,
        goldAmount,
        realm,
        runType,
        boosterNames
    };
};

export const addrunCommand = (channel, rawArgs) => {
    const args = verifyArguments(rawArgs);
    if (typeof args === 'string') {
        return channel.send(args);
    }

    const { customerName, goldAmount, realm, runType, boosterNames } = args;

    channel.send(
        `Customer "${customerName}" paid ${goldAmount}K gold on ${realm} for a run of type "${runType}", performed by ${boosterNames}. Correct?`
    );
};
