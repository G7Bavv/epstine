require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { Streamer, streamLivestreamVideo } = require('@dank074/discord-video-stream');

const client = new Client({ checkUpdate: false });
const streamer = new Streamer(client);

// Configuration from .env
const TOKEN = process.env.DISCORD_TOKEN;

client.on('ready', () => {
    console.log(`✅ Self-bot online: ${client.user.tag}`);
    console.log('Type "!play <url>" in any chat to start.');
});

client.on('messageCreate', async (msg) => {
    // Only respond to your own commands
    if (msg.author.id !== client.user.id) return;

    if (msg.content.startsWith('!play')) {
        const args = msg.content.split(' ');
        const videoLink = args[1]; // The link you provide
        const voiceChannel = msg.member?.voice?.channel;

        if (!videoLink || !voiceChannel) {
            return msg.reply("❌ Usage: !play <direct_video_link> (Join a VC first!)");
        }

        try {
            await streamer.joinVoice(msg.guild.id, voiceChannel.id);
            
            // Create stream at 720p (higher might lag on free hosting)
            const udp = await streamer.createStream({
                width: 1280,
                height: 720,
                fps: 30,
                bitrateKbps: 2000,
            });

            udp.mediaConnection.setSpeaking(true);
            udp.mediaConnection.setVideoStatus(true);

            msg.edit(`🎥 Now streaming: ${videoLink}`);
            
            await streamLivestreamVideo(videoLink, udp);

            // cleanup
            streamer.leaveVoice();
            msg.channel.send("✅ Stream finished.");
        } catch (err) {
            console.error(err);
            msg.reply(`⚠️ Error: ${err.message}`);
        }
    }

    if (msg.content === '!stop') {
        streamer.leaveVoice();
        msg.reply("⏹️ Stream stopped.");
    }
});

client.login(TOKEN);