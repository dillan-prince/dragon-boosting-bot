import { Client } from 'discord.js';
import { Keys } from './config/index.js';
import { onMessage } from './listeners/index.js';

const client = new Client();
const keys = await Keys();

client.on('message', onMessage);
client.login(keys.DISCORD_TOKEN);
