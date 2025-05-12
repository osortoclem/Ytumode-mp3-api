const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!ytdl.validateURL(videoUrl)) return res.status(400).send('Invalid URL');

    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);

    ffmpeg(ytdl(videoUrl, { quality: 'highestaudio' }))
        .audioBitrate(128)
        .format('mp3')
        .pipe(res);
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});