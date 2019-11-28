const express = require("express");

// use process.env variables to keep private variables,
require("dotenv").config();

// Express Middleware
const helmet = require("helmet"); // creates headers that protect from attacks (security)
const bodyParser = require("body-parser"); // turns response into usable format
const cors = require("cors"); // allows/disallows cross-site communication 

const main = require("./controller/main");

// App
const app = express();

// App Middleware
const whitelist = ["http://localhost:3001"];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};

const cargar_archivo = async () => {
    await main.pregunta_archivo()
}

cargar_archivo()

app.use(helmet());
//app.use(cors(corsOptions));
app.use(cors());
//app.use(bodyParser.json());
app.use(bodyParser.json({limit: '1mb', extended: true}))

app.post('/login', main.login)
app.post('/recuperar_clave', main.recuperar_clave)
app.post('/actualizar_encuesta', main.verifytoken, main.actualizar_encuesta)
app.post('/preguntas_encuesta', main.verifytoken, main.preguntas_encuesta)
app.post('/enviar_conclusion', main.verifytoken, main.enviar_conclusion)




app.get('/session', main.verifytoken, main.session)
app.get('/encuesta', main.verifytoken, main.encuesta)
app.get('/datos_usuario', main.verifytoken, main.datos_usuario)
app.get('/datos_empresa', main.verifytoken, main.datos_empresa)
app.get('/resultados_innovacion', main.verifytoken, main.resultados_innovacion)
app.get('/proposito', main.verifytoken, main.proposito)
app.get('/liderazgo', main.verifytoken, main.liderazgo)
app.get('/estructuras_habilitadoras', main.verifytoken, main.estructuras_habilitadoras)
app.get('/sistemas_consistentes', main.verifytoken, main.sistemas_consistentes)
app.get('/cultura_conectada', main.verifytoken, main.cultura_conectada)
app.get('/lista_reporte_administrador', main.verifytoken, main.lista_reporte_administrador)
app.get('/lista_reporte_empleado', main.verifytoken, main.lista_reporte_empleado)
app.get('/total_encuestas_empresas', main.verifytoken, main.total_encuestas_empresas)
app.get('/tool_tips_data', main.verifytoken, main.tool_tips_data)


app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT || 3000}`);
});