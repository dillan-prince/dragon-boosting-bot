import { addrunCommand } from '../commands/index.js';

export const prefix = '$';
export const onMessage = (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'addrun':
            addrunCommand(message.channel, args);
            break;
        case 'add':
        case 'remove':
        case 'balance':
            message.channel.send(`Valid command: ${command}`);
            break;
    }
};
