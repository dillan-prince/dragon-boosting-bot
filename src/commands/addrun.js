import { User, Role } from '../database/dbConnection.js';
import { writeToCreditsSheet } from '../services/googleSheetsService.js';
import { hasPermission } from '../services/permissionsService.js';
import {
    DUNGEON_BOOSTER_PERCENTAGE_CUT,
    RAID_BOOSTER_PERCENTAGE_CUT,
    BOOSTER_PERCENTAGE_DISCOUNT
} from '../common/constants.js';

export const validateArguments = (args) => {
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
            case 'bm+':
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

    const boosterUserIds = [];
    boosterNames.forEach((boosterName) => {
        if (!boosterName.startsWith('<@') || !boosterName.endsWith('>')) {
            throw new Error(
                `Expected user name in the format @Username; received "${boosterName}"`
            );
        } else {
            let userId = boosterName.slice(2, -1);

            if (userId.startsWith('!')) {
                userId = userId.slice(1);
            }

            boosterUserIds.push(userId);
        }
    });

    return {
        customerName,
        goldAmount,
        realm,
        runType,
        boosterUserIds
    };
};

const upsertUserBalance = async (userId, addAmount) => {
    const user = await User.findOne({
        where: { userId }
    });

    if (!user) {
        await User.create({ userId, balance: addAmount });
    } else {
        user.balance += addAmount;
        await user.save();
    }
};

const getBoosterPercentageCut = (runType) => {
    switch (runType.toLowerCase()) {
        case 'bm+':
        case 'm+':
            return DUNGEON_BOOSTER_PERCENTAGE_CUT;
        case 'raid':
            return RAID_BOOSTER_PERCENTAGE_CUT;
        case 'pvp':

        default:
            return 0;
    }
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
export const addrunCommand = async (message, args) => {
    try {
        if (
            !hasPermission(message, [
                'White Dragon',
                'Blue Dragon',
                'Green Dragon',
                'Red Dragon',
                'Gold Dragon',
                'Chromatic Dragon'
            ])
        ) {
            return message.reply('you are not allowed to use this command.');
        }

        const {
            customerName,
            goldAmount,
            realm,
            runType,
            boosterUserIds
        } = validateArguments(args);

        const advertiserRole = (await Role.findOne({
            where: {
                name: message.channel.guild.members.cache
                    .get(message.author.id)
                    ._roles.map(
                        (roleId) =>
                            message.channel.guild.roles.cache.get(roleId).name
                    )
                    .find((roleName) =>
                        [
                            'White Dragon',
                            'Blue Dragon',
                            'Green Dragon',
                            'Red Dragon'
                        ].includes(roleName)
                    )
            }
        })) || { percentageCut: 0 };

        await upsertUserBalance(
            message.author.id,
            (goldAmount * advertiserRole.percentageCut) / 100
        );

        const boosterPercentageCut = getBoosterPercentageCut(runType);
        for (const boosterUserId of boosterUserIds) {
            await upsertUserBalance(
                boosterUserId,
                (goldAmount * boosterPercentageCut) / 100
            );
        }

        writeToCreditsSheet([
            message.author.username,
            customerName,
            realm,
            goldAmount,
            runType,
            ...boosterUserIds.map(
                (userId) =>
                    message.guild.members.cache.get(userId).nickname ||
                    message.guild.members.cache.get(userId).user.username
            )
        ]);
    } catch (error) {
        message.channel.send(error.toString());
    }
};
