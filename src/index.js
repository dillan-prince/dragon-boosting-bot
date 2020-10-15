import { Client } from 'discord.js';

import { Keys } from './config/index.js';
import { onMessage, onUnhandledRejection } from './listeners/index.js';

const keys = await Keys();

process.on('unhandledRejection', onUnhandledRejection);

const client = new Client();
client.on('message', onMessage);
client.login(keys.DISCORD_TOKEN);
