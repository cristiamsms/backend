# PRODUCTOS BACKEND APIREST

## Instalación

1. Clona este repositorio en tu máquina local usando `git clone`.
2. Instala las dependencias: `npm install`.

## Configuración

Crea un archivo `.env` en la raíz del proyecto y configura las siguientes variables de entorno:

````env
DB_CNN=URL_de_tu_base_de_datos
PORT=Puerto_de_tu_servidor


Para ejecutar el servidor, utiliza el siguiente comando:

```bash
npm run start

## Rutas API

A continuación, se presentan las rutas API disponibles en este proyecto:

GET /api/products: Obtiene la lista de productos.
GET /api/products/by/:id: Obtiene un producto por su ID.
GET /api/products/history/:id: Obtiene un el historial de cambios de  un producto por el id del producto
POST /api/products: Agrega un nuevo producto.
PUT /api/products/edit/:id: Actualiza un producto existente.
DELETE /api/products/delete/:id: Elimina un producto por su ID.
````
