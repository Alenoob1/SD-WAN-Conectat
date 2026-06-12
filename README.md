# AleSmart - SD-WAN & OLT Monitoring

## ⚙️ Configuración de Variables de Entorno

Este proyecto requiere variables de entorno para comunicarse con el Backend y el chatbot (OpenAI). 

### 1. Desarrollo Local
Crea un archivo `.env` en la raíz del proyecto `alesmart/` (este archivo está ignorado en Git para tu seguridad) y agrega las siguientes variables:

```env
VITE_API_URL=https://backend-sd-wan-1.onrender.com/api
VITE_OPENAI_API_KEY=tu_clave_de_openai_aqui
```

### 2. Producción (Despliegue en Vercel)
Para que el chatbot y las llamadas de API funcionen en producción, debes configurar estas variables en el panel de control de Vercel:

1. Ve a **Settings** > **Environment Variables** en tu proyecto de Vercel.
2. Agrega las siguientes claves:
   - `VITE_API_URL` con el enlace de tu backend.
   - `VITE_OPENAI_API_KEY` con tu clave de OpenAI.
3. **Importante:** Realiza un **Redeploy** de la aplicación para que Vite compile el código con las nuevas variables.

---

# React + TypeScript + Vite

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
