# eltrece_design (versión Sharp)

Renderizado de imágenes combinadas con textos, marcos y foto base usando `sharp`. Optimizado para despliegue en Vercel.

## POST /api/render

**Body JSON:**

```json
{
  "imageUrl": "https://tusitio.com/imagen.jpg",
  "texto1": "Texto superior",
  "texto2": "Texto inferior",
  "programa": "Viviana en Vivo"
}
```

La imagen final es enviada automáticamente al webhook Make: https://hook.us2.make.com/irlgkjj7e4cfxidy6qi9fv7vqcog6gym