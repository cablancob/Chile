const jwt = require("jsonwebtoken")
const nodeMailer = require('nodemailer')
const mysql = require('mysql')
const util = require('util')
const del = require('del');
var crypto = require('crypto');

const Buffer = require('buffer').Buffer;

//CORREO_ADMIN=estudios@bp2i.org
/*const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});*/

let mailOptions = {
    from: "'Prueba' <estudios@bp2i.org>",
    to: "",
    bcc: "",
    cc: "",
    subject: "Prueba",
    html: "<b>NodeJS Email Tutorial</b>",
    attachments: [{
        filename: "",
        path: "",
        cid: ""
    }]
};


let mailOptions_sinadjunto = {
    from: "'Prueba' <estudios@bp2i.org>",
    to: "",
    bcc: "",
    cc: "",
    subject: "Prueba",
    html: "<b>NodeJS Email Tutorial</b>"
};

/*
const info = await transporter.sendMail(mailOptions)
console.log('Message %s sent: %s', info.messageId, info.response)
*/

const fs = require('fs');
const connection = mysql.createConnection({
    host: process.env.DATABASE_ADDRESS,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    charset: 'latin1'
});

/*
        fs.writeFile('prueba.html', html, (err) => {
            if (err) throw err;
        });
*/

const connect = util.promisify(connection.query).bind(connection);

const mantener_bd = async () => {
    connection.query('SELECT 1')
}

const borrar_img = async () => {
    del(['*.jpg'])
}

setInterval(async () => {
    await mantener_bd()
    await borrar_img()
}, 14400000);

const csvFilePath = './controller/preguntas.csv'
const csv = require('csvtojson')

let preguntas_archivo = []

const pregunta_archivo = async () => {
    preguntas_archivo = await csv().fromFile(csvFilePath);
    let find = '-';
    let re = new RegExp(find, 'g');
    preguntas_archivo.map((obj) => {
        obj.name = obj.name.replace(re, "_").trim()
        obj.id_pregunta = obj.id_pregunta.replace(re, "_").trim()
    })
}


const preguntas_encuesta = async (req, res) => {
    try {
        const { TipoUsuario, idioma, pagina } = req.body
        let pregunta_filtro = await preguntas_archivo.filter((obj) => { return obj.tipodeusaurio === TipoUsuario })
        pregunta_filtro = await pregunta_filtro.filter((obj) => { return obj.idioma === idioma })
        pregunta_filtro = await pregunta_filtro.filter((obj) => { return obj.pagina === pagina })
        res.status(200).send(pregunta_filtro)
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const session = async (req, res) => {
    try {
        const decode = await jwt.verify(req.token, process.env.SECRET)
        res.status(200).json(decode)
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ auth: "false" })
    }
}

const verifytoken = (req, res, next) => {
    try {
        let token = req.headers["x-access-token"]
        if (!token) {
            return res.status(401).json(
                {
                    auth: false,
                }
            )
        }
        req.token = token
        next()
    } catch (e) {
        console.log(e.message)
        res.status(401).json({ error: e.message })
    }
}


const login = async (req, res) => {
    try {
        const { frmlogin_usuario, frmlogin_password, frmlogin_tipoEncuesta } = req.body
        const query = "SELECT Id, Nombre, Correo, Clave, Vigente, TipoUsuario, Empresa, IdEmpresa, Version FROM iam_usuarios WHERE Correo = '" + frmlogin_usuario + "' AND clave = '" + frmlogin_password + "' AND TipoUsuario = '" + frmlogin_tipoEncuesta + "'"
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(401).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    if (result[0].Vigente != "S") {
                        res.status(401).json({ error: "El usuario ingresado no se encuentra vigente. Por favor contactarse con el Administrador." })
                    } else {
                        delete result[0].Clave
                        const token = jwt.sign(JSON.parse(JSON.stringify(result[0])), process.env.SECRET, {
                            expiresIn: "8h"
                        })
                        res.status(200).json({ "usuario": result[0], "token": token })
                    }

                } else {
                    res.status(401).json({ error: "Usuario o Clave invalidos. Por favor contactarse con el Administrador." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const recuperar_clave = async (req, res) => {
    try {
        const data = req.body
        let html = ``
        let asunto = ""
        let para = ""
        let de = "Best Place to Innovate" + process.env.CORREO_ADMIN

        const query = "SELECT * FROM iam_usuarios WHERE Correo = '" + data.recuperarform_usuario + "' AND TipoUsuario = " + data.frmlogin_tipoEncuesta + " ORDER BY id DESC LIMIT 1;"
        await connection.query(query, async (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(401).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    if (result[0].Vigente != "S") {
                        res.status(400).json({ error: "El usuario no se encuentra vigente." })
                    } else {
                        asunto = "Clave de acceso Best Place to Innovate"
                        html = `
                        <html>
                        <head>
                        <title>`+ asunto + `</title>
                        </head>
                        <body>
                        <p>Estimad@ `+ result[0].Nombre + `.</p>
                        <p>Le recordamos que su clave de acceso a los sistemas de Best Place to Innovate es:</p>
                        <p>Usuario: <b>`+ result[0].Correo + `</b></p>
                        <p>Clave: <b>`+ result[0].Clave + `</b></p>                        
                        <p>Con esta información puede acceder <a href="`+ process.env.LINK + `"><font color='#ff0000'>AQUÍ</font></a></p>                        
                        <p>Gracias por preferirnos.</p>                                                
                        <p><b>El Equipo de Best Place to Innovate</b></p>
                        <p><img src='https://bestplacetoinnovate.org/firmacorreo.png' alt='Best Place to Innovate' /></p>
                        </body>
                        </html>
                        `
                        //Best Place to Innovate               
                        //CORREO
                        para = result[0].Nombre + " <" + result[0].Correo + ">"

                        mailOptions_sinadjunto.to = para
                        mailOptions_sinadjunto.from = de
                        mailOptions_sinadjunto.subject = asunto
                        mailOptions_sinadjunto.html = html

                        const info = await transporter.sendMail(mailOptions_sinadjunto)
                        console.log('Message %s sent: %s', info.messageId, info.response)
                        res.status(200).json("OK")
                    }

                } else {
                    res.status(400).json({ error: "El correo no se encuentra registrado." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const encuesta = async (req, res) => {
    try {
        let query = ""
        if (req.query.tipousuario == "2") { query = "SELECT * FROM iam_encuesta90 WHERE IdUsuario = " + req.query.user }
        if (req.query.tipousuario == "3") { query = "SELECT * FROM iam_encuesta180 WHERE IdUsuario = " + req.query.user }
        if (req.query.tipousuario == "4") { query = "SELECT * FROM iam_encuesta270 WHERE IdUsuario = " + req.query.user }
        if (req.query.tipousuario == "5") { query = "SELECT * FROM iam_encuesta360 WHERE IdUsuario = " + req.query.user }

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "El usuario no tiene encuesta." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const actualizar_encuesta = async (req, res) => {
    try {
        const data = req.body
        let query = ""

        if (data.TipoUsuario == 2) {
            query = "UPDATE iam_encuesta90 SET "

            for (let i in data.Respuestas) {
                query += i + " = " + data.Respuestas[i] + ", "
            }

            query += " Pregunta" + data.Pagina + " = 'S' WHERE IdUsuario = " + data.Id
        }
        if (data.TipoUsuario == 3) {
            query = "UPDATE iam_encuesta180 SET "

            for (let i in data.Respuestas) {
                query += i + " = " + data.Respuestas[i] + ", "
            }

            query += " Pregunta" + data.Pagina + " = 'S' WHERE IdUsuario = " + data.Id
        }
        if (data.TipoUsuario == 4) {
            query = "UPDATE iam_encuesta270 SET "

            for (let i in data.Respuestas) {
                query += i + " = " + data.Respuestas[i] + ", "
            }

            query += " Pregunta" + data.Pagina + " = 'S' WHERE IdUsuario = " + data.Id
        }
        if (data.TipoUsuario == 5) {
            query = "UPDATE iam_encuesta360 SET "

            for (let i in data.Respuestas) {
                query += i + " = " + data.Respuestas[i] + ", "
            }

            query += " Pregunta" + data.Pagina + " = 'S' WHERE IdUsuario = " + data.Id
        }

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                res.status(200).json("OK")
            }
        })
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const datos_usuario = async (req, res) => {
    try {
        let query = "SELECT A.nombre, A.Correo, A.TipoUsuario, A.Version, B.* FROM cadomec_innovactionmeter.iam_usuarios as A INNER JOIN cadomec_innovactionmeter.iam_empresa as B ON A.IdEmpresa = B.IdEmpresa WHERE A.Id = " + req.query.user
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const resultados_innovacion = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)
        let query = ``
        let where = ``
        let grupo = ``

        if (empresa == 0) {
            grupo = " AND A.IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND A.IdEmpresa = " + empresa + ") AS C; "
        }
        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 as A `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 as A `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 as A `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 as A `
        }
        //CAMBIAR a 5 OPCION 4
        query = `
            SELECT
            ROUND(SUM(C.0) / COUNT(*),1) AS '0',
            ROUND(SUM(C.1) / COUNT(*),1) AS '1',
            ROUND(SUM(C.2) / COUNT(*),1) AS '2',
            ROUND(SUM(C.3) / COUNT(*),1) AS '3',
            ROUND(SUM(C.4) / COUNT(*),1) AS '4',
            ROUND(SUM(C.5) / COUNT(*),1) AS '5'
            FROM (
            SELECT (
            CASE 
            WHEN Pregunta3_1 = 1 THEN 1
            WHEN Pregunta3_1 = 2 THEN 5
            WHEN Pregunta3_1 = 3 THEN 10
            WHEN Pregunta3_1 = 4 THEN 5
            ELSE 0
            END) AS '0',
            (
            CASE 
            WHEN Pregunta3_3 = 1 THEN 1
            WHEN Pregunta3_3 = 2 THEN 5
            WHEN Pregunta3_3 = 3 THEN 10
            WHEN Pregunta3_3 = 4 THEN 5
            ELSE 0
            END) AS '1',
            (
            CASE 
            WHEN Pregunta3_4 = 1 THEN 1
            WHEN Pregunta3_4 = 2 THEN 5
            WHEN Pregunta3_4 = 3 THEN 10
            WHEN Pregunta3_4 = 4 THEN 5
            ELSE 0
            END) AS '2',
            (
            CASE 
            WHEN Pregunta3_5 = 1 THEN 1
            WHEN Pregunta3_5 = 2 THEN 5
            WHEN Pregunta3_5 = 3 THEN 10
            WHEN Pregunta3_5 = 4 THEN 5
            ELSE 0
            END) AS '3',
            (
            CASE 
            WHEN Pregunta3_2 = 1 THEN 1
            WHEN Pregunta3_2 = 2 THEN 5
            WHEN Pregunta3_2 = 3 THEN 10
            WHEN Pregunta3_2 = 4 THEN 5
            ELSE 0
            END) AS '4',
            (
            CASE 
            WHEN Pregunta3_6 = 1 THEN 1
            WHEN Pregunta3_6 = 2 THEN 5
            WHEN Pregunta3_6 = 3 THEN 10
            WHEN Pregunta3_6 = 4 THEN 5
            ELSE 0
            END) AS '5'`
            + where +
            `WHERE A.Pregunta3 = 'S'`
            + grupo            

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const proposito = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)
        let query = ``
        let where = ``
        let grupo = ``

        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 as A `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 as A `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 as A `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 as A `
        }

        if (empresa == 0) {
            grupo = " AND A.IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND A.IdEmpresa = " + empresa + ") AS C; "
        }

        query = `
            SELECT
            ROUND(SUM(C.1) / COUNT(*),1) AS '1',
            ROUND(SUM(C.2) / COUNT(*),1) AS '2',
            ROUND(SUM(C.3) / COUNT(*),1) AS '3',
            ROUND(SUM(C.4) / COUNT(*),1) AS '4'
            FROM (
            SELECT (
            CASE 
            WHEN Pregunta4_1 = 1 THEN 1
            WHEN Pregunta4_1 = 2 THEN 4
            WHEN Pregunta4_1 = 3 THEN 7
            WHEN Pregunta4_1 = 4 THEN 10
            ELSE 0
            END) AS '1',
            (
            CASE 
            WHEN Pregunta4_2 = 1 THEN 1
            WHEN Pregunta4_2 = 2 THEN 4
            WHEN Pregunta4_2 = 3 THEN 7
            WHEN Pregunta4_2 = 4 THEN 10
            ELSE 0
            END) AS '2',
            (
            CASE 
            WHEN Pregunta4_3 = 1 THEN 1
            WHEN Pregunta4_3 = 2 THEN 4
            WHEN Pregunta4_3 = 3 THEN 7
            WHEN Pregunta4_3 = 4 THEN 10
            ELSE 0
            END) AS '3',
            (
            CASE 
            WHEN Pregunta2_5 = 1 THEN 10
            WHEN Pregunta2_5 = 2 THEN 5
            WHEN Pregunta2_5 = 3 THEN 1
            ELSE 0
            END) AS '4'`
            + where +
            `WHERE A.Pregunta2 = 'S' AND A.Pregunta4 = 'S'`
            + grupo

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const liderazgo = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)
        let query = ``
        let where = ``
        let grupo = ``

        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 as A `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 as A `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 as A `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 as A `
        }

        if (empresa == 0) {
            grupo = " AND A.IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND A.IdEmpresa = " + empresa + ") AS C; "
        }


        query = `
            SELECT
            ROUND(SUM(C.1) / COUNT(*),1) AS '1',
            ROUND(SUM(C.2) / COUNT(*),1) AS '2',
            ROUND(SUM(C.3) / COUNT(*),1) AS '3',
            ROUND(SUM(C.4) / COUNT(*),1) AS '4'
            FROM (
            SELECT (
            CASE 
            WHEN Pregunta4_4 = 1 THEN 1
            WHEN Pregunta4_4 = 2 THEN 4
            WHEN Pregunta4_4 = 3 THEN 7
            WHEN Pregunta4_4 = 4 THEN 10
            ELSE 0
            END) AS '1',
            (
            CASE 
            WHEN Pregunta4_5 = 1 THEN 1
            WHEN Pregunta4_5 = 2 THEN 4
            WHEN Pregunta4_5 = 3 THEN 7
            WHEN Pregunta4_5 = 4 THEN 10
            ELSE 0
            END) AS '2',
            (
            CASE 
            WHEN Pregunta4_6 = 1 THEN 1
            WHEN Pregunta4_6 = 2 THEN 4
            WHEN Pregunta4_6 = 3 THEN 7
            WHEN Pregunta4_6 = 4 THEN 10
            ELSE 0
            END) AS '3',
            (
            CASE 
            WHEN Pregunta4_7 = 1 THEN 1
            WHEN Pregunta4_7 = 2 THEN 4
            WHEN Pregunta4_7 = 3 THEN 7
            WHEN Pregunta4_7 = 4 THEN 10
            ELSE 0
            END) AS '4'`
            + where +
            `WHERE A.Pregunta4 = 'S'`
            + grupo

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const estructuras_habilitadoras = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)
        let query = ``
        let where = ``
        let grupo = ``

        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 as A `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 as A `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 as A `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 as A `
        }

        if (empresa == 0) {
            grupo = " AND A.IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND A.IdEmpresa = " + empresa + ") AS C; "
        }

        if (tipo === 4 || tipo === 5) {
            query = `
                SELECT
                CASE
                WHEN SUM(C.3) = 0 THEN ROUND(((SUM(C.1) + SUM(C.2)) / 2) / COUNT(*),1)
                ELSE ROUND(((SUM(C.1) + SUM(C.2) + SUM(C.3)) / 3) / COUNT(*),1)
                END AS '1',
                ROUND(SUM(C.4) / COUNT(*),1) AS '2',
                ROUND(((SUM(C.5) + SUM(C.6) + SUM(C.7)) / 3) / COUNT(*),1) as '3',
                ROUND(((SUM(C.8) + SUM(C.9) + SUM(C.10)) / 3) / COUNT(*),1) as '4'
                FROM (
                SELECT (
                CASE 
                WHEN Pregunta5_1 = 1 THEN 1
                WHEN Pregunta5_1 = 2 THEN 4
                WHEN Pregunta5_1 = 3 THEN 7
                WHEN Pregunta5_1 = 4 THEN 10
                ELSE 0
                END) AS '1',
                (
                CASE 
                WHEN Pregunta5_2 = 1 THEN 1
                WHEN Pregunta5_2 = 2 THEN 4
                WHEN Pregunta5_2 = 3 THEN 7
                WHEN Pregunta5_2 = 4 THEN 10
                ELSE 0
                END) AS '2',
                (
                CASE 
                WHEN Pregunta5_3 = 1 THEN 1
                WHEN Pregunta5_3 = 2 THEN 4
                WHEN Pregunta5_3 = 3 THEN 7
                WHEN Pregunta5_3 = 4 THEN 10
                ELSE 0
                END) AS '3',
                (
                CASE 
                WHEN Pregunta5_4 = 1 THEN 1
                WHEN Pregunta5_4 = 2 THEN 4
                WHEN Pregunta5_4 = 3 THEN 7
                WHEN Pregunta5_4 = 4 THEN 10
                ELSE 0
                END) AS '4',
                (
                CASE 
                WHEN Pregunta5_5 = 1 THEN 1
                WHEN Pregunta5_5 = 2 THEN 4
                WHEN Pregunta5_5 = 3 THEN 7
                WHEN Pregunta5_5 = 4 THEN 10
                ELSE 0
                END) AS '5',
                (
                CASE 
                WHEN Pregunta5_6 = 1 THEN 1
                WHEN Pregunta5_6 = 2 THEN 4
                WHEN Pregunta5_6 = 3 THEN 7
                WHEN Pregunta5_6 = 4 THEN 10
                ELSE 0
                END) AS '6',
                (
                CASE 
                WHEN Pregunta5_7 = 1 THEN 1
                WHEN Pregunta5_7 = 2 THEN 4
                WHEN Pregunta5_7 = 3 THEN 7
                WHEN Pregunta5_7 = 4 THEN 10
                ELSE 0
                END) AS '7',
                (
                CASE 
                WHEN Pregunta5_8 = 1 THEN 1
                WHEN Pregunta5_8 = 2 THEN 4
                WHEN Pregunta5_8 = 3 THEN 7
                WHEN Pregunta5_8 = 4 THEN 10
                ELSE 0
                END) AS '8',
                (
                CASE 
                WHEN Pregunta5_9 = 1 THEN 1
                WHEN Pregunta5_9 = 2 THEN 4
                WHEN Pregunta5_9 = 3 THEN 7
                WHEN Pregunta5_9 = 4 THEN 10
                ELSE 0
                END) AS '9',
                (
                CASE 
                WHEN Pregunta5_10 = 1 THEN 1
                WHEN Pregunta5_10 = 2 THEN 4
                WHEN Pregunta5_10 = 3 THEN 7
                WHEN Pregunta5_10 = 4 THEN 10
                ELSE 0
                END) AS '10'`
                + where +
                `WHERE A.Pregunta5 = 'S'`
                + grupo
        } else {
            query = `
                SELECT
                CASE 
                WHEN SUM(C.11) = 0 THEN ROUND(((SUM(C.9) + SUM(C.10)) / 2) / COUNT(*),1) 
                ELSE ROUND(((SUM(C.9) + SUM(C.10)  + SUM(C.11)) / 3) / COUNT(*),1) 
                END AS '1', 
                ROUND(((SUM(C.1) + SUM(C.2)) / 2) / COUNT(*),1) AS '2',
                ROUND(((SUM(C.3) + SUM(C.4) + SUM(C.5)) / 3) / COUNT(*),1) AS '3',
                ROUND(((SUM(C.6) + SUM(C.7) + SUM(C.8)) / 3) / COUNT(*),1) AS '4'            
                FROM (
                SELECT (
                CASE 
                WHEN Pregunta5_1 = 1 THEN 1
                WHEN Pregunta5_1 = 2 THEN 4
                WHEN Pregunta5_1 = 3 THEN 7
                WHEN Pregunta5_1 = 4 THEN 10
                ELSE 0
                END) AS '1',
                (
                CASE 
                WHEN Pregunta5_2 = 1 THEN 1
                WHEN Pregunta5_2 = 2 THEN 4
                WHEN Pregunta5_2 = 3 THEN 7
                WHEN Pregunta5_2 = 4 THEN 10
                ELSE 0
                END) AS '2',
                (
                CASE 
                WHEN Pregunta5_3 = 1 THEN 1
                WHEN Pregunta5_3 = 2 THEN 4
                WHEN Pregunta5_3 = 3 THEN 7
                WHEN Pregunta5_3 = 4 THEN 10
                ELSE 0
                END) AS '3',
                (
                CASE 
                WHEN Pregunta5_4 = 1 THEN 1
                WHEN Pregunta5_4 = 2 THEN 4
                WHEN Pregunta5_4 = 3 THEN 7
                WHEN Pregunta5_4 = 4 THEN 10
                ELSE 0
                END) AS '4',
                (
                CASE 
                WHEN Pregunta5_5 = 1 THEN 1
                WHEN Pregunta5_5 = 2 THEN 4
                WHEN Pregunta5_5 = 3 THEN 7
                WHEN Pregunta5_5 = 4 THEN 10
                ELSE 0
                END) AS '5',
                (
                CASE 
                WHEN Pregunta5_6 = 1 THEN 1
                WHEN Pregunta5_6 = 2 THEN 4
                WHEN Pregunta5_6 = 3 THEN 7
                WHEN Pregunta5_6 = 4 THEN 10
                ELSE 0
                END) AS '6',
                (
                CASE 
                WHEN Pregunta5_7 = 1 THEN 1
                WHEN Pregunta5_7 = 2 THEN 4
                WHEN Pregunta5_7 = 3 THEN 7
                WHEN Pregunta5_7 = 4 THEN 10
                ELSE 0
                END) AS '7',
                (
                CASE 
                WHEN Pregunta5_8 = 1 THEN 1
                WHEN Pregunta5_8 = 2 THEN 4
                WHEN Pregunta5_8 = 3 THEN 7
                WHEN Pregunta5_8 = 4 THEN 10
                ELSE 0
                END) AS '8',
                (
                CASE 
                WHEN Pregunta5_9 = 1 THEN 1
                WHEN Pregunta5_9 = 2 THEN 4
                WHEN Pregunta5_9 = 3 THEN 7
                WHEN Pregunta5_9 = 4 THEN 10
                ELSE 0
                END) AS '9',
                (
                CASE 
                WHEN Pregunta5_10 = 1 THEN 1
                WHEN Pregunta5_10 = 2 THEN 4
                WHEN Pregunta5_10 = 3 THEN 7
                WHEN Pregunta5_10 = 4 THEN 10
                ELSE 0
                END) AS '10',
                (
                CASE 
                WHEN Pregunta5_11 = 1 THEN 1
                WHEN Pregunta5_11 = 2 THEN 4
                WHEN Pregunta5_11 = 3 THEN 7
                WHEN Pregunta5_11 = 4 THEN 10
                ELSE 0
                END) AS '11'`
                + where +
                `WHERE A.Pregunta5 = 'S'`
                + grupo
        }

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

sistemas_consistentes = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)
        let query = ``
        let where = ``
        let grupo = ``

        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 as A `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 as A `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 as A `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 as A `
        }

        if (empresa == 0) {
            grupo = " AND A.IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND A.IdEmpresa = " + empresa + ") AS C; "
        }


        query = `
            SELECT
            ROUND(SUM(C.1) / COUNT(*),1) AS '1',
            ROUND(((SUM(C.2) + SUM(C.3)) / 2) / COUNT(*),1) AS '2',
            ROUND(((SUM(C.5) + SUM(C.6)) / 2) / COUNT(*),1) AS '3',
            ROUND(((SUM(C.4) + SUM(C.7)) / 2) / COUNT(*),1) AS '4'            
            FROM (
            SELECT (
            CASE 
            WHEN Pregunta7_1 = 1 THEN 1
            WHEN Pregunta7_1 = 2 THEN 4
            WHEN Pregunta7_1 = 3 THEN 7
            WHEN Pregunta7_1 = 4 THEN 10
            ELSE 0
            END) AS '1',
            (
            CASE 
            WHEN Pregunta7_2 = 1 THEN 1
            WHEN Pregunta7_2 = 2 THEN 4
            WHEN Pregunta7_2 = 3 THEN 7
            WHEN Pregunta7_2 = 4 THEN 10
            ELSE 0
            END) AS '2',
            (
            CASE 
            WHEN Pregunta7_3 = 1 THEN 1
            WHEN Pregunta7_3 = 2 THEN 4
            WHEN Pregunta7_3 = 3 THEN 7
            WHEN Pregunta7_3 = 4 THEN 10
            ELSE 0
            END) AS '3',
            (
            CASE 
            WHEN Pregunta7_4 = 1 THEN 1
            WHEN Pregunta7_4 = 2 THEN 4
            WHEN Pregunta7_4 = 3 THEN 7
            WHEN Pregunta7_4 = 4 THEN 10
            ELSE 0
            END) AS '4',
            (
            CASE 
            WHEN Pregunta7_5 = 1 THEN 1
            WHEN Pregunta7_5 = 2 THEN 4
            WHEN Pregunta7_5 = 3 THEN 7
            WHEN Pregunta7_5 = 4 THEN 10
            ELSE 0
            END) AS '5',
            (
            CASE 
            WHEN Pregunta7_6 = 1 THEN 1
            WHEN Pregunta7_6 = 2 THEN 4
            WHEN Pregunta7_6 = 3 THEN 7
            WHEN Pregunta7_6 = 4 THEN 10
            ELSE 0
            END) AS '6',
            (
            CASE 
            WHEN Pregunta7_7 = 1 THEN 1
            WHEN Pregunta7_7 = 2 THEN 4
            WHEN Pregunta7_7 = 3 THEN 7
            WHEN Pregunta7_7 = 4 THEN 10
            ELSE 0
            END) AS '7'`
            + where +
            `WHERE A.Pregunta7 = 'S'`
            + grupo

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}


cultura_conectada = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)
        let query = ``
        let where = ``
        let grupo = ``

        if (empresa == 0) {
            grupo = " AND A.IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND A.IdEmpresa = " + empresa + ") AS C; "
        }


        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 as A `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 as A `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 as A `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 as A `
        }
        query = `
            SELECT
            ROUND(SUM(C.1) / COUNT(*),1) AS '1',
            ROUND(SUM(C.2) / COUNT(*),1) AS '2',
            CASE
            WHEN SUM(C.5) = 0 THEN ROUND(SUM(C.3) / COUNT(*),1)
            ELSE ROUND(((SUM(C.3) + SUM(C.5)) / 2) / COUNT(*),1)
            END AS '3',
            ROUND(SUM(C.4) / COUNT(*),1) AS '4'
            FROM (
            SELECT (
            CASE 
            WHEN Pregunta6_1 = 1 THEN 1
            WHEN Pregunta6_1 = 2 THEN 4
            WHEN Pregunta6_1 = 3 THEN 7
            WHEN Pregunta6_1 = 4 THEN 10
            ELSE 0
            END) AS '1',
            (
            CASE 
            WHEN Pregunta6_2 = 1 THEN 1
            WHEN Pregunta6_2 = 2 THEN 4
            WHEN Pregunta6_2 = 3 THEN 7
            WHEN Pregunta6_2 = 4 THEN 10
            ELSE 0
            END) AS '2',
            (
            CASE 
            WHEN Pregunta6_3 = 1 THEN 1
            WHEN Pregunta6_3 = 2 THEN 4
            WHEN Pregunta6_3 = 3 THEN 7
            WHEN Pregunta6_3 = 4 THEN 10
            ELSE 0
            END) AS '3',
            (
            CASE 
            WHEN Pregunta6_4 = 1 THEN 1
            WHEN Pregunta6_4 = 2 THEN 4
            WHEN Pregunta6_4 = 3 THEN 7
            WHEN Pregunta6_4 = 4 THEN 10
            ELSE 0
            END) AS '4',
            (
            CASE 
            WHEN Pregunta6_5 = 1 THEN 1
            WHEN Pregunta6_5 = 2 THEN 4
            WHEN Pregunta6_5 = 3 THEN 7
            WHEN Pregunta6_5 = 4 THEN 10
            ELSE 0
            END) AS '5'`
            + where +
            `WHERE A.Pregunta6 = 'S'`
            + grupo

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const lista_reporte_administrador = async (req, res) => {
    try {
        let query = `
        SELECT 
        A.IdEmpresa,
        A.NombreEmpresa,
        2 as 'Tipo',
        'Equipo Gerencial 90°' as titulo,
        (SELECT COUNT(*) FROM iam_usuarios WHERE TipoUsuario = 2 AND IdEmpresa = A.IdEmpresa) as total,
        (SELECT COUNT(*) FROM iam_encuesta90 as B WHERE B.IdEmpresa = A.IdEmpresa AND B.Pregunta1 = 'S' AND B.Pregunta2 = 'S' AND B.Pregunta3 = 'S' AND B.Pregunta4 = 'S' AND B.Pregunta5 = 'S' AND B.Pregunta6 = 'S' AND B.Pregunta7 = 'S') as total_contestado
        FROM iam_empresa A WHERE A.Encuesta90 = 'S' AND A.IdEmpresa = ` + req.query.id_empresa + `
        UNION ALL
        SELECT 
        A.IdEmpresa,
        A.NombreEmpresa,
        3 as 'Tipo',
        'Colaboradores 180°' as titulo,
        (SELECT COUNT(*) FROM iam_usuarios WHERE TipoUsuario = 3 AND IdEmpresa = A.IdEmpresa) as total,
        (SELECT COUNT(*) FROM iam_encuesta180 as B WHERE B.IdEmpresa = A.IdEmpresa AND B.Pregunta1 = 'S' AND B.Pregunta2 = 'S' AND B.Pregunta3 = 'S' AND B.Pregunta4 = 'S' AND B.Pregunta5 = 'S' AND B.Pregunta6 = 'S' AND B.Pregunta7 = 'S') as total_contestado
        FROM iam_empresa A WHERE A.Encuesta180 = 'S' AND A.IdEmpresa = ` + req.query.id_empresa + `
        UNION ALL
        SELECT 
        A.IdEmpresa,
        A.NombreEmpresa,
        4 as 'Tipo',
        'Proveedores 270°' as titulo,
        (SELECT COUNT(*) FROM iam_usuarios WHERE TipoUsuario = 4 AND IdEmpresa = A.IdEmpresa) as total,
        (SELECT COUNT(*) FROM iam_encuesta270 as B WHERE B.IdEmpresa = A.IdEmpresa AND B.Pregunta1 = 'S' AND B.Pregunta2 = 'S' AND B.Pregunta3 = 'S' AND B.Pregunta4 = 'S' AND B.Pregunta5 = 'S' AND B.Pregunta6 = 'S' AND B.Pregunta7 = 'S') as total_contestado
        FROM iam_empresa A WHERE A.Encuesta270 = 'S' AND A.IdEmpresa = ` + req.query.id_empresa + `
        UNION ALL
        SELECT 
        A.IdEmpresa,
        A.NombreEmpresa,
        5 as 'Tipo',
        'Clientes 360°' as titulo,
        (SELECT COUNT(*) FROM iam_usuarios WHERE TipoUsuario = 5 AND IdEmpresa = A.IdEmpresa) as total,
        (SELECT COUNT(*) FROM iam_encuesta360 as B WHERE B.IdEmpresa = A.IdEmpresa AND B.Pregunta1 = 'S' AND B.Pregunta2 = 'S' AND B.Pregunta3 = 'S' AND B.Pregunta4 = 'S' AND B.Pregunta5 = 'S' AND B.Pregunta6 = 'S' AND B.Pregunta7 = 'S') as total_contestado
        FROM iam_empresa A WHERE A.Encuesta360 = 'S' AND A.IdEmpresa = ` + req.query.id_empresa + `
        `
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result)
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}


const lista_reporte_empleado = async (req, res) => {
    const empresa = parseInt(req.query.empresa)
    const tipo = parseInt(req.query.tipo)

    let tabla = ""

    if (tipo === 2) {
        tabla = " iam_encuesta90 A "
    }
    if (tipo === 3) {
        tabla = " iam_encuesta180 A "
    }
    if (tipo === 4) {
        tabla = " iam_encuesta270 A "
    }
    if (tipo === 5) {
        tabla = " iam_encuesta360 A "
    }
    try {
        let query = `
        SELECT B.Id, B.Nombre, B.TipoUsuario, C.NombreEmpresa
        FROM 
        ` + tabla + `
        INNER JOIN iam_usuarios B ON A.IdUsuario = B.Id
        INNER JOIN iam_empresa C ON A.IdEmpresa = C.IdEmpresa
        WHERE A.IdEmpresa = ` + empresa + `
        AND A.Pregunta1 = 'S' AND A.Pregunta2 = 'S' AND A.Pregunta3 = 'S' AND A.Pregunta4 = 'S' AND A.Pregunta5 = 'S' AND A.Pregunta6 = 'S' AND A.Pregunta7 = 'S'
         `
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result)
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const datos_empresa = async (req, res) => {
    try {
        let query = `
        SELECT A.*, B.Correo as correo_contacto FROM cadomec_innovactionmeter.iam_empresa as A
        INNER JOIN iam_usuarios B on A.IdEmpresa = B.IdEmpresa
        WHERE A.IdEmpresa = ` + req.query.id +
            ` AND B.TipoUsuario = 88 AND B.Correo != "" LIMIT 1;
        `
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const total_encuestas_empresas = async (req, res) => {
    try {
        const tipo = req.query.tipo
        let tabla = ""

        if (tipo == 2) {
            tabla = " iam_encuesta90 "
        }
        if (tipo == 3) {
            tabla = " iam_encuesta180 "
        }
        if (tipo == 4) {
            tabla = " iam_encuesta270 "
        }
        if (tipo == 5) {
            tabla = " iam_encuesta360 "
        }

        let query = `
        SELECT A.IdEmpresa ,A.NombreEmpresa, A.Sigla,
        (SELECT COUNT(*) FROM ` + tabla + ` C WHERE C.IdEmpresa = A.IdEmpresa AND C.Pregunta1 = 'S' AND C.Pregunta2 = 'S' AND C.Pregunta3 = 'S' AND C.Pregunta4 = 'S' AND C.Pregunta5 = 'S' AND C.Pregunta6 = 'S' AND C.Pregunta7 = 'S' ) as total_contestado,
        (SELECT COUNT(*) FROM iam_usuarios B WHERE B.IdEmpresa = A.IdEmpresa AND B.TipoUsuario = ` + tipo + `) as total
        FROM 
        iam_empresa A 
        WHERE 
        A.Encuesta90 = 'S'
        ORDER BY A.NombreEmpresa;
        `
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result)
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}


const tool_tips_data = async (req, res) => {
    try {
        const usuario = parseInt(req.query.user)
        const empresa = parseInt(req.query.empresa)
        const tipo = parseInt(req.query.tipo)

        let query = ``
        let where = ``
        let grupo = ``

        if (empresa == 0) {
            grupo = " AND IdUsuario = " + usuario + ") AS C; "
        } else {
            grupo = " AND IdEmpresa = " + empresa + ") AS C; "
        }
        if (tipo === 2) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta90 `
        }
        if (tipo === 3) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta180 `
        }
        if (tipo === 4) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta270 `
        }
        if (tipo === 5) {
            where = ` FROM cadomec_innovactionmeter.iam_encuesta360 `
        }
        //CAMBIAR a 1 OPCION 4        
        query = `        
        SELECT
        CONCAT("0", "|", "0", "|", ROUND(SUM(C.0),1), "|", "¿Cuál cree que ha sido el impacto de la innovación en los INGRESOS de su empresa en los últimos 3 años?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("0", "|", "1", "|", ROUND(SUM(C.1),1), "|", "¿Cuál cree que ha sido el impacto de la innovación en la REDUCCIÓN DE COSTOS Y GASTOS de su empresa en los últimos 3 años?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("0", "|", "2", "|", ROUND(SUM(C.2),1), "|", "¿Cuál cree que ha sido el impacto de la innovación en la RENTABILIDAD de su empresa respecto en los últimos 3 años?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("0", "|", "3", "|", ROUND(SUM(C.3),1), "|", "¿Cuál cree que ha sido el impacto de la innovación en el CAMBIO DE MODELO DE NEGOCIO de su empresa en los últimos 3 años?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("0", "|", "4", "|", ROUND(SUM(C.4),1), "|", "¿Cuál cree que ha sido el impacto de la innovación en la SATISFACCIÓN DEL CLIENTE de su empresa en los últimos 3 años?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("0", "|", "5", "|", ROUND(SUM(C.5),1), "|", "¿Cuál cree que ha sido el impacto de la innovación en la SOSTENIBILIDAD de su empresa en los últimos 3 años?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("1", "|", "0", "|", ROUND(SUM(C.6),1), "|", "El concepto de innovación en la empresa es conocido y compartido por todos.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("1", "|", "1", "|", ROUND(SUM(C.7),1), "|", "La innovación está integrada a nuestros objetivos y estrategias de negocio, por lo que el quehacer de la innovación está integrado en nuestro día a día.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("1", "|", "2", "|", ROUND(SUM(C.8),1), "|", "Tenemos desafíos potentes que requieren soluciones innovadoras para alcanzar las metas que nos hemos propuesto.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("1", "|", "3", "|", ROUND(SUM(C.9),1), "|", "¿Cuál de las siguientes alternativas representa mejor la conexión entre la estrategia de su empresa y la innovación?", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("2", "|", "0", "|", ROUND(SUM(C.10),1), "|", "Consideramos que para innovar hay que aprender de los errores, por lo que contemplamos formas de levantar y asimilar oportunidades de aprendizajes de los errores cometidos.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("2", "|", "1", "|", ROUND(SUM(C.11),1), "|", "Contamos con un modelo de cómo gestionar la innovación con herramientas y técnicas para mejorar constantemente la forma en que innovamos.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("2", "|", "2", "|", ROUND(SUM(C.12),1), "|", "Las responsabilidades y los recursos respecto de la innovación están claramente definidos.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("2", "|", "3", "|", ROUND(SUM(C.13),1), "|", "Existe en la empresa un ambiente de mutua comunicación y colaboración que fomenta la innovación conjunta entre las áreas.", "|", CAST(COUNT(*) AS CHAR(2))),`

        if (tipo === 2 || tipo === 3) {
            query += `
        CONCAT("3", "|", "0", "|", ROUND(SUM(C.22),1), "|", "Co-Creación: Creamos soluciones, proyectos y negocios con nuestros proveedores y aliados", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "0", "|", ROUND(SUM(C.23),1), "|", "Co-Creación: Tenemos un canal de interacción, con los debidos responsables, que nos permite co-crear con nuestros proveedores y clientes.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "0", "|", ROUND(SUM(C.24),1), "|", "Co-Creación: Tenemos un canal de interacción, con los debidos responsables, que nos permite co-crear con nuestra comunidad.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "1", "|", ROUND(SUM(C.14),1), "|", "Talentos: Seleccionamos, desarrollamos y retenemos personas con alto potencial innovador.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "1", "|", ROUND(SUM(C.15),1), "|", "Talentos: Reconocemos pública y monetariamente los logros de innovación de la organización, equipos y personas.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "2", "|", ROUND(SUM(C.16),1), "|", "Recursos: Asignamos personas a lo largo de la organización para trabajar en tareas de innovación.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "2", "|", ROUND(SUM(C.17),1), "|", "Recursos: Contamos con presupuestos para innovación lo que nos permite crear valor nuevo a nuestros clientes.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "2", "|", ROUND(SUM(C.18),1), "|", "Recursos: Utilizamos tecnologías de comunicación e información para gestionar la innovación en la empresa.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "3", "|", ROUND(SUM(C.19),1), "|", "Procesos: Contamos con procesos y actividades definidos para innovar en la empresa.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "3", "|", ROUND(SUM(C.20),1), "|", "Procesos: Tenemos indicadores que permiten medir el desempeño de nuestra innovación.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "3", "|", ROUND(SUM(C.21),1), "|", "Procesos: Tenemos criterios, instancias y responsables claros para tomar decisiones respecto a los proyectos de innovación.", "|", CAST(COUNT(*) AS CHAR(2))),`
        } else {
            query += `
        CONCAT("3", "|", "0", "|", ROUND(SUM(C.14),1), "|", "Co-Creación: Creamos soluciones, proyectos y negocios con nuestros proveedores y aliados", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "0", "|", ROUND(SUM(C.15),1), "|", "Co-Creación: Tenemos un canal de interacción, con los debidos responsables, que nos permite co-crear con nuestros proveedores y clientes.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "0", "|", ROUND(SUM(C.16),1), "|", "Co-Creación: Tenemos un canal de interacción, con los debidos responsables, que nos permite co-crear con nuestra comunidad.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "1", "|", ROUND(SUM(C.17),1), "|", "Talentos: Seleccionamos, desarrollamos y retenemos personas con alto potencial innovador.", "|", CAST(COUNT(*) AS CHAR(2))),        
        CONCAT("3", "|", "2", "|", ROUND(SUM(C.18),1), "|", "Recursos: Asignamos personas a lo largo de la organización para trabajar en tareas de innovación.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "2", "|", ROUND(SUM(C.19),1), "|", "Recursos: Contamos con presupuestos para innovación lo que nos permite crear valor nuevo a nuestros clientes.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "2", "|", ROUND(SUM(C.20),1), "|", "Recursos: Utilizamos tecnologías de comunicación e información para gestionar la innovación en la empresa.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "3", "|", ROUND(SUM(C.21),1), "|", "Procesos: Contamos con procesos y actividades definidos para innovar en la empresa.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "3", "|", ROUND(SUM(C.22),1), "|", "Procesos: Tenemos indicadores que permiten medir el desempeño de nuestra innovación.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("3", "|", "3", "|", ROUND(SUM(C.23),1), "|", "Procesos: Tenemos criterios, instancias y responsables claros para tomar decisiones respecto a los proyectos de innovación.", "|", CAST(COUNT(*) AS CHAR(2))),`
        }
        query += `
        CONCAT("4", "|", "0", "|", ROUND(SUM(C.25),1), "|", "Contamos con herramientas o métodos para identificar necesidades de clientes y consumidores.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("4", "|", "1", "|", ROUND(SUM(C.26),1), "|", "Contamos con herramientas o métodos para generar ideas, diseñar y desarrollar soluciones a las necesidades de clientes y consumidores a nivel Productos, Servicios, Canales.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("4", "|", "1", "|", ROUND(SUM(C.27),1), "|", "Contamos con herramientas o métodos para prototipear y testear soluciones.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("4", "|", "2", "|", ROUND(SUM(C.29),1), "|", "Contamos con herramientas o métodos para desarrollar el plan de negocio.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("4", "|", "2", "|", ROUND(SUM(C.30),1), "|", "Contamos con herramientas o métodos para estudiar la factibilidad y riesgos de proyectos.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("4", "|", "3", "|", ROUND(SUM(C.28),1), "|", "Contamos con herramientas o métodos para compartir aprendizajes, rediseñar y/o reformular proyectos de innovación.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("4", "|", "3", "|", ROUND(SUM(C.31),1), "|", "Contamos con herramientas o métodos para la implementación de proyectos y gestión del cambio.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("5", "|", "0", "|", ROUND(SUM(C.32),1), "|", "Cuando ocurren cambios repentinos, reaccionamos con apertura hacia lo nuevo.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("5", "|", "1", "|", ROUND(SUM(C.33),1), "|", "Todos tenemos responsabilidades para conocer y satisfacer las necesidades de clientes y consumidores.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("5", "|", "2", "|", ROUND(SUM(C.34),1), "|", "Somos flexibles ante los cambios que ocurren en la empresa y sus mercados.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("5", "|", "3", "|", ROUND(SUM(C.35),1), "|", "Aceptamos e incorporamos las fallas como algo necesario para aprender e Innovar.", "|", CAST(COUNT(*) AS CHAR(2))),
        CONCAT("5", "|", "2", "|", ROUND(SUM(C.36),1), "|", "Somos flexibles ante los cambios que ocurren en la sociedad.", "|", CAST(COUNT(*) AS CHAR(2)))
        FROM (
        SELECT (
        CASE 
        WHEN Pregunta3_1 = 1 THEN 1
        WHEN Pregunta3_1 = 2 THEN 5
        WHEN Pregunta3_1 = 3 THEN 10
        WHEN Pregunta3_1 = 4 THEN 5
        ELSE 0
        END) AS '0',
        (
        CASE 
        WHEN Pregunta3_3 = 1 THEN 1
        WHEN Pregunta3_3 = 2 THEN 5
        WHEN Pregunta3_3 = 3 THEN 10
        WHEN Pregunta3_3 = 4 THEN 5
        ELSE 0
        END) AS '1',
        (
        CASE 
        WHEN Pregunta3_4 = 1 THEN 1
        WHEN Pregunta3_4 = 2 THEN 5
        WHEN Pregunta3_4 = 3 THEN 10
        WHEN Pregunta3_4 = 4 THEN 5
        ELSE 0
        END) AS '2',
        (
        CASE 
        WHEN Pregunta3_5 = 1 THEN 1
        WHEN Pregunta3_5 = 2 THEN 5
        WHEN Pregunta3_5 = 3 THEN 10
        WHEN Pregunta3_5 = 4 THEN 5
        ELSE 0
        END) AS '3',
        (
        CASE 
        WHEN Pregunta3_2 = 1 THEN 1
        WHEN Pregunta3_2 = 2 THEN 5
        WHEN Pregunta3_2 = 3 THEN 10
        WHEN Pregunta3_2 = 4 THEN 5
        ELSE 0
        END) AS '4',
        (
        CASE 
        WHEN Pregunta3_6 = 1 THEN 1
        WHEN Pregunta3_6 = 2 THEN 5
        WHEN Pregunta3_6 = 3 THEN 10
        WHEN Pregunta3_6 = 4 THEN 5
        ELSE 0
        END) AS '5',
        (
        CASE 
        WHEN Pregunta4_1 = 1 THEN 1
        WHEN Pregunta4_1 = 2 THEN 4
        WHEN Pregunta4_1 = 3 THEN 7
        WHEN Pregunta4_1 = 4 THEN 10
        ELSE 0
        END) AS '6',
        (
        CASE 
        WHEN Pregunta4_2 = 1 THEN 1
        WHEN Pregunta4_2 = 2 THEN 4
        WHEN Pregunta4_2 = 3 THEN 7
        WHEN Pregunta4_2 = 4 THEN 10
        ELSE 0
        END) AS '7',
        (
        CASE 
        WHEN Pregunta4_3 = 1 THEN 1
        WHEN Pregunta4_3 = 2 THEN 4
        WHEN Pregunta4_3 = 3 THEN 7
        WHEN Pregunta4_3 = 4 THEN 10
        ELSE 0
        END) AS '8',
        (
        CASE 
        WHEN Pregunta2_5 = 1 THEN 10
        WHEN Pregunta2_5 = 2 THEN 5
        WHEN Pregunta2_5 = 3 THEN 1
        ELSE 0
        END) AS '9',
        (
        CASE 
        WHEN Pregunta4_4 = 1 THEN 1
        WHEN Pregunta4_4 = 2 THEN 4
        WHEN Pregunta4_4 = 3 THEN 7
        WHEN Pregunta4_4 = 4 THEN 10
        ELSE 0
        END) AS '10',
        (
        CASE 
        WHEN Pregunta4_5 = 1 THEN 1
        WHEN Pregunta4_5 = 2 THEN 4
        WHEN Pregunta4_5 = 3 THEN 7
        WHEN Pregunta4_5 = 4 THEN 10
        ELSE 0
        END) AS '11',
        (
        CASE 
        WHEN Pregunta4_6 = 1 THEN 1
        WHEN Pregunta4_6 = 2 THEN 4
        WHEN Pregunta4_6 = 3 THEN 7
        WHEN Pregunta4_6 = 4 THEN 10
        ELSE 0
        END) AS '12',
        (
        CASE 
        WHEN Pregunta4_7 = 1 THEN 1
        WHEN Pregunta4_7 = 2 THEN 4
        WHEN Pregunta4_7 = 3 THEN 7
        WHEN Pregunta4_7 = 4 THEN 10
        ELSE 0
        END) AS '13',
        (
        CASE 
        WHEN Pregunta5_1 = 1 THEN 1
        WHEN Pregunta5_1 = 2 THEN 4
        WHEN Pregunta5_1 = 3 THEN 7
        WHEN Pregunta5_1 = 4 THEN 10
        ELSE 0
        END) AS '14',
        (
        CASE 
        WHEN Pregunta5_2 = 1 THEN 1
        WHEN Pregunta5_2 = 2 THEN 4
        WHEN Pregunta5_2 = 3 THEN 7
        WHEN Pregunta5_2 = 4 THEN 10
        ELSE 0
        END) AS '15',
        (
        CASE 
        WHEN Pregunta5_3 = 1 THEN 1
        WHEN Pregunta5_3 = 2 THEN 4
        WHEN Pregunta5_3 = 3 THEN 7
        WHEN Pregunta5_3 = 4 THEN 10
        ELSE 0
        END) AS '16',
        (
        CASE 
        WHEN Pregunta5_4 = 1 THEN 1
        WHEN Pregunta5_4 = 2 THEN 4
        WHEN Pregunta5_4 = 3 THEN 7
        WHEN Pregunta5_4 = 4 THEN 10
        ELSE 0
        END) AS '17',
        (
        CASE 
        WHEN Pregunta5_5 = 1 THEN 1
        WHEN Pregunta5_5 = 2 THEN 4
        WHEN Pregunta5_5 = 3 THEN 7
        WHEN Pregunta5_5 = 4 THEN 10
        ELSE 0
        END) AS '18',
        (
        CASE 
        WHEN Pregunta5_6 = 1 THEN 1
        WHEN Pregunta5_6 = 2 THEN 4
        WHEN Pregunta5_6 = 3 THEN 7
        WHEN Pregunta5_6 = 4 THEN 10
        ELSE 0
        END) AS '19',
        (
        CASE 
        WHEN Pregunta5_7 = 1 THEN 1
        WHEN Pregunta5_7 = 2 THEN 4
        WHEN Pregunta5_7 = 3 THEN 7
        WHEN Pregunta5_7 = 4 THEN 10
        ELSE 0
        END) AS '20',
        (
        CASE 
        WHEN Pregunta5_8 = 1 THEN 1
        WHEN Pregunta5_8 = 2 THEN 4
        WHEN Pregunta5_8 = 3 THEN 7
        WHEN Pregunta5_8 = 4 THEN 10
        ELSE 0
        END) AS '21',
        (
        CASE 
        WHEN Pregunta5_9 = 1 THEN 1
        WHEN Pregunta5_9 = 2 THEN 4
        WHEN Pregunta5_9 = 3 THEN 7
        WHEN Pregunta5_9 = 4 THEN 10
        ELSE 0
        END) AS '22',
        (
        CASE 
        WHEN Pregunta5_10 = 1 THEN 1
        WHEN Pregunta5_10 = 2 THEN 4
        WHEN Pregunta5_10 = 3 THEN 7
        WHEN Pregunta5_10 = 4 THEN 10
        ELSE 0
        END) AS '23',`
        if (tipo === 2 || tipo === 3) {
            query += `
        (
        CASE 
        WHEN Pregunta5_11 = 1 THEN 1
        WHEN Pregunta5_11 = 2 THEN 4
        WHEN Pregunta5_11 = 3 THEN 7
        WHEN Pregunta5_11 = 4 THEN 10
        ELSE 0
        END) AS '24',`
        }
        query += `
        (            
        CASE 
        WHEN Pregunta7_1 = 1 THEN 1
        WHEN Pregunta7_1 = 2 THEN 4
        WHEN Pregunta7_1 = 3 THEN 7
        WHEN Pregunta7_1 = 4 THEN 10
        ELSE 0
        END) AS '25',
        (
        CASE 
        WHEN Pregunta7_2 = 1 THEN 1
        WHEN Pregunta7_2 = 2 THEN 4
        WHEN Pregunta7_2 = 3 THEN 7
        WHEN Pregunta7_2 = 4 THEN 10
        ELSE 0
        END) AS '26',
        (
        CASE 
        WHEN Pregunta7_3 = 1 THEN 1
        WHEN Pregunta7_3 = 2 THEN 4
        WHEN Pregunta7_3 = 3 THEN 7
        WHEN Pregunta7_3 = 4 THEN 10
        ELSE 0
        END) AS '27',
        (
        CASE 
        WHEN Pregunta7_4 = 1 THEN 1
        WHEN Pregunta7_4 = 2 THEN 4
        WHEN Pregunta7_4 = 3 THEN 7
        WHEN Pregunta7_4 = 4 THEN 10
        ELSE 0
        END) AS '28',
        (
        CASE 
        WHEN Pregunta7_5 = 1 THEN 1
        WHEN Pregunta7_5 = 2 THEN 4
        WHEN Pregunta7_5 = 3 THEN 7
        WHEN Pregunta7_5 = 4 THEN 10
        ELSE 0
        END) AS '29',
        (
        CASE 
        WHEN Pregunta7_6 = 1 THEN 1
        WHEN Pregunta7_6 = 2 THEN 4
        WHEN Pregunta7_6 = 3 THEN 7
        WHEN Pregunta7_6 = 4 THEN 10
        ELSE 0
        END) AS '30',
        (
        CASE 
        WHEN Pregunta7_7 = 1 THEN 1
        WHEN Pregunta7_7 = 2 THEN 4
        WHEN Pregunta7_7 = 3 THEN 7
        WHEN Pregunta7_7 = 4 THEN 10
        ELSE 0
        END) AS '31',
        (
        CASE 
        WHEN Pregunta6_1 = 1 THEN 1
        WHEN Pregunta6_1 = 2 THEN 4
        WHEN Pregunta6_1 = 3 THEN 7
        WHEN Pregunta6_1 = 4 THEN 10
        ELSE 0
        END) AS '32',
        (
        CASE 
        WHEN Pregunta6_2 = 1 THEN 1
        WHEN Pregunta6_2 = 2 THEN 4
        WHEN Pregunta6_2 = 3 THEN 7
        WHEN Pregunta6_2 = 4 THEN 10
        ELSE 0
        END) AS '33',
        (
        CASE 
        WHEN Pregunta6_3 = 1 THEN 1
        WHEN Pregunta6_3 = 2 THEN 4
        WHEN Pregunta6_3 = 3 THEN 7
        WHEN Pregunta6_3 = 4 THEN 10
        ELSE 0
        END) AS '34',
        (
        CASE 
        WHEN Pregunta6_4 = 1 THEN 1
        WHEN Pregunta6_4 = 2 THEN 4
        WHEN Pregunta6_4 = 3 THEN 7
        WHEN Pregunta6_4 = 4 THEN 10
        ELSE 0
        END) AS '35',
        (
        CASE 
        WHEN Pregunta6_5 = 1 THEN 1
        WHEN Pregunta6_5 = 2 THEN 4
        WHEN Pregunta6_5 = 3 THEN 7
        WHEN Pregunta6_5 = 4 THEN 10
        ELSE 0
        END) AS '36'`
            + where +
            ` WHERE Pregunta1 = 'S' AND Pregunta2 = 'S' AND Pregunta3 = 'S' AND Pregunta4 = 'S' AND Pregunta5 = 'S' AND Pregunta6 = 'S' AND Pregunta7 = 'S'`
            + grupo

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result[0])
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const enviar_conclusion = async (req, res) => {
    try {
        const data = await req.body
        let tipo_encuesta = ""
        numero = ""
        let asunto = "Resultado encuesta Clientes de Best Place to Innovate para " + data.Sigla
        let para = data.Contacto + " <" + data.correo_contacto + ">"
        let de = "Best Place to Innovate " + process.env.CORREO_ADMIN
        let bcc = process.env.CORREO_ADMIN

        //CAMBIAR
        //let bcc = data.Correo        

        if (data.tipo_encuesta === 2) {
            tipo_encuesta = "Comite Ejecutivo - 90°"
            numero = "90"
        }
        if (data.tipo_encuesta === 3) {
            tipo_encuesta = "Colaboradores - 180°"
            numero = "180"
        }
        if (data.tipo_encuesta === 4) {
            tipo_encuesta = "Proveedores - 270°"
            numero = "270"
        }
        if (data.tipo_encuesta === 5) {
            tipo_encuesta = "Clientes - 360°"
            numero = "360"
        }

        copia_oculta = de + "," + data.correo_contacto


        const query = "UPDATE iam_empresa SET Conclusion" + numero + " = '" + data.conclusion_coach + "' , " + "Recomendacion" + numero + " = '" + data.recomendacion_coach + "' WHERE IdEmpresa = " + data.IdEmpresa

        //CORREO
        const html = `
    <html>
    <head>
    <title>` + asunto + `</title>
    </head>
<body>    
    <p>Estimado@ `+ data.Contacto + `, de nuestra consideración:</p>
    <p>Adjuntamos resultado de encuesta correspondiente a `+ tipo_encuesta + ` de Best Place to Innovate solicitada
        por su empresa <b><i>`+ data.NombreEmpresa + `</i></b>.</p>
        <br>
        <br>
        <br>
        <table align='center'>
        <tr>
        <td>
        <img src="cid:unique@kreata.ee" alt='Best Place to Innovate'>        
        </td>
        </tr>
        </table>
    <br>
    <br>
    <br>
    <table align='center' width='auto' border='1' cellspacing='2'>
        <tr>
            <td><br><b>Conclusión:</b><br>&nbsp;</td>
            <td><br>`+ data.conclusion_coach + `<br>&nbsp;</td>
        </tr>
        <tr>
            <td><br><b>Recomendación:</b><br>&nbsp;</td>
            <td><br>`+ data.recomendacion_coach + `<br>&nbsp;</td>
        </tr>
    </table>
    <br><br>
    <p>Muchas gracias por su cooperación.</p>
    <p><b>El Equipo de Best Place to Innovate</b></p>
    <p><img src='https://bestplacetoinnovate.org/firmacorreo.png' alt='Best Place to Innovate' /></p>
</html>
    `

        await connection.query(query, async (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                res.status(200).json(result)

                let file = Math.floor(new Date() / 1000) + ".jpg"


                //CORREO
                fs.writeFile(file, Buffer.from(data.imagen.split("base64,")[1], 'base64'), (err) => {
                    if (err) throw err;
                });
                //console.log(de + " - " + para + " - " + bcc + " - " + asunto)


                mailOptions.attachments[0].filename = "resultado.jpg"
                mailOptions.attachments[0].path = file
                mailOptions.attachments[0].cid = "unique@kreata.ee"
                mailOptions.to = para
                mailOptions.from = de
                mailOptions.bcc = bcc
                mailOptions.subject = asunto
                mailOptions.html = html

                const info = await transporter.sendMail(mailOptions)
                console.log('Message %s sent: %s', info.messageId, info.response)


                /*fs.unlink(file, (err) => {
                    if (err) throw err;
                });*/
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const correo_encuesta_finalizada = async (req, res) => {
    try {
        const data = await req.body        

        let asunto = ""
        let para = ""
        let de = "Best Place to Innovate " + process.env.CORREO_ADMIN
        //CAMBIAR
        //let bcc = data.Correo
        let bcc = process.env.CORREO_ADMIN

        let tabla = ""

        if (data.tipo_encuesta === 2) {
            tipo_encuesta = "Comite Ejecutivo - 90°"
            asunto = "Resultado encuesta Comite Ejecutivo de Best Place to Innovate para "
            tabla = "iam_encuesta90"
        }
        if (data.tipo_encuesta === 3) {
            tipo_encuesta = "Colaboradores - 180°"
            asunto = "Resultado encuesta Colaboradores de Best Place to Innovate para "
            tabla = "iam_encuesta180"
        }
        if (data.tipo_encuesta === 4) {
            tipo_encuesta = "Proveedores - 270°"
            asunto = "Resultado encuesta Proveedores de Best Place to Innovate para "
            tabla = "iam_encuesta270"
        }
        if (data.tipo_encuesta === 5) {
            tipo_encuesta = "Clientes - 360°"
            asunto = "Resultado encuesta Clientes de Best Place to Innovate para "
            tabla = "iam_encuesta360"
        }


        let query = "SELECT COUNT(*) as A FROM " + tabla + " WHERE EncuestaEnviada = 'S' AND IdUsuario = " + data.id_usuario
        //CORREO

        await connection.query(query, async (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (parseInt(result[0].A) == 0) {
                    query = "SELECT A.Nombre, A.Correo, B.NombreEmpresa, B.Sigla, B.Correo,(SELECT Correo FROM iam_usuarios WHERE IdEmpresa = A.IdEmpresa AND TipoUsuario = 88 LIMIT 1) as correo_contacto FROM iam_usuarios A INNER JOIN iam_empresa B ON A.IdEmpresa = B.IdEmpresa WHERE A.Id = " + data.id_usuario                    
                    connection.query(query, async (err, result, fields) => {
                        if (err) {
                            console.log(err.message)
                            res.status(400).json({ error: err.message })
                        } else {
                            if (result.length > 0) {
                                asunto += result[0].Sigla
                                const html = `                                
                               <html>
                               <head>
                                   <title>`+ asunto + `</title>                                   
                               </head>
                               <body>                                  
                                   <p>Estimad@ `+ result[0].Nombre + `, de nuestra consideración:</p>
                                   <p>Adjuntamos resultado de encuesta correspondiente a `+ tipo_encuesta + ` de Best Place to Innovate solicitada por <b><i>` + result[0].NombreEmpresa + `</i></b>.</p>
                                   <br><br><br>
                                   <table align='center'>
                                       <tr>
                                           <td>
                                               <img src="cid:unique@kreata.ee" alt='Best Place to Innovate'>
                                           </td>
                                       </tr>
                                   </table>                                   
                                   <br><br><br>
                                   <p>Muchas gracias por su cooperación.</p>
                                   <p><b>El Equipo de Best Place to Innovate</b></p>
                                   <p><img src='https://bestplacetoinnovate.org/firmacorreo.png' alt='Best Place to Innovate' /></p>

                               </body>
                               </html>
                               `

                                let file = Math.floor(new Date() / 1000) + ".jpg"


                                //CORREO
                                fs.writeFile(file, Buffer.from(data.imagen.split("base64,")[1], 'base64'), (err) => {
                                    if (err) throw err;
                                });
                                para = result[0].Nombre + " <" + result[0].Correo + ">"
                                bcc += "," + result[0].correo_contacto
                                //console.log(de + " - " + para + " - " + bcc + " - " + asunto)


                                mailOptions.attachments[0].filename = "resultado.jpg"
                                mailOptions.attachments[0].path = file
                                mailOptions.attachments[0].cid = "unique@kreata.ee"
                                mailOptions.to = para
                                mailOptions.from = de
                                mailOptions.bcc = bcc
                                mailOptions.subject = asunto
                                mailOptions.html = html

                                const info = await transporter.sendMail(mailOptions)
                                console.log('Message %s sent: %s', info.messageId, info.response)


                               /* fs.unlink(file, (err) => {
                                    if (err) throw err;
                                });*/




                                query = "UPDATE " + tabla + " SET EncuestaEnviada = 'S' WHERE IdUsuario = " + data.id_usuario
                                connection.query(query, (err, result, fields) => {
                                    if (err) {
                                        console.log(err.message)
                                        res.status(400).json({ error: err.message })
                                    } else {
                                        res.status(200).json("OK")
                                    }
                                });

                            }
                        }
                    });
                } else {
                    res.status(200).json("OK")
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }

}

const mantencion_empresas = async (req, res) => {
    try {

        let query = `
        SELECT A.IdEmpresa, A.NombreEmpresa, A.Sigla, A.Vigente, A.Contacto,  
        CASE 
        WHEN Encuesta90 = 'S' THEN (SELECT CAST(COUNT(*) AS CHAR(3)) FROM iam_usuarios B WHERE B.IdEmpresa = A.IdEmpresa AND B.TipoUsuario = 2)
        ELSE 'X'
        END cuenta90, 
        CASE
        WHEN Encuesta180 = 'S' THEN (SELECT CAST(COUNT(*) AS CHAR(3)) FROM iam_usuarios B WHERE B.IdEmpresa = A.IdEmpresa AND B.TipoUsuario = 3)
        ELSE 'X'
        END cuenta180, 
        CASE
        WHEN Encuesta270 = 'S' THEN (SELECT CAST(COUNT(*) AS CHAR(3)) FROM iam_usuarios B WHERE B.IdEmpresa = A.IdEmpresa AND B.TipoUsuario = 4)
        ELSE 'X'
        END cuenta270, 
        CASE
        WHEN Encuesta360 = 'S' THEN (SELECT CAST(COUNT(*) AS CHAR(3)) FROM iam_usuarios B WHERE B.IdEmpresa = A.IdEmpresa AND B.TipoUsuario = 5)
        ELSE 'X'
        END cuenta360
        FROM iam_empresa A        
        ORDER BY A.NombreEmpresa
        `
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    res.status(200).json(result)
                } else {
                    res.status(400).json({ error: "No hay datos." })
                }
            }
        });
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const modificar_empresa = async (req, res) => {
    try {
        const data = req.body
        let query = "UPDATE iam_empresa SET "


        for (let i in data.datos) {
            query += i + " = '" + data.datos[i] + "', "
        }

        query = query.substring(0, query.length - 2)
        query += " WHERE IdEmpresa = " + data.IdEmpresa

        await connect("UPDATE iam_usuarios SET Correo =  '" + data.datos.Correo + "' WHERE TipoUsuario = 88 AND IdEmpresa = " + data.IdEmpresa)


        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                res.status(200).json("OK")
            }
        })

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const crear_empresa = async (req, res) => {
    try {
        const data = req.body
        let html = ``

        let campos = ["IdEmpresa", "NombreEmpresa", "Sigla", "Contacto", "Correo", "Vigente", "Encuesta90", "Encuesta180", "Encuesta270", "Encuesta360", "P0901", "P0902", "P0903", "P0904", "P0905", "P0906", "P1801", "P1802", "P1803", "P1804", "P1805", "P1806", "P2701", "P2702", "P2703", "P2704", "P2705", "P2706", "P3601", "P3602", "P3603", "P3604", "P3605", "P3606", "Fecha", "R090", "R180", "R270", "R360"]

        let rows = await connect("SELECT max(IdEmpresa) + 1 as IdEmpresa FROM iam_empresa;")

        const idempresa = parseInt(rows[0].IdEmpresa)

        let bcc = process.env.CORREO_ADMIN

        let query = "INSERT INTO iam_empresa ("

        campos.map((obj) => query += obj + ", ")
        query = query.substring(0, query.length - 2)

        query += ") VALUES (" + idempresa + ", "

        campos.filter((obj, index) => { return index > 0 }).map((obj) => query += "'" + data.datos[obj] + "', ")
        query = query.substring(0, query.length - 2)
        query += ")"

        await connect(query)

        const newpass = Math.random().toString(36).substr(2, 6)

        const md5 = crypto.createHash("md5").update(newpass).digest("hex");

        query = "INSERT INTO iam_usuarios (Nombre, TipoUsuario, Empresa, Correo, Clave, Activacion, IdEmpresa, Vigente , Version) VALUES ( "
        query += "'" + data.datos["Contacto"] + "', '88', '" + data.datos["Sigla"] + "', '" + data.datos["Correo"] + "', '" + newpass + "', '" + md5 + "', '" + idempresa + "', 'S', '3')"

        await connect(query)

        let asunto = "Encuestas Best Place to Innovate para " + data.datos.Sigla

        const usuario = await connect("SELECT * FROM iam_usuarios WHERE IdEmpresa = "+idempresa+" AND TipoUsuario = 88 ORDER by Id DESC LIMIT 1;")        

        let tipos_escuesta = ""
        if (data.datos.Encuesta90 === "S") {
            tipos_escuesta += "<li>Comite Ejecutivo - 90°</li>"
        }
        if (data.datos.Encuesta180 === "S") {
            tipos_escuesta += "<li>Encuesta Colaboradores - 180°</li>"
        }
        if (data.datos.Encuesta270 === "S") {
            tipos_escuesta += "<li>Encuesta Proveedores - 270°</li>"
        }
        if (data.datos.Encuesta360 === "S") {
            tipos_escuesta += "<li>Encuesta Clientes - 360°</li>"
        }
        html = `
        <html>
        <head>
            <title>` + asunto + `</title>
        </head>
        <body>
            <p>
                Estimad@ ` + data.datos.Contacto + `, de nuestra consideración:
            </p>
            <p>Le informamos que usted tiene asignado el perfil de Administrador de las encuestas realizadas por Best Place to Innovate para los siguientes tipos de encuestas. </p>
                <ol>` + tipos_escuesta + `</ol>
                <br>
                
            <p> Para acceder solo tiene que hacer clic <a href='`+ process.env.LINK + `?tokenaccess=` + usuario[0].Activacion + `'><b> <font color='#ff0000'>AQUÍ</font></b></a></p>
            <p>Muchas gracias por su cooperación.</p>
            <p><b>El Equipo de Best Place to Innovate</b></p>
            <p><img src='https://bestplacetoinnovate.org/firmacorreo.png' alt='Best Place to Innovate' /></p>
        </body>
        </html>
        `        
        
        asunto = "Envio de Invitación a llenar encuesta de Best Place to Innovate para " + data.datos.Sigla
        let para = data.datos.Contacto + " <" + data.datos.Correo + ">"
        let de = "Best Place to Innovate" + process.env.CORREO_ADMIN

        mailOptions_sinadjunto.to = para
        mailOptions_sinadjunto.from = de
        mailOptions_sinadjunto.subject = asunto
        mailOptions_sinadjunto.html = html
        mailOptions_sinadjunto.bcc = bcc

        const info = await transporter.sendMail(mailOptions_sinadjunto)
        console.log('Message %s sent: %s', info.messageId, info.response)
        //CORREO


        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const eliminar_empresa = async (req, res) => {
    try {
        const data = req.body


        //let rows = await connect("SELECT max(IdEmpresa) + 1 as IdEmpresa FROM iam_empresa;")
        await connect("DELETE FROM iam_empresa WHERE IdEmpresa = " + data.IdEmpresa)
        await connect("DELETE FROM iam_usuarios WHERE IdEmpresa = " + data.IdEmpresa)
        await connect("DELETE FROM iam_encuesta90 WHERE IdEmpresa = " + data.IdEmpresa)
        await connect("DELETE FROM iam_encuesta180 WHERE IdEmpresa = " + data.IdEmpresa)
        await connect("DELETE FROM iam_encuesta270 WHERE IdEmpresa = " + data.IdEmpresa)
        await connect("DELETE FROM iam_encuesta360 WHERE IdEmpresa = " + data.IdEmpresa)


        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}


const usuarios_empresa = async (req, res) => {
    try {
        const tipo_encuesta = req.query.tipo_encuesta
        const IdEmpresa = req.query.IdEmpresa

        let tabla = ""

        if (tipo_encuesta == 2) {
            tabla = "iam_encuesta90"
        }
        if (tipo_encuesta == 3) {
            tabla = "iam_encuesta180"
        }
        if (tipo_encuesta == 4) {
            tabla = "iam_encuesta270"
        }
        if (tipo_encuesta == 5) {
            tabla = "iam_encuesta360"
        }

        query = `
        SELECT *, 
        CASE 
        WHEN (SELECT COUNT(*) FROM `+ tabla + ` WHERE IdUsuario = A.id AND IdEmpresa = ` + IdEmpresa + `) = 0 THEN '0'
        WHEN (SELECT COUNT(*) FROM `+ tabla + ` WHERE IdUsuario = A.id AND IdEmpresa = ` + IdEmpresa + ` AND Pregunta7 = 'N') = 1 THEN '1'
        WHEN (SELECT COUNT(*) FROM `+ tabla + ` WHERE IdUsuario = A.id AND IdEmpresa = ` + IdEmpresa + ` AND Pregunta7 = 'S') = 1 THEN '2'        
        END as status 
        FROM iam_usuarios A
        WHERE A.IdEmpresa = `+ IdEmpresa + ` AND A.TipoUsuario = ` + tipo_encuesta + ` ORDER BY A.Nombre
        `
        const rows = await connect(query)



        rows.map((obj, index) => {
            delete rows[index].Clave
        })


        res.status(200).json(rows)
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const modificar_usuario = async (req, res) => {
    try {
        const data = req.body
        let query = "UPDATE iam_usuarios SET "


        for (let i in data.datos) {
            query += i + " = '" + data.datos[i] + "', "
        }

        query = query.substring(0, query.length - 2)
        query += " WHERE Id = " + data.Id

        await connect(query)

        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const crear_usuario = async (req, res) => {
    try {
        const data = req.body
        const usuario = data.datos
        let query = "SELECT COUNT(*) as existe FROM iam_usuarios WHERE TipoUsuario = " + data.TipoUsuario + " AND Correo = '" + usuario.Correo + "' AND IdEmpresa = " + data.IdEmpresa

        let rows = await connect(query)


        if (parseInt(rows[0].existe) == 0) {
            const newpass = Math.random().toString(36).substr(2, 6)
            const md5 = crypto.createHash("md5").update(newpass).digest("hex");
            query = "INSERT INTO iam_usuarios (IdEmpresa, Empresa, TipoUsuario, Nombre, Fono, Correo, Version, Clave, Activacion, Vigente, EstadoEncuesta)"
            query += " VALUES (" + data.IdEmpresa + ", '" + data.Sigla + "', " + data.TipoUsuario + ", '" + usuario.Nombre + "', '" + usuario.Fono + "', '" + usuario.Correo + "', '" + usuario.Version + "', '" + newpass + "', '" + md5 + "', 'S', 0)"
            await connect(query)
        } else {
            throw new Error('El usuario ya existe');
        }

        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const borrar_usuario = async (req, res) => {
    try {
        const data = req.body
        let tabla = ""

        if (data.TipoUsuario == 2) {
            tabla = "iam_encuesta90"
        }
        if (data.TipoUsuario == 3) {
            tabla = "iam_encuesta180"
        }
        if (data.TipoUsuario == 4) {
            tabla = "iam_encuesta270"
        }
        if (data.TipoUsuario == 5) {
            tabla = "iam_encuesta360"
        }
        let query = "DELETE FROM " + tabla + "  WHERE IdUsuario = " + data.Id
        await connect(query)

        query = "DELETE FROM iam_usuarios WHERE Id = " + data.Id
        await connect(query)

        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const crear_encuesta_vacia = async (req, res) => {
    try {
        const data = req.body
        let tabla = ""

        if (data.TipoUsuario == 2) {
            tabla = "iam_encuesta90"
        }
        if (data.TipoUsuario == 3) {
            tabla = "iam_encuesta180"
        }
        if (data.TipoUsuario == 4) {
            tabla = "iam_encuesta270"
        }
        if (data.TipoUsuario == 5) {
            tabla = "iam_encuesta360"
        }

        let query = "SELECT COUNT(*) as tiene FROM " + tabla + " WHERE IdUsuario = " + data.Id + "  AND IdEmpresa = " + data.IdEmpresa

        let rows = await connect(query)

        if (parseInt(rows[0].tiene) === 0) {
            query = "INSERT INTO " + tabla + " (IdUsuario, IdEmpresa, Pregunta1, Pregunta2, Pregunta3, Pregunta4, Pregunta5, Pregunta6, Pregunta7) VALUES (" + data.Id + "," + data.IdEmpresa + ",'N','N','N','N','N','N','N')"
            await connect(query)
        }


        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const datos_eliminar_usuarios = async (req, res) => {
    try {
        const tipo_encuesta = req.query.tipo_encuesta
        const IdEmpresa = req.query.IdEmpresa

        let tabla = ""

        if (tipo_encuesta == 2) {
            tabla = "iam_encuesta90"
        }
        if (tipo_encuesta == 3) {
            tabla = "iam_encuesta180"
        }
        if (tipo_encuesta == 4) {
            tabla = "iam_encuesta270"
        }
        if (tipo_encuesta == 5) {
            tabla = "iam_encuesta360"
        }

        query = `
        SELECT COUNT(*) AS C
        FROM iam_usuarios A LEFT JOIN `+ tabla + ` B
        ON A.Id = B.IdUsuario
        WHERE A.IdEmpresa = `+ IdEmpresa + ` AND A.TipoUsuario = ` + tipo_encuesta + ` AND B.Pregunta7 is null
        UNION ALL
        SELECT COUNT(*) AS C
        FROM iam_usuarios A LEFT JOIN `+ tabla + ` B
        ON A.Id = B.IdUsuario
        WHERE A.IdEmpresa = `+ IdEmpresa + ` AND A.TipoUsuario = ` + tipo_encuesta + ` AND B.Pregunta7 = 'N'
        UNION ALL
        SELECT COUNT(*) AS C
        FROM iam_usuarios A LEFT JOIN `+ tabla + ` B
        ON A.Id = B.IdUsuario
        WHERE A.IdEmpresa = `+ IdEmpresa + ` AND A.TipoUsuario = ` + tipo_encuesta + ` AND B.Pregunta7 = 'S'
        `
        const rows = await connect(query)

        res.status(200).json(rows)
    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const informe_resumen = async (req, res) => {
    try {
        const data = req.body
        let tabla = ""

        if (data.TipoUsuario == 2) {
            tabla = "iam_encuesta90"
        }
        if (data.TipoUsuario == 3) {
            tabla = "iam_encuesta180"
        }
        if (data.TipoUsuario == 4) {
            tabla = "iam_encuesta270"
        }
        if (data.TipoUsuario == 5) {
            tabla = "iam_encuesta360"
        }
        query = `
        SELECT emp.IdEmpresa, emp.NombreEmpresa, emp.Contacto, Encuesta90, Encuesta180, Encuesta270, Encuesta360,
        (SELECT COUNT(*) FROM iam_usuarios usu1 WHERE usu1.IdEmpresa=emp.IdEmpresa AND usu1.TipoUsuario=2) total90,
        (SELECT COUNT(*) FROM iam_usuarios usu2 WHERE usu2.IdEmpresa=emp.IdEmpresa AND usu2.TipoUsuario=3) total180,
        (SELECT COUNT(*) FROM iam_usuarios usu3 WHERE usu3.IdEmpresa=emp.IdEmpresa AND usu3.TipoUsuario=4) total270,
        (SELECT COUNT(*) FROM iam_usuarios usu4 WHERE usu4.IdEmpresa=emp.IdEmpresa AND usu4.TipoUsuario=5) total360,
        (SELECT COUNT(*) FROM iam_encuesta90 en90 WHERE en90.IdEmpresa=emp.IdEmpresa AND en90.Pregunta1='S' AND en90.Pregunta2='S' AND en90.Pregunta3='S' AND en90.Pregunta4='S' AND en90.Pregunta5='S' AND en90.Pregunta6='S' AND en90.Pregunta7='S') cuenta90, 
        (SELECT COUNT(*) FROM iam_encuesta180 en180 WHERE en180.IdEmpresa=emp.IdEmpresa AND en180.Pregunta1='S' AND en180.Pregunta2='S' AND en180.Pregunta3='S' AND en180.Pregunta4='S' AND en180.Pregunta5='S' AND en180.Pregunta6='S' AND en180.Pregunta7='S') cuenta180, 
        (SELECT COUNT(*) FROM iam_encuesta270 en270 WHERE en270.IdEmpresa=emp.IdEmpresa AND en270.Pregunta1='S' AND en270.Pregunta2='S' AND en270.Pregunta3='S' AND en270.Pregunta4='S' AND en270.Pregunta5='S' AND en270.Pregunta6='S' AND en270.Pregunta7='S') cuenta270, 
        (SELECT COUNT(*) FROM iam_encuesta360 en360 WHERE en360.IdEmpresa=emp.IdEmpresa AND en360.Pregunta1='S' AND en360.Pregunta2='S' AND en360.Pregunta3='S' AND en360.Pregunta4='S' AND en360.Pregunta5='S' AND en360.Pregunta6='S' AND en360.Pregunta7='S') cuenta360, 
        emp.Vigente, emp.Fecha
        FROM iam_empresa emp
        WHERE emp.IdEmpresa > 1
        ORDER BY emp.NombreEmpresa
        `
        const rows = await connect(query)
        if (rows.length > 0) {
            res.status(200).json(rows)
        } else {
            throw new Error('No hay datos');
        }


    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const eliminar_usuarios = async (req, res) => {
    try {
        const data = req.body
        let tabla = ""
        if (data.TipoUsuario == 2) {
            tabla = "iam_encuesta90"
        }
        if (data.TipoUsuario == 3) {
            tabla = "iam_encuesta180"
        }
        if (data.TipoUsuario == 4) {
            tabla = "iam_encuesta270"
        }
        if (data.TipoUsuario == 5) {
            tabla = "iam_encuesta360"
        }

        let query = "DELETE FROM " + tabla + "  WHERE IdEmpresa = " + data.IdEmpresa
        await connect(query)

        query = "DELETE FROM iam_usuarios WHERE IdEmpresa = " + data.IdEmpresa + " AND TipoUsuario = " + data.TipoUsuario
        await connect(query)

        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const obtener_correo = async (req, res) => {
    try {
        let query = "SELECT * FROM iam_correodesde WHERE folio = 2"
        const rows = await connect(query)

        res.status(200).json(rows)

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const obtener_cuerpo_correo = async (req, res) => {
    try {
        let query = "SELECT * FROM iam_correo;"
        const rows = await connect(query)

        res.status(200).json(rows)

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const enviar_invitaciones = async (req, res) => {
    try {
        const data = req.body
        const datos = data.datos
        const empresa = data.empresa
        let query = ""
        let where = "("
        let html = ``
        let asunto = ""
        let tipo = ""
        let opcion = ""
        let para = ""
        let de = data.Nombre + " <" + data.Correo + ">"
        //CAMBIAR
        //let bcc = data.Correo
        let bcc = process.env.CORREO_ADMIN        

        query = "UPDATE iam_correodesde SET nombre = '" + data.Nombre + "', correo = '" + data.Correo + "' WHERE folio = 2;"
        await connect(query)


        datos.map((obj) => {
            where += obj.Id + ","
        })


        where = where.substring(0, where.length - 1) + ");"
        query = "SELECT * FROM iam_usuarios WHERE Id IN " + where

        if (datos.length > 0) {
            let rows = await connect(query)

            rows.map(async (obj) => {                

                if (obj.TipoUsuario == "2") {
                    asunto = "Invitación a llenar Encuesta Comite Ejecutivo de Best Place to Innovate para " + empresa.NombreEmpresa
                    tipo = "Encuesta Comite Ejecutivo - 90°"
                    opcion = "Encuesta: <b>Equipo General (90°)</b>"
                }
                if (obj.TipoUsuario == "3") {
                    asunto = "Invitación a llenar Encuesta Colaboradores de Best Place to Innovate para " + empresa.NombreEmpresa
                    tipo = "Encuesta Colaboradores - 180°"
                    opcion = "Encuesta: <b>Colaboradores (180°)</b>"
                }
                if (obj.TipoUsuario == "4") {
                    asunto = "Invitación a llenar Encuesta Proveedores de Best Place to Innovate para " + empresa.NombreEmpresa
                    tipo = "Encuesta Proveedores - 270°"
                    opcion = "Encuesta: <b>Proveedores (270°)</b>"
                }
                if (obj.TipoUsuario == "5") {
                    asunto = "Invitación a llenar Encuesta Clientes de Best Place to Innovate para " + empresa.NombreEmpresa
                    tipo = "Encuesta Clientes - 360°"
                    opcion = "Encuesta: <b>Clientes (360°)</b>"
                }

                html = `
            <html>

            <head>
                <title>`+ asunto + `</title>
            </head>

            <body>
                <p>Estimad@ `+ obj.Nombre + `,
                        <p>Hay interés por parte de Best Place to Innovate en entender cuál es el potencial innovador de la empresa y en cómo gestionar la innovación para hacerla parte del ADN de la organización.</p>
                        <p>Es por ello que le agradeceríamos tomarse unos minutos para contestar esta encuesta. Sus respuestas honestas y lo más objetivas posibles nos ayudarán a hacer esta medición.  No hay respuesta incorrecta, solo respuestas útiles.</p> 
                        <p>Esta encuesta es totalmente anónima y confidencial. Completarla es sencillo y le tomará unos pocos minutos. Solo tiene que hacer clic <a href='`+ process.env.LINK + `?tokenaccess=` + obj.Activacion + `'><b> <font color='#ff0000'>AQUÍ</font></b></a> para comenzar a contestar las preguntas, si con el link no logra ingresar directamente a la encuesta, puede acceder ingresando los siguientes datos: `+opcion+`, Correo Electronico: <b>`+obj.Correo+`</b> y Contraseña: <b>`+obj.Clave+`</b></p>
                        <p>Muchas gracias por su cooperación.</p>
                        <p><b>El Equipo de Best Place to Innovate</b></p>
                        <p><img src='https://bestplacetoinnovate.org/firmacorreo.png' alt='Best Place to Innovate' /></p>
            </body>
            </html>`

                //console.log(de + " - " + para + " - " + bcc + " - " + asunto)

                para = obj.Nombre + " <" + obj.Correo + ">"
                bcc = empresa.correo_contacto + "," + bcc

                mailOptions_sinadjunto.to = para
                mailOptions_sinadjunto.bcc = bcc
                mailOptions_sinadjunto.from = de
                mailOptions_sinadjunto.subject = asunto
                mailOptions_sinadjunto.html = html

                const info = await transporter.sendMail(mailOptions_sinadjunto)
                console.log('Message %s sent: %s', info.messageId, info.response)
                res.status(200).json("OK")

            })

        } else {
            res.status(400).json({ error: "Las invitaciones ya fueron enviadas" })
        }







    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}


const enviar_ultimatum = async (req, res) => {
    try {
        const data = req.body
        const usuario = data.usuario
        const empresa = data.empresa
        let query = ""
        let html = ``
        let asunto = ""
        let tipo = ""
        let para = ""
        let de = ""
        let bcc = ""
        let correo_admin = ""

        let cuerpo = ""

        query = "SELECT * FROM iam_correodesde WHERE folio = 2;"

        let rows = await connect(query)

        de = rows[0].nombre + " <" + rows[0].correo + ">"

        correo_admin = rows[0].correo

        query = "SELECT * FROM iam_usuarios WHERE Id = " + usuario

        rows = await connect(query)

        if (data.correo == 0) {
            cuerpo = "Esperamos que este bien. Queríamos comentarle que estamos próximos a cerrar el diagnóstico de potencial innovador y capacidad de gestión de la innovación de la <b>" + empresa.NombreEmpresa + "</b>. Nos encantaría si antes de cerrarse el diagnóstico pudiésemos contar con su opinión la que seguramente será de mucho valor en el trabajo que se está haciendo."
        } else {
            cuerpo = data.contenido
            query = "UPDATE iam_correo SET contenido = '" + data.contenido + "' WHERE id = " + data.correo
            await connect(query)
        }

        if (rows[0].TipoUsuario == "2") {
            asunto = "Asunto: Su opinión como Ejecutivo de " + empresa.NombreEmpresa
            tipo = "Encuesta Comite Ejecutivo - 90°"
        }
        if (rows[0].TipoUsuario == "3") {
            asunto = "Asunto: Su opinión como Colaborador de " + empresa.NombreEmpresa
            tipo = "Encuesta Colaboradores - 180°"
        }
        if (rows[0].TipoUsuario == "4") {
            asunto = "Asunto: Su opinión como Proveedores de " + empresa.NombreEmpresa
            tipo = "Encuesta Proveedores - 270°"
        }
        if (rows[0].TipoUsuario == "5") {
            asunto = "Asunto: Su opinión como Cliente de " + empresa.NombreEmpresa
            tipo = "Encuesta Clientes - 360°"
        }

        html = `
        <html>

        <head>
            <title>`+ asunto + `</title>
        </head>

        <body>
            <p>Estimad@ <b>`+ rows[0].Nombre + `</b>:</p>
            <p>`+ cuerpo + `</p>
            <p>Completar la encuesta es sencillo y le tomará unos pocos minutos. Solo tiene que hacer clic <a href='`+ process.env.LINK + `?tokenaccess=` + rows[0].Activacion + `'><b> <font color='#ff0000'>AQUÍ</font></b></a> para comenzar a contestar las preguntas. </p>            
            <p>Muchas gracias por su cooperación.</p>
            <p><b>El Equipo de Best Place to Innovate</b></p>
            <p><img src='https://bestplacetoinnovate.org/firmacorreo.png' alt='Best Place to Innovate' /></p>            
        </body>

        </html>
           `


        para = rows[0].Nombre + " <" + rows[0].Correo + ">"
        bcc = empresa.correo_contacto + "," + correo_admin


        //console.log(de + " - " + para + " - " + bcc + " - " + asunto)

        mailOptions_sinadjunto.to = para
        mailOptions_sinadjunto.from = de
        mailOptions_sinadjunto.bcc = bcc
        mailOptions_sinadjunto.subject = asunto
        mailOptions_sinadjunto.html = html

        const info = await transporter.sendMail(mailOptions_sinadjunto)
        console.log('Message %s sent: %s', info.messageId, info.response)


        res.status(200).json("OK")

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const obtener_empresas = async (req, res) => {
    try {
        let query = "SELECT IdEmpresa, Sigla FROM iam_empresa WHERE IdEmpresa>1 ORDER BY Sigla;"
        const rows = await connect(query)

        res.status(200).json(rows)

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const graficos = async (req, res) => {
    try {
        const datos = req.query
        let query = ""
        let tabla = ""
        let where = " WHERE EncuestaEnviada = 'S'"
        let resultados = []
        let bar_json = {
            type: "bar",
            options: {
                title: {
                    text: "",
                    align: 'center',
                },
                xaxis: {
                    categories: ["Total", "Inf.Gral.", "Resultados", "Impacto", "Liderando", "Organización", "Cultura", "Facilitadores"]
                },
                series: [{
                    name: "",
                    data: []
                }]
            }
        }


        function pie(titulo, etiqueta, serie) {
            let pie_json = {
                type: "pie",
                options: {
                    labels: etiqueta,
                    series: serie,
                    title: {
                        text: titulo,
                        align: "center"
                    },
                    legend: {
                        position: "right",
                        offsetY: 50
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '14px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 'bold'
                        }
                    },
                    plotOptions: {
                        pie: {
                            customScale: 1.0
                        }
                    }
                }
            }
            return pie_json
        }

        if (datos.TipoUsuario == 2) {
            tabla = "iam_encuesta90"
            bar_json.options.title.text = "Resumen Encuesta 90°"
        }
        if (datos.TipoUsuario == 3) {
            tabla = "iam_encuesta180"
            bar_json.options.title.text = "Resumen Encuesta 180°"
        }
        if (datos.TipoUsuario == 4) {
            tabla = "iam_encuesta270"
            bar_json.options.title.text = "Resumen Encuesta 270°"
        }
        if (datos.TipoUsuario == 5) {
            tabla = "iam_encuesta360"
            bar_json.options.title.text = "Resumen Encuesta 360°"
        }

        if (datos.TipoUsuario == 2 || datos.TipoUsuario == 3) {

            if (datos.tipografico == 2) {
                where += " AND IdEmpresa = " + datos.select
            }

            if (datos.tipografico == 3) {
                where += " AND Pregunta1_3 = " + datos.select
            }

            query = `
        SELECT COUNT(*) AS TOT, 
        SUM(IF(Pregunta1='S',1,0)) AS P1, 
        SUM(IF(Pregunta2='S',1,0)) AS P2, 
        SUM(IF(Pregunta3='S',1,0)) AS P3, 
        SUM(IF(Pregunta4='S',1,0)) AS P4, 
        SUM(IF(Pregunta5='S',1,0)) AS P5, 
        SUM(IF(Pregunta6='S',1,0)) AS P6, 
        SUM(IF(Pregunta7='S',1,0)) AS P7, 
        SUM(IF(Pregunta1_1 = 1, 1, 0)) AS P1_1, 
        SUM(IF(Pregunta1_1 = 2, 1, 0)) AS P1_2, 
        SUM(IF(Pregunta1_1 = 3, 1, 0)) AS P1_3, 
        SUM(IF(Pregunta1_2 = 1, 1, 0)) AS P2_1, 
        SUM(IF(Pregunta1_2 = 2, 1, 0)) AS P2_2, 
        SUM(IF(Pregunta1_2 = 3, 1, 0)) AS P2_3, 
        SUM(IF(Pregunta1_2 = 4, 1, 0)) AS P2_4, 
        SUM(IF(Pregunta1_2 = 5, 1, 0)) AS P2_5, 
        SUM(IF(Pregunta1_2 = 6, 1, 0)) AS P2_6, 
        SUM(IF(Pregunta1_2 = 7, 1, 0)) AS P2_7, 
        SUM(IF(Pregunta1_2 = 8, 1, 0)) AS P2_8, 
        SUM(IF(Pregunta1_3 = 1, 1, 0)) AS P3_1, 
        SUM(IF(Pregunta1_3 = 2, 1, 0)) AS P3_2, 
        SUM(IF(Pregunta1_3 = 3, 1, 0)) AS P3_3, 
        SUM(IF(Pregunta1_3 = 4, 1, 0)) AS P3_4, 
        SUM(IF(Pregunta1_3 = 5, 1, 0)) AS P3_5, 
        SUM(IF(Pregunta1_3 = 6, 1, 0)) AS P3_6, 
        SUM(IF(Pregunta1_3 = 7, 1, 0)) AS P3_7, 
        SUM(IF(Pregunta1_3 = 8, 1, 0)) AS P3_8, 
        SUM(IF(Pregunta1_3 = 9, 1, 0)) AS P3_9, 
        SUM(IF(Pregunta1_3 = 10, 1, 0)) AS P3_10, 
        SUM(IF(Pregunta1_3 = 11, 1, 0)) AS P3_11, 
        SUM(IF(Pregunta1_3 = 12, 1, 0)) AS P3_12, 
        SUM(IF(Pregunta1_4 = 1, 1, 0)) AS P4_1, 
        SUM(IF(Pregunta1_4 = 2, 1, 0)) AS P4_2, 
        SUM(IF(Pregunta1_4 = 3, 1, 0)) AS P4_3,
        SUM(IF(Pregunta2_1_1 = 1, 1, 0)) AS P2_1,
        SUM(IF(Pregunta2_1_2 = 1, 1, 0)) AS P2_2,
        SUM(IF(Pregunta2_1_3 = 1, 1, 0)) AS P2_3,
        SUM(IF(Pregunta2_1_4 = 1, 1, 0)) AS P2_4,
        SUM(IF(Pregunta2_1_5 = 1, 1, 0)) AS P2_5,
        SUM(IF(Pregunta2_1_6 = 1, 1, 0)) AS P2_6,
        SUM(IF(Pregunta2_1_7 = 1, 1, 0)) AS P2_7,
        SUM(IF(Pregunta2_1_8 = 1, 1, 0)) AS P2_8,
        SUM(IF(Pregunta2_3 = 1, 1, 0)) AS P2_3_1,
        SUM(IF(Pregunta2_3 = 2, 1, 0)) AS P2_3_2,
        SUM(IF(Pregunta2_3 = 3, 1, 0)) AS P2_3_3,
        SUM(IF(Pregunta2_3 = 4, 1, 0)) AS P2_3_4,
        SUM(IF(Pregunta2_3 = 5, 1, 0)) AS P2_3_5,
        SUM(IF(Pregunta2_3 = 6, 1, 0)) AS P2_3_6,
        SUM(IF(Pregunta2_3 = 7, 1, 0)) AS P2_3_7,
        SUM(IF(Pregunta2_3 = 8, 1, 0)) AS P2_3_8,
        SUM(IF(Pregunta2_4 = 1, 1, 0)) AS P2_4_1,
        SUM(IF(Pregunta2_4 = 2, 1, 0)) AS P2_4_2,
        SUM(IF(Pregunta2_4 = 3, 1, 0)) AS P2_4_3
        FROM ` + tabla
                + where
        }

        if (datos.TipoUsuario == 4 || datos.TipoUsuario == 5) {

            if (datos.tipografico == 2) {
                where += " AND IdEmpresa = " + datos.select
            }

            if (datos.tipografico == 3) {
                if (datos.select == 1) {
                    where += " AND Pregunta1_3_1 = 1 "
                }
                if (datos.select == 2) {
                    where += " AND Pregunta1_3_2 = 1 "
                }
                if (datos.select == 3) {
                    where += " AND Pregunta1_3_3 = 1 "
                }
                if (datos.select == 4) {
                    where += " AND Pregunta1_3_4 = 1 "
                }
                if (datos.select == 5) {
                    where += " AND Pregunta1_3_5 = 1 "
                }
                if (datos.select == 6) {
                    where += " AND Pregunta1_3_6 = 1 "
                }
                if (datos.select == 7) {
                    where += " AND Pregunta1_3_7 = 1 "
                }
                if (datos.select == 8) {
                    where += " AND Pregunta1_3_8 = 1 "
                }
                if (datos.select == 9) {
                    where += " AND Pregunta1_3_9 = 1 "
                }
                if (datos.select == 10) {
                    where += " AND Pregunta1_3_10 = 1 "
                }
                if (datos.select == 11) {
                    where += " AND Pregunta1_3_11 = 1 "
                }
                if (datos.select == 12) {
                    where += " AND Pregunta1_3_12 = 1 "
                }

            }
            query = `
        SELECT COUNT(*) AS TOT, 
        SUM(IF(Pregunta1='S',1,0)) AS P1, 
        SUM(IF(Pregunta2='S',1,0)) AS P2, 
        SUM(IF(Pregunta3='S',1,0)) AS P3, 
        SUM(IF(Pregunta4='S',1,0)) AS P4, 
        SUM(IF(Pregunta5='S',1,0)) AS P5, 
        SUM(IF(Pregunta6='S',1,0)) AS P6, 
        SUM(IF(Pregunta7='S',1,0)) AS P7, 
        SUM(IF(Pregunta1_1 = 1, 1, 0)) AS P1_1, 
        SUM(IF(Pregunta1_1 = 2, 1, 0)) AS P1_2, 
        SUM(IF(Pregunta1_1 = 3, 1, 0)) AS P1_3, 
        SUM(IF(Pregunta1_2 = 1, 1, 0)) AS P2_1, 
        SUM(IF(Pregunta1_2 = 2, 1, 0)) AS P2_2, 
        SUM(IF(Pregunta1_2 = 3, 1, 0)) AS P2_3, 
        SUM(IF(Pregunta1_2 = 4, 1, 0)) AS P2_4, 
        SUM(IF(Pregunta1_2 = 5, 1, 0)) AS P2_5, 
        SUM(IF(Pregunta1_2 = 6, 1, 0)) AS P2_6, 
        SUM(IF(Pregunta1_2 = 7, 1, 0)) AS P2_7, 
        SUM(IF(Pregunta1_2 = 8, 1, 0)) AS P2_8, 
        SUM(IF(Pregunta1_3_1 = 1, 1, 0)) AS P3_1, 
        SUM(IF(Pregunta1_3_2 = 1, 1, 0)) AS P3_2, 
        SUM(IF(Pregunta1_3_3 = 1, 1, 0)) AS P3_3, 
        SUM(IF(Pregunta1_3_4 = 1, 1, 0)) AS P3_4, 
        SUM(IF(Pregunta1_3_5 = 1, 1, 0)) AS P3_5, 
        SUM(IF(Pregunta1_3_6 = 1, 1, 0)) AS P3_6, 
        SUM(IF(Pregunta1_3_7 = 1, 1, 0)) AS P3_7, 
        SUM(IF(Pregunta1_3_8 = 1, 1, 0)) AS P3_8, 
        SUM(IF(Pregunta1_3_9 = 1, 1, 0)) AS P3_9, 
        SUM(IF(Pregunta1_3_10 = 1, 1, 0)) AS P3_10, 
        SUM(IF(Pregunta1_3_11 = 1, 1, 0)) AS P3_11, 
        SUM(IF(Pregunta1_3_12 = 1, 1, 0)) AS P3_12, 
        SUM(IF(Pregunta1_4 = 1, 1, 0)) AS P4_1, 
        SUM(IF(Pregunta1_4 = 2, 1, 0)) AS P4_2, 
        SUM(IF(Pregunta1_4 = 3, 1, 0)) AS P4_3,
        SUM(IF(Pregunta2_1_1 = 1, 1, 0)) AS P2_1,
        SUM(IF(Pregunta2_1_2 = 1, 1, 0)) AS P2_2,
        SUM(IF(Pregunta2_1_3 = 1, 1, 0)) AS P2_3,
        SUM(IF(Pregunta2_1_4 = 1, 1, 0)) AS P2_4,
        SUM(IF(Pregunta2_1_5 = 1, 1, 0)) AS P2_5,
        SUM(IF(Pregunta2_1_6 = 1, 1, 0)) AS P2_6,
        SUM(IF(Pregunta2_1_7 = 1, 1, 0)) AS P2_7,
        SUM(IF(Pregunta2_1_8 = 1, 1, 0)) AS P2_8,
        SUM(IF(Pregunta2_3 = 1, 1, 0)) AS P2_3_1,
        SUM(IF(Pregunta2_3 = 2, 1, 0)) AS P2_3_2,
        SUM(IF(Pregunta2_3 = 3, 1, 0)) AS P2_3_3,
        SUM(IF(Pregunta2_3 = 4, 1, 0)) AS P2_3_4,
        SUM(IF(Pregunta2_3 = 5, 1, 0)) AS P2_3_5,
        SUM(IF(Pregunta2_3 = 6, 1, 0)) AS P2_3_6,
        SUM(IF(Pregunta2_3 = 7, 1, 0)) AS P2_3_7,
        SUM(IF(Pregunta2_3 = 8, 1, 0)) AS P2_3_8,
        SUM(IF(Pregunta2_4 = 1, 1, 0)) AS P2_4_1,
        SUM(IF(Pregunta2_4 = 2, 1, 0)) AS P2_4_2,
        SUM(IF(Pregunta2_4 = 3, 1, 0)) AS P2_4_3 
        FROM ` + tabla
                + where
        }

        let rows = await connect(query)

        if (rows[0].P1 != null) {

            bar_json.options.series[0].data.push(rows[0].TOT)
            bar_json.options.series[0].data.push(rows[0].P1)
            bar_json.options.series[0].data.push(rows[0].P2)
            bar_json.options.series[0].data.push(rows[0].P3)
            bar_json.options.series[0].data.push(rows[0].P4)
            bar_json.options.series[0].data.push(rows[0].P5)
            bar_json.options.series[0].data.push(rows[0].P6)
            bar_json.options.series[0].data.push(rows[0].P7)
            resultados.push(bar_json)


            let etiquetas = ["Gerente General (" + rows[0].P1_1 + ")", "Gerente (" + rows[0].P1_2 + ")", "Otro (" + rows[0].P1_3 + ")"]
            let serie = [rows[0].P1_1, rows[0].P1_2, rows[0].P1_3]
            resultados.push(new pie("Rol en o para con la empresa", etiquetas, serie))


            etiquetas = ["Ventas/Comercial (" + rows[0].P2_1 + ")", "Marketing (" + rows[0].P2_2 + ")", "Producción/Operaciones/Logística (" + rows[0].P2_3 + ")", "Sistemas (" + rows[0].P2_4 + ")", "Contabilidad/Finanzas (" + rows[0].P2_5 + ")", "RRHH (" + rows[0].P2_6 + ")", "Innovación/Desarrollo (" + rows[0].P2_7 + ")", "Dirección (" + rows[0].P2_8 + ")"]
            serie = [rows[0].P2_1, rows[0].P2_2, rows[0].P2_3, rows[0].P2_4, rows[0].P2_5, rows[0].P2_6, rows[0].P2_7, rows[0].P2_8]
            resultados.push(new pie("Área de trabajo de desempeño", etiquetas, serie))

            etiquetas = ["Retail (" + rows[0].P3_1 + ")", "Consumo masivo (" + rows[0].P3_2 + ")", "Telecomunicaciones/Tecnologia (" + rows[0].P3_3 + ")", "Manufactura industrial (" + rows[0].P3_4 + ")", "Servicios financieros (" + rows[0].P3_5 + ")", "Servicios educacionales (" + rows[0].P3_6 + ")", "Servicios eléctricos, sanitarios (" + rows[0].P3_7 + ")", "Servicios públicos (" + rows[0].P3_8 + ")", "Agricultura (" + rows[0].P3_9 + ")", "Minería (" + rows[0].P3_10 + ")", "Automotriz (" + rows[0].P3_11 + ")", "Salud / Otro (" + rows[0].P3_12 + ")"]
            serie = [rows[0].P3_1, rows[0].P3_2, rows[0].P3_3, rows[0].P3_4, rows[0].P3_5, rows[0].P3_6, rows[0].P3_7, rows[0].P3_8, rows[0].P3_9, rows[0].P3_10, rows[0].P3_11, rows[0].P3_12]
            resultados.push(new pie("Industria de competencia", etiquetas, serie))

            etiquetas = ["Menos de 2 años (" + rows[0].P4_1 + ")", "De 2 a 5 año (" + rows[0].P4_2 + ")", "Más de 5 años (" + rows[0].P4_3 + ")"]
            serie = [rows[0].P4_1, rows[0].P4_2, rows[0].P4_3]
            resultados.push(new pie("Antiguedad", etiquetas, serie))

            etiquetas = ["Soluciones (Productos y Servicios) (" + rows[0].P2_1 + ")", "Canales de comercialización, atención clientes (" + rows[0].P2_2 + ")", "Proceso productivo / cadena de suministro (" + rows[0].P2_3 + ")", "Estructura y capacidad organizacional (" + rows[0].P2_4 + ")", "Nuevos mercados, segmentos objetivos, Marketing (" + rows[0].P2_5 + ")", "Utilización de nuevas Tecnologías (" + rows[0].P2_6 + ")", "Sostenibilidad (" + rows[0].P2_7 + ")", "Otro (" + rows[0].P2_8 + ")"]
            serie = [rows[0].P2_1, rows[0].P2_2, rows[0].P2_3, rows[0].P2_4, rows[0].P2_5, rows[0].P2_6, rows[0].P2_7, rows[0].P2_8]
            resultados.push(new pie("Innovaciones realizada por la empresa en los últimos tres años", etiquetas, serie))

            etiquetas = ["Director o equivalente (" + rows[0].P2_3_1 + ")", "Gerente General o equivalente (" + rows[0].P2_3_2 + ")", "Gerente Marketing, Comercial o equivalente (" + rows[0].P2_3_3 + ")", "Gerente Operaciones o equivalente (" + rows[0].P2_3_4 + ")", "Gerente Administración & Finanzas o equivalente (" + rows[0].P2_3_5 + ")", "Gerente Innovación o equivalente (" + rows[0].P2_3_6 + ")", "Gerente Sostenibilidad o equivalente (" + rows[0].P2_3_7 + ")", "Otro (" + rows[0].P2_3_8 + ")"]
            serie = [rows[0].P2_3_1, rows[0].P2_3_2, rows[0].P2_3_3, rows[0].P2_3_4, rows[0].P2_3_5, rows[0].P2_3_6, rows[0].P2_3_7, rows[0].P2_3_8]
            resultados.push(new pie("Persona que conduce con mayor fuerza la innovación", etiquetas, serie))

            etiquetas = ["Prioridad uno(" + rows[0].P2_4_1 + ")", "Esta entre las prioridades principales (" + rows[0].P2_4_2 + ")", "Es medianamente o no es prioritaria (" + rows[0].P2_4_3 + ")"]
            serie = [rows[0].P2_4_1, rows[0].P2_4_2, rows[0].P2_4_3]
            resultados.push(new pie("Prioridad de la innovación", etiquetas, serie))

            res.status(200).json(resultados)

        } else {
            res.status(400).json({ error: "No hay datos." })
        }



    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}


const accessbytoken = async (req, res) => {
    try {
        let query = 'select * from  iam_usuarios WHERE Activacion = "' + req.query.token + '"'
        const rows = await connect(query)

        if (rows.length == 1) {
            res.status(200).json(rows)
        } else {
            res.status(400).json({ error: "PRUEBA" })
        }

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}

const email_coach = async (req, res) => {
    try {
        let query = ""

        if (req.method == "GET") {
            query = 'SELECT * FROM iam_usuarios WHERE TipoUsuario = 99'
            const rows = await connect(query)

            if (rows.length == 1) {
                res.status(200).json(rows)
            } else {
                res.status(400).json({ error: e.message })
            }
        } else if (req.method == "POST") {
            query = "UPDATE iam_usuarios SET Correo = '" + req.body.Correo + "' WHERE TipoUsuario = 99;"
            await connect(query)
            res.status(200).json("Status: OK")
        } else {
            res.status(400).json({ error: "Peticion Invalida" })
        }

    } catch (e) {
        console.log(e.message)
        res.status(400).json({ error: e.message })
    }
}



module.exports = {
    pregunta_archivo,
    session,
    verifytoken,
    login,
    preguntas_encuesta,
    recuperar_clave,
    encuesta,
    actualizar_encuesta,
    datos_usuario,
    datos_empresa,
    resultados_innovacion,
    proposito,
    liderazgo,
    estructuras_habilitadoras,
    sistemas_consistentes,
    cultura_conectada,
    lista_reporte_administrador,
    lista_reporte_empleado,
    total_encuestas_empresas,
    tool_tips_data,
    enviar_conclusion,
    correo_encuesta_finalizada,
    mantencion_empresas,
    modificar_empresa,
    crear_empresa,
    eliminar_empresa,
    usuarios_empresa,
    modificar_usuario,
    crear_encuesta_vacia,
    crear_usuario,
    borrar_usuario,
    datos_eliminar_usuarios,
    eliminar_usuarios,
    informe_resumen,
    enviar_invitaciones,
    obtener_correo,
    enviar_ultimatum,
    obtener_cuerpo_correo,
    obtener_empresas,
    graficos,
    accessbytoken,
    email_coach
}
