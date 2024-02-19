import config from "./src/config/config";
import { connectToSqlServer } from "./src/DB/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import "colors";
import i18n from "./src/config/i18n";
import fileUpload from 'express-fileupload';

//routes
import exampleRoutes from "./src/routes/router.Router";

class Server {
  private app: Application;
  private port: string;
  private path: any;

  constructor() {
    this.app = express();
    this.port = config.port || '8080';
    this.path = {
      // exmple
      example: "/api/givesharingfood",
    };

    // Conectar a bd
    this.conectarDB();
    // Middlwares
    this.middlewares();
    // Mis rutas
    this.routes();

    // cors proteger nuestra api para que solo reciba peticiones de cierto lugar
    // listas blancas y listas negras
  }

  async conectarDB() {
    // concection of bd
    await connectToSqlServer();
  }

  middlewares() {
    // CORS
    this.app.use(cors());
    // Directorio publico
    this.app.use(express.static("public"));
    // resposes json
    this.app.use(express.json());
    // responses
    this.app.use(morgan("dev"));
    // subir archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true,
      })
    );
    // translator handler 
    this.app.use(i18n.init);
  }

  routes() {
    // example
    this.app.use(this.path.example, exampleRoutes);
  }

  listen() {
    console.clear();
    this.app.listen(this.port, () => {
      console.log(` 🔥 Server in port ${this.port}`.bold);
    });
  }
}

export default Server;
