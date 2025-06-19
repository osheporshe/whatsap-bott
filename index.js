const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const cron = require('node-cron');
const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connected to WhatsApp');
        }
    });

    // Example: Sends at 9:00 AM every day
    cron.schedule('0 9 * * *', async () => {
        const number = '918828380579'; // 👈 Replace with full WhatsApp number
        const jid = number + '@s.whatsapp.net';
        const message = '☀️ Wake Up Raza ';

        await sock.sendMessage(jid, { text: message });
        console.log(`📤 Message sent to ${number}`);
    });
}

startBot();
