import { addCommand, addrunCommand } from '../commands/index.js';
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
        case 'balance':
            message.reply(`Valid command: ${command}`);
            break;
    }
};

export const onUnhandledRejection = (error) => {
    return console.error('Uncaught Promise Rejection:', error);
};
