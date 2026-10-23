Este es un proyecto de Next.js inicializado con create-next-app.

Primero, ejecuta el servidor de desarrollo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abri http://localhost:3000 en tu navegador para ver el resultado.

Podes comenzar a editar la página modificando app/page.tsx. La página se actualizará automáticamente a medida que edites el archivo.

Este proyecto utiliza next/font para optimizar y cargar automáticamente Geist, una nueva familia tipográfica desarrollada por Vercel.

//CONEXION CON EL BACKEND//

Para poder ver la aplicación web funcionando con todas sus preguntas, imágenes y lógica de filiación divina en tiempo real, es obligatorio mantener levantados los dos servidores al mismo tiempo en dos terminales de PowerShell separadas.

---Levantar el Backend (Python / FastAPI)
Esta terminal se encarga de procesar la lógica de puntuación, las reglas de los dioses y servir las rutas de las preguntas.

#Abrir la primera terminal de PowerShell e ir a la carpeta del backend:

cd C:\Users\Melan\test_demigods

#Ejecuta el servidor de Python:

python -m uvicorn api:app --reload --port 8000

En la terminal va a salir  un mensaje indicando que la API está corriendo en http://127.0.0.1:8000. No cierres esta terminal.
Levantar el Frontend (Next.js / React)

Esta terminal abre la interfaz visual interactiva que consume los datos de Python.

#Abrí una segunda terminal de PowerShell y anda a la carpeta del frontend:

cd C:\Users\Melan\demigods-test-front

#Ejecuta el servidor de desarrollo de Next.js:

npx next dev -H localhost

La terminal va a avisar que el servidor está listo. Entra desde tu navegador web a: http://localhost:3000
Ambos procesos tienen que estar ejecutándose en paralelo. Si cerras la terminal de Python, el frontend no va a poder cargar las preguntas ni procesar los resultados del test.
Si realizas cambios en data.json o en el código del frontend (app/page.tsx), los vas a ver de inmediato en http://localhost:3000 al actualizar la página (F5).
