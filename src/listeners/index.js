import {
    addCommand,
    addrunCommand,
    allBalancesCommand,
    balanceCommand,
    removeCommand,
    strikeCommand
} from '../commands/index.js';
import { COMMAND_PREFIX } from '../common/constants.js';

export const onMessage = (message) => {
    if (!message.content.startsWith(COMMAND_PREFIX) || message.author.bot) {
        return;
    }

    const args = message.content
        .slice(COMMAND_PREFIX.length)
        .trim()
        .split(/ +/);

    const command = args.shift().toLowerCase();

    switch (command) {
        case 'addrun':
            addrunCommand(message, args);
            break;
        case 'add':
            addCommand(message, args);
            break;
        case 'remove':
            removeCommand(message, args);
            break;
        case 'balance':
            balanceCommand(message, args);
            break;
        case 'allbalances':
            allBalancesCommand(message, args);
            break;
        case 'strike':
            strikeCommand(message, args);
            break;
    }
};

export const onUnhandledRejection = (error) => {
    return console.error('Uncaught Promise Rejection:', error.toString());
};
