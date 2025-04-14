import sharp from 'sharp';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs/promises';
import FormData from 'form-data';

export default async function handler(req, res) {
  const { imageUrl, texto1, texto2, programa } = req.body;

  try {
    const width = 1080;
    const height = 1920;

    const response = await fetch(imageUrl);
    const baseBuffer = await response.buffer();

    const cleanName = programa.toLowerCase().replace(/ /g, '').normalize('NFD').replace(/[̀-ͯ]/g, '');
    const framePath = path.resolve('./public/frames', `${cleanName}.png`);
    const frameBuffer = await fs.readFile(framePath);

    const whiteBg = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: '#ffffff'
      }
    }).png().toBuffer();

    const composed = await sharp(whiteBg)
      .composite([
        { input: baseBuffer, gravity: 'center' },
        { input: frameBuffer, gravity: 'center' }
      ])
      .png()
      .toBuffer();

    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .title { fill: white; font-size: 50px; font-weight: bold; font-family: sans-serif; }
        </style>
        <text x="80" y="1780" class="title">${texto1 || ''}</text>
        <text x="80" y="1840" class="title">${texto2 || ''}</text>
      </svg>
    `;
    const svgBuffer = Buffer.from(svgText);

    const finalImage = await sharp(composed)
      .composite([{ input: svgBuffer }])
      .png()
      .toBuffer();

    const form = new FormData();
    form.append('file', finalImage, {
      filename: 'imagen_final.png',
      contentType: 'image/png',
    });

    await fetch('https://hook.us2.make.com/irlgkjj7e4cfxidy6qi9fv7vqcog6gym', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    res.status(200).json({ status: 'Imagen generada y enviada al webhook Make (sharp)' });
  } catch (err) {
    console.error('Error en render-sharp.js:', err);
    res.status(500).json({ error: 'Error al procesar la imagen con sharp' });
  }
}