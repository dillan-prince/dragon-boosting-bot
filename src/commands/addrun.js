export const verifyArguments = (args) => {
    if (args.length < 5) {
        throw new Error('Expected at least 5 arguments.');
    }

    const [customerName, goldAmount, realm, runType, ...boosterNames] = args;

    if (!parseInt(goldAmount)) {
        throw new Error(
            `Expected an integer for the gold amount; received "${goldAmount}"`
        );
    }

    if (!realm.includes('-')) {
        throw new Error(
            `Expected realm in format <Realm Name>-<Faction>; received "${realm}"`
        );
    } else {
        const [, faction] = realm.split('-');
        if (!['a', 'h'].includes(faction.toLowerCase())) {
            throw new Error(
                `Expected faction part of realm argument to be "A" or "H"; received "${faction}"`
            );
        }
    }

    if (!['m+', 'raid', 'pvp'].includes(runType.toLowerCase())) {
        throw new Error(
            `Expected run type to be one of "M+", "Raid", or "PvP"; received "${runType}"`
        );
    } else {
        switch (runType.toLowerCase()) {
            case 'm+':
                if (boosterNames.length !== 4) {
                    throw new Error(
                        `Expected 4 booster name arguments; received ${boosterNames.length}`
                    );
                }
                break;
            case 'raid':
                if (boosterNames.length !== 1) {
                    throw new Error(
                        `Expected 1 booster name argument; received ${boosterNames.length}`
                    );
                }
                break;
            case 'pvp':
                if (![1, 2].includes(boosterNames.length)) {
                    throw new Error(
                        `Expected 1 or 2 booster name arguments; received ${boosterNames.length}`
                    );
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

/**
 *  Command: $addrun
 *  Arguments:
 *      [Customer Name]
 *      [Gold Amount in Thousands]
 *      [Realm-Faction] - Faction must be "A" or "H"
 *      [Type] - Must be "M+", "Raid", or "PvP"
 *      [Booster Names]
 *          Number of names required depends on [Type]:
 *              M+: 4 names, one for each booster in the dungeon party.
 *              Raid: 1 name, the name of the team that performed the carry.
 *              PvP: 1-2 names, one for each booster in a 2v2 or 3v3 group.
 */
export const addrunCommand = (message, args) => {
    try {
        const {
            customerName,
            goldAmount,
            realm,
            runType,
            boosterNames
        } = verifyArguments(args);

        message.channel.send(
            `Customer "${customerName}" paid ${goldAmount}K gold on ${realm} for a run of type "${runType}", performed by ${boosterNames}. Correct?`
        );
    } catch (error) {
        message.channel.send(error.toString());
    }
};
