import Sequelize from 'sequelize';

import { User } from '../database/dbConnection.js';
import { hasPermission } from '../services/permissionsService.js';

export const validateArguments = (args) => {
    return args.map((mentionedUsername) => {
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
    });
};

export const allBalancesCommand = async (message, args) => {
    try {
        if (!hasPermission(message, ['Gold Dragon', 'Chromatic Dragon'])) {
            return message.reply('you are not allowed to use this command.');
        }

        const boosterUserIds = validateArguments(args);
        const query = { where: { balance: { [Sequelize.Op.ne]: 0 } } };

        if (boosterUserIds.length > 0) {
            query.where.userId = boosterUserIds;
        }

        const users = await User.findAll(query);

        message.author.send([
            '```',
            `${'Server Username'.padEnd(30, ' ')} | Balance`,
            ...users.map(
                ({ userId, balance }) =>
                    `${(
                        message.guild.members.cache.get(userId).nickname ||
                        message.guild.members.cache.get(userId).user.username
                    ).padEnd(30, ' ')} | ${balance}K`
            ),
            '```'
        ]);
        message.delete();
    } catch (error) {
        message.channel.send(error.toString());
    }
};
