import { addCommand, addrunCommand } from '../commands/index.js';

export const prefix = '$';
export const onMessage = (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(' ');
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
            message.channel.send(`Valid command: ${command}`);
            break;
    }
};
