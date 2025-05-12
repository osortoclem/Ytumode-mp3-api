const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const app = express();
const port = process.env.PORT || 3000;

ffmpeg.setFfmpegPath(ffmpegPath);

// Página básica para probar
app.get('/', (req, res) => {
    res.send(`
        <h2>Descargar MP3 de YouTube</h2>
        <form method="GET" action="/download">
            <input type="text" name="url" placeholder="URL de YouTube" style="width: 300px" required />
            <button type="submit">Descargar MP3</button>
        </form>
    `);
});

// Ruta de descarga
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).send('URL inválida');
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '') || 'audio';

        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);

        ffmpeg(ytdl(videoUrl, { quality: 'highestaudio' }))
            .audioBitrate(128)
            .format('mp3')
            .on('error', (err) => {
                console.error('Error en ffmpeg:', err);
                res.status(500).send('Error al convertir el video.');
            })
            .pipe(res);
    } catch (err) {
        console.error('Error al procesar el video:', err);
        res.status(500).send('No se pudo procesar el video.');
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});