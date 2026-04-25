# Frontend - Calculadora IVA & Descuentos

Interfaz web en HTML, CSS y JavaScript puro para calcular el valor final de un producto.

## Uso local

Simplemente abre `index.html` en tu navegador, o usa un servidor local:

```bash
# Con Python
python -m http.server 5500

# Con Node.js (npx)
npx serve .
```

## Configuración del backend

En `script.js`, ajusta la URL del API si cambia el puerto o el host:

```javascript
const API_URL = "http://localhost:3010/calcularValorFinal/";
```

Para producción, cámbiala a la URL de tu backend desplegado:

```javascript
const API_URL = "https://tu-backend-en-render.com/calcularValorFinal/";
```

## Validaciones implementadas

- **Código**: alfanumérico (letras A-Z y números 0-9)
- **Nombre**: solo letras (incluyendo tildes y ñ)
- **Costo Base**: número mayor o igual a 0
- **IVA**: número mayor o igual a 0
- **Descuento**: número mayor o igual a 0

## Despliegue

Puedes desplegar este frontend en:
- [Netlify](https://netlify.com) — arrastra la carpeta
- [Vercel](https://vercel.com) — conecta el repositorio
- [GitHub Pages](https://pages.github.com) — en la configuración del repo
