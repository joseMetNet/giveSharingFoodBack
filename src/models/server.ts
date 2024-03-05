import config from "../config/config";
import { connectToSqlServer } from "../DB/config";
import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import "colors";
import i18n from "../config/i18n";
import fileUpload from 'express-fileupload';

//routes
import exampleRoutes from "../routes/Department.Router";
import cityRouter from "../routes/City.Router";
import typeIdentificationRouter from "../routes/TypeIdentification.Router";
import userRouter from "../routes/User.Router";
import organizationRouter from "../routes/Organization.Router";
import productsRouter from "../routes/Products.Router";
import documentsRouter from "../routes/Documents.Router";
import loginRouter from "../routes/Login.Router";

class Server {
  private app: Application;
  private port: string;
  private path: any;

  constructor() {
    this.app = express();
    this.port = config.port || '8080';
    this.path = {
      // exmple
      example: "/givesharingfood",
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

  configurarCORS() {
    const corsOptions = {
        origin: process.env.URL_FRONT || 'https://givesharingfood.azurewebsites.net', 
        methods: ["GET", "POST", "PUT", "DELETE"], 
        allowedHeaders: ["Content-Type", "Authorization"], 
        optionsSuccessStatus: 200 
    };

    this.app.use(cors(corsOptions));
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
        tempFileDir: "./tmp/",
        createParentPath: true,
      })
    );
    // translator handler 
    this.app.use(i18n.init);
  }

  routes() {
    // example
    this.app.use(this.path.example, exampleRoutes);
    this.app.use(this.path.example, cityRouter);
    this.app.use(this.path.example, typeIdentificationRouter);
    this.app.use(this.path.example, userRouter);
    this.app.use(this.path.example, organizationRouter);
    this.app.use(this.path.example, productsRouter);
    this.app.use(this.path.example, documentsRouter);
    this.app.use(this.path.example, loginRouter);
  }

  listen() {
    console.clear();
    this.app.listen(this.port, () => {
      console.log(` 🔥 Server in port ${this.port}`.bold);
    });
  }
}

export default Server;
