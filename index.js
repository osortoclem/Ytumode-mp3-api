const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para analizar datos del formulario
app.use(express.urlencoded({ extended: true }));

// Ruta para servir la página HTML
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>MP3 Downloader</title>
      </head>
      <body style="font-family: Arial; padding: 40px;">
        <h2>Descargar MP3 desde YouTube</h2>
        <form method="GET" action="/download">
          <input type="text" name="url" placeholder="Pega la URL de YouTube aquí" style="width: 300px;" required/>
          <button type="submit">Descargar MP3</button>
        </form>
      </body>
    </html>
    `);
});

// Incluir tu lógica de descarga desde MP3JS
const mp3Route = require('./api/MP3');
app.use(mp3Route); // si exportas como router

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});