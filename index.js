const { Client } = require('discord.js-selfbot-v13');
const { Streamer, streamLivestreamVideo } = require('@dank074/discord-video-stream');
const ytdl = require('ytdl-core');

const client = new Client();
const streamer = new Streamer(client);

// Configuration
const TOKEN = 'YOUR_USER_TOKEN';
const GUILD_ID = 'YOUR_SERVER_ID';
const CHANNEL_ID = 'YOUR_VOICE_CHANNEL_ID';
const VIDEO_LINK = 'https://www.youtube.com/watch?v=your_video_id'; // Can be YT or Direct MP4 link

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        await streamer.joinVoice(GUILD_ID, CHANNEL_ID);
        
        const udp = await streamer.createStream({
            width: 1280,
            height: 720,
            fps: 30,
            bitrateKbps: 2000,
        });

        console.log("Fetching stream and starting playback...");

        // Logic to handle YouTube vs Direct Link
        let finalStream;
        if (ytdl.validateURL(VIDEO_LINK)) {
            // It's a YouTube link - get the highest quality video+audio
            finalStream = ytdl(VIDEO_LINK, { quality: 'highestvideo', filter: 'audioandvideo' });
        } else {
            // It's a direct link (e.g., https://site.com/video.mp4)
            finalStream = VIDEO_LINK; 
        }

        // Start streaming
        udp.mediaConnection.setSpeaking(true);
        udp.mediaConnection.setVideoStatus(true);

        await streamLivestreamVideo(finalStream, udp);
        
        console.log('Stream finished.');
    } catch (err) {
        console.error('Streaming Error:', err);
    }
});

client.login(TOKEN);