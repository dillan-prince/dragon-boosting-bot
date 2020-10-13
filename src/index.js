import { Client } from 'discord.js';
import { keys } from './config/index.js';
const client = new Client();

client.on('message', (message) => {
    const { content } = message;
    if (content.startsWith('*')) {
        const commandParts = content.substring(1).split(' ');
        const command = commandParts[0];
        const args = commandParts.splice(1);

        switch (command) {
            case 'addrun':
            case 'add':
            case 'remove':
            case 'balance':
                message.channel.send(`Valid command: ${command}`);
                break;
        }
    }
});

client.login(keys.DISCORD_TOKEN);
