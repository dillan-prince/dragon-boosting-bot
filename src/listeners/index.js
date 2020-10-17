import {
    addCommand,
    addrunCommand,
    balanceCommand,
    removeCommand
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

    try {
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
        }
    } catch (error) {
        message.channel.send(error.toString());
    }
};

export const onUnhandledRejection = (error) => {
    return console.error('Uncaught Promise Rejection:', error.toString());
};
