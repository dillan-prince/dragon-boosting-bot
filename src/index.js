import { Client } from 'discord.js';

import { Keys } from './config/index.js';
import { onMessage, onUnhandledRejection } from './listeners/index.js';

const keys = await Keys();

const client = new Client();
client.on('message', onMessage);
client.on('unhandledRejection', onUnhandledRejection);
client.login(keys.DISCORD_TOKEN);
