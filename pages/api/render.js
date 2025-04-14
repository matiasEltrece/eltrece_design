import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import FormData from 'form-data';

const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
  const { imageUrl, texto1, texto2, programa } = req.body;

  try {
    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    const baseImage = await loadImage(buffer);
    ctx.drawImage(baseImage, 0, 0, width, height);

    const cleanName = programa.toLowerCase().replace(/ /g, '').normalize('NFD').replace(/[̀-ͯ]/g, '');
    const framePath = path.resolve('./public/frames', `${cleanName}.png`);
    const frameBuffer = await readFile(framePath);
    const frameImage = await loadImage(frameBuffer);
    ctx.drawImage(frameImage, 0, 0, width, height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(texto1 || '', 80, 1780);
    ctx.fillText(texto2 || '', 80, 1840);

    const finalBuffer = canvas.toBuffer('image/png');

    const form = new FormData();
    form.append('file', finalBuffer, {
      filename: 'imagen_final.png',
      contentType: 'image/png',
    });

    const webhookResponse = await fetch('https://hook.us2.make.com/irlgkjj7e4cfxidy6qi9fv7vqcog6gym', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (!webhookResponse.ok) {
      throw new Error(`Error al enviar al webhook: ${webhookResponse.statusText}`);
    }

    res.status(200).json({ status: 'Imagen generada y enviada al webhook Make' });

  } catch (err) {
    console.error('Error en render.js:', err);
    res.status(500).json({ error: 'Error al procesar o enviar la imagen' });
  }
}