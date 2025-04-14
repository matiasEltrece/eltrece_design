import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
  const { imageUrl, texto1, texto2, programa } = req.body;

  try {
    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Imagen principal desde URL
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    const baseImage = await loadImage(buffer);
    ctx.drawImage(baseImage, 0, 0, width, height);

    // Cargar marco por programa
    const cleanName = programa.toLowerCase().replace(/ /g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const framePath = path.resolve('./public/frames', `${cleanName}.png`);
    const frameBuffer = await readFile(framePath);
    const frameImage = await loadImage(frameBuffer);
    ctx.drawImage(frameImage, 0, 0, width, height);

    // Agregar texto
    ctx.fillStyle = 'white';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(texto1 || '', 80, 1780);
    ctx.fillText(texto2 || '', 80, 1840);

    // Responder con imagen PNG
    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
}
