import { User, Role } from '../database/dbConnection.js';
import { writeToAddRunSheet } from '../services/googleSheetsService.js';
import { hasPermission } from '../services/permissionsService.js';
import {
    DUNGEON_BOOSTER_PERCENTAGE_CUT,
    RAID_BOOSTER_PERCENTAGE_CUT,
    BOOSTER_PERCENTAGE_DISCOUNT,
    embedColors
} from '../common/constants.js';
import { getServerUsername } from '../services/utilities.js';

export const validateArguments = (args) => {
    if (args.length < 5) {
        throw new Error('Expected at least 5 arguments.');
    }

    let [customerName, goldAmount, realm, runType, ...boosterNames] = args;

    if (parseFloat(goldAmount) % 1 !== 0) {
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

    if (!['bm+', 'm+', 'raid', 'pvp'].includes(runType.toLowerCase())) {
        throw new Error(
            `Expected run type to be one of "BM+", "M+", "Raid", or "PvP"; received "${runType}"`
        );
    } else {
        switch (runType.toLowerCase()) {
            case 'bm+':
            case 'm+':
                runType = runType.toUpperCase();
                if (boosterNames.length !== 4) {
                    throw new Error(
                        `Expected 4 booster name arguments; received ${boosterNames.length}`
                    );
                }
                break;
            case 'raid':
                runType = 'Raid';
                if (boosterNames.length !== 1) {
                    throw new Error(
                        `Expected 1 booster name argument; received ${boosterNames.length}`
                    );
                }
                break;
            case 'pvp':
                runType = 'PvP';
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

const upsertUserBalance = async (message, userId, addAmount) => {
    const user = await User.findOne({
        where: { userId }
    });

    if (!user) {
        await User.create({ userId, balance: addAmount });
    } else {
        user.balance += addAmount;
        await user.save();
    }

    await message.guild.members.cache
        .get(userId)
        .send(
            `${getServerUsername(
                message,
                message.author.id
            )} added ${addAmount}K to your balance as a result of a completed run. \n` +
                `New balance is ${user.balance}K.`
        );
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

const getEmbedColor = (runType) => {
    switch (runType.toLowerCase()) {
        case 'bm+':
            return embedColors.gold;
        case 'm+':
            return embedColors.blue;
        case 'raid':
            return embedColors.green;
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

        const validatedArgs = validateArguments(args);
        const { goldAmount, realm, runType, boosterUserIds } = validatedArgs;
        let { customerName } = validatedArgs;

        if (customerName.startsWith('<@') && customerName.endsWith('>')) {
            let customerUserId = customerName.slice(2, -1);

            if (customerUserId.startsWith('!')) {
                customerUserId = customerUserId.slice(1);
            }

            customerName = getServerUsername(message, customerUserId);
        }

        const embed = {
            color: getEmbedColor(runType),
            title: `${runType} boost posted by ${getServerUsername(
                message,
                message.author.id
            )}`,
            description: 'Reply "yes" to confirm',
            fields: [
                {
                    name: 'Advertiser',
                    value: getServerUsername(message, message.author.id),
                    inline: true
                },
                {
                    name: 'Customer',
                    value: customerName,
                    inline: true
                },
                {
                    name: 'Type',
                    value: runType,
                    inline: true
                },
                {
                    name: 'Realm',
                    value: realm
                },
                {
                    name: 'Amount',
                    value: `${goldAmount}K`
                },
                {
                    name: 'Boosters',
                    value: boosterUserIds
                        .map((userId) => `<@${userId}>`)
                        .join(', ')
                }
            ]
        };

        const embeddedMessage = await message.channel.send({
            embed
        });

        let confirmationResponse = null;
        let confirmed = false;
        await message.channel.awaitMessages(
            async (response) => {
                if (
                    response.author.id === message.author.id &&
                    response.content.toLowerCase() === 'yes'
                ) {
                    confirmationResponse = response;
                    return (confirmed = true);
                }
            },
            {
                max: 1,
                time: 60000
            }
        );

        if (!confirmed) {
            await message.reply('did not receive confirmation. Aborting.');
            message.delete();
            return embeddedMessage.delete();
        }

        let {
            name: roleName,
            percentageCut: advertiserPercentageCut
        } = (await Role.findOne({
            where: {
                name:
                    message.channel.guild.members.cache
                        .get(message.author.id)
                        ._roles.map(
                            (roleId) =>
                                message.channel.guild.roles.cache.get(roleId)
                                    .name
                        )
                        .find((roleName) =>
                            [
                                'White Dragon',
                                'Blue Dragon',
                                'Green Dragon',
                                'Red Dragon'
                            ].includes(roleName)
                        ) || ''
            }
        })) || { percentageCut: 0 };

        if (runType.toLowerCase() === 'bm+') {
            advertiserPercentageCut -= BOOSTER_PERCENTAGE_DISCOUNT;
        }

        await upsertUserBalance(
            message,
            message.author.id,
            Math.floor((goldAmount * advertiserPercentageCut) / 100)
        );

        const boosterPercentageCut = getBoosterPercentageCut(runType);
        for (const boosterUserId of boosterUserIds) {
            await upsertUserBalance(
                message,
                boosterUserId,
                Math.floor((goldAmount * boosterPercentageCut) / 100)
            );
        }

        writeToAddRunSheet([
            getServerUsername(message, message.author.id),
            roleName,
            customerName,
            realm,
            goldAmount,
            runType,
            ...boosterUserIds.map((userId) =>
                getServerUsername(message, userId)
            )
        ]);

        message.delete();
        confirmationResponse.delete();
        embeddedMessage.edit({ embed: { ...embed, description: '' } });
    } catch (error) {
        message.delete();
        message.channel.send(error.toString());
    }
};
