import express from 'express';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import { YtDlpWrap } from 'yt-dlp-wrap';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const app = express();
const port = process.env.PORT || 3000;
const ytDlpWrap = new YtDlpWrap();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get('/ytmp3', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing YouTube URL' });

  const id = randomUUID();
  const videoPath = path.join(__dirname, `${id}.mp4`);
  const audioPath = path.join(__dirname, `${id}.mp3`);

  try {
    // Descargar video
    await ytDlpWrap.execPromise([
      url,
      '-f', 'bestaudio',
      '-o', videoPath
    ]);

    // Convertir a MP3
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat('mp3')
        .on('error', reject)
        .on('end', resolve)
        .save(audioPath);
    });

    res.download(audioPath, 'audio.mp3', async () => {
      await unlink(videoPath).catch(() => {});
      await unlink(audioPath).catch(() => {});
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing video.' });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});