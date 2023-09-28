/**
 * Clase Server
 * Esta clase representa un servidor Express configurado con ciertas características.
 */
import express, { Application } from "express";
import cors from "cors";

import { Connection } from "../database/config";
import productRoutes from "../routes/product";


class Server {
  private app: Application;
  private port: string;
  private apiPaths = {
    // Aquí puedes definir las rutas de tu API si es necesario
    product:"/api/product"
  };

  /**
   * Constructor de la clase Server
   * Configura y crea una instancia de un servidor Express.
   */
  constructor() {
    // Constructor del servidor express
    this.app = express();

    // Puerto de conexión obtenido del entorno o predeterminado a "8080"
    this.port = process.env.PORT || "8080";

    // Inicia la conexión a la base de datos
    this.dbConnection();

    // Configura middlewares
    this.middlewares();

    // Configura las rutas de la aplicación
    this.routes();
  }

  /**
   * Inicia la conexión a la base de datos.
   */
  async dbConnection() {
    try {
      await Connection();
    } catch (err: any) {
      console.error(err);
    }
  }

  /**
   * Configura los middlewares de la aplicación.
   * - CORS: Habilita el manejo de solicitudes CORS.
   * - Lectura del body: Permite leer el cuerpo de las solicitudes en formato JSON.
   * - Carpeta pública: Habilita el acceso a archivos estáticos en la carpeta "public".
   */
  middlewares() {
    // CORS: Permite solicitudes desde orígenes diferentes (puedes configurar la política CORS según tus necesidades).
    this.app.use(cors());

    // Lectura del body: Permite interpretar el cuerpo de las solicitudes como JSON.
    this.app.use(express.json());

    // Carpeta pública: Permite el acceso a archivos estáticos en la carpeta "public".
    this.app.use(express.static("public"));
  }

  /**
   * Configura las rutas de la aplicación.
   * - Ejemplo: Define una ruta "/api/img" que sirve archivos estáticos desde la carpeta "img".
   */
  routes() {
    this.app.use(this.apiPaths.product,productRoutes)
    this.app.use("/api/img", express.static("img"));
    // Aquí puedes definir más rutas de tu API si es necesario.
  }

  /**
   * Inicia el servidor y comienza a escuchar en el puerto especificado.
   */
  listen() {
    // La aplicación selecciona el puerto asignado y comienza a ejecutar el servidor.
    this.app.listen(this.port, () => {
      console.log("Servidor corriendo en el puerto " + this.port);
    });
  }
}

export default Server;