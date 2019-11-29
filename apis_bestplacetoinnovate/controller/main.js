const jwt = require("jsonwebtoken")
const nodeMailer = require('nodemailer')
const mysql = require('mysql')

const fs = require('fs');
const connection = mysql.createConnection({
    host: process.env.DATABASE_ADDRESS,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

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
        const { recuperarform_usuario } = req.body
        const query = "SELECT Correo, Vigente, Nombre, Clave FROM iam_usuarios WHERE Correo = '" + recuperarform_usuario + "'"
        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(401).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    if (result[0].Vigente != "S") {
                        res.status(400).json({ error: "El usuario no se encuentra vigente." })
                    } else {

                        res.status(200).json("OK")
                        //CORREO
                        /*
$para  = $fila['Correo'] ; 
		// título
		$titulo = "Clave de acceso a ".$_El_Titulo_;
		// mensaje
		$mensaje = '<title>Clave de acceso '.$_El_Titulo_.'</title>
			</head>
			<body>
			  <p>Sr(a) '.$fila['Nombre'].'.
			  <br>Le recordamos que su clave de acceso a los sistemas de '.$_El_Titulo_.' es:
			  <br>Usuario: <b>'.$fila['Correo'].'</b>
			  <br>Clave: <b>'.$fila['Clave'].'</b>
			  <br>
			  <br>Con esta información puede acceder <a href="'.$_pag_login.'" class="rojo">AQUÍ</a>
			  <br>
			  <br>Gracias por preferirnos.
			  <br><i>Equipo de '.$_El_Titulo_.'</i>
			  </p>
			</body>
			</html>
			';
                        */
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
        //CAMBIAR a 1 OPCION 4
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
        let para = data.correo_contacto
        let copia_oculta = ""
        let de = process.env.CORREO_ADMIN

        
        console.log(data)
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


        console.log(de + " - " + copia_oculta + " - " + para + " - " + asunto)

        const query = "UPDATE iam_empresa SET Conclusion" + numero + " = '" + data.conclusion_coach + "' , " + "Recomendacion" + numero + " = '" + data.recomendacion_coach + "' WHERE IdEmpresa = " + data.IdEmpresa
        //CORREO
        const html = `
    <html>
    <head>
    <title>` + asunto + `</title>
    </head>
<body>
    <img src='https://www.bestplacetoinnovate.org/InnovAccionMeter/Image/Logo_bp2i.jpg' alt='Best Place to Innovate' />
    <h1 align=center>
        <font color='#006600'>Best Place to Innovate</font>
    </h1>
    <h2 align=center>
        <font color='#ff0000'>`+ tipo_encuesta + `</font>
    </h2>
    <p><b><i>`+ data.Contacto + `</i></b>, de nuestra consideración:</p>
    <p>Adjuntamos resultado de encuesta correspondiente a `+ tipo_encuesta + ` de Best Place to Innovate solicitada
        por su empresa <b><i>`+ data.NombreEmpresa + `</i></b>.</p>
        <br>
        <br>
        <br>
        <table align='center'>
        <tr>
        <td>
        <img src=`+ data.imagen + `></img>
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
    <br><br>Atentamente equipo de <i>Best Place to Innovate</i>
</html>
    `

        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                res.status(200).json(result)
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
        let copia_oculta = ""
        let de = process.env.CORREO_ADMIN

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


        let query = "SELECT EncuestaEnviada FROM " + tabla + " WHERE EncuestaEnviada = 'N' AND IdUsuario = " + data.id_usuario
        //CORREO


        await connection.query(query, (err, result, fields) => {
            if (err) {
                console.log(err.message)
                res.status(400).json({ error: err.message })
            } else {
                if (result.length > 0) {
                    query = "SELECT A.Nombre, A.Correo, B.NombreEmpresa, B.Sigla, B.Correo FROM iam_usuarios A INNER JOIN iam_empresa B ON A.IdEmpresa = B.IdEmpresa WHERE A.Id = " + data.id_usuario
                    connection.query(query, (err, result, fields) => {
                        if (err) {
                            console.log(err.message)
                            res.status(400).json({ error: err.message })
                        } else {
                            if (result.length > 0) {
                                asunto += result[0].Sigla
                                copia_oculta = result[0].Correo + "," + process.env.CORREO_ADMIN                                
                                const html = `
                               <html>
                               <head>
                                   <title>`+ asunto + `</title>
                               </head>
                               <body>
                                   <img src='https://www.bestplacetoinnovate.org/InnovAccionMeter/Image/Logo_bp2i.jpg' alt='Best Place to Innovate' />
                                   <h1 align=center><font color='#006600'>Best Place to Innovate</font></h1>
                                   <h2 align=center><font color='#ff0000'>`+ tipo_encuesta + `</font></h2>
                                   <p><b><i>`+ result[0].Nombre + `</i></b>, de nuestra consideración:</p>
                                   <p>Adjuntamos resultado de encuesta correspondiente a `+ tipo_encuesta + ` de Best Place to Innovate solicitada por <b><i>` + result[0].NombreEmpresa + `</i></b>.</p>
                                   <br><br><br>
                                   <table align='center'>
                                       <tr>
                                           <td>
                                               <img src=`+ data.imagen + `></img>
                                           </td>
                                       </tr>
                                   </table>
                                   <br><br><br>
                               </body>
                               </html>
                               `
                                fs.writeFile('prueba.html', html, (err) => {
                                    if (err) throw err;
                                });

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
    correo_encuesta_finalizada

}
