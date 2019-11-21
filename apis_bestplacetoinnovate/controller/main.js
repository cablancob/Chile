const jwt = require("jsonwebtoken")
const nodeMailer = require('nodemailer')
const mysql = require('mysql')

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
            WHEN Pregunta3_1 = 4 THEN 0
            ELSE 0
            END) AS '0',
            (
            CASE 
            WHEN Pregunta3_3 = 1 THEN 1
            WHEN Pregunta3_3 = 2 THEN 5
            WHEN Pregunta3_3 = 3 THEN 10
            WHEN Pregunta3_3 = 4 THEN 0
            ELSE 0
            END) AS '1',
            (
            CASE 
            WHEN Pregunta3_4 = 1 THEN 1
            WHEN Pregunta3_4 = 2 THEN 5
            WHEN Pregunta3_4 = 3 THEN 10
            WHEN Pregunta3_4 = 4 THEN 0
            ELSE 0
            END) AS '2',
            (
            CASE 
            WHEN Pregunta3_5 = 1 THEN 1
            WHEN Pregunta3_5 = 2 THEN 5
            WHEN Pregunta3_5 = 3 THEN 10
            WHEN Pregunta3_5 = 4 THEN 0
            ELSE 0
            END) AS '3',
            (
            CASE 
            WHEN Pregunta3_2 = 1 THEN 1
            WHEN Pregunta3_2 = 2 THEN 5
            WHEN Pregunta3_2 = 3 THEN 10
            WHEN Pregunta3_2 = 4 THEN 0
            ELSE 0
            END) AS '4',
            (
            CASE 
            WHEN Pregunta3_6 = 1 THEN 1
            WHEN Pregunta3_6 = 2 THEN 5
            WHEN Pregunta3_6 = 3 THEN 10
            WHEN Pregunta3_6 = 4 THEN 0
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
                ROUND(((SUM(C.1) + SUM(C.2)) / 2) / COUNT(*),1) AS '1',
                ROUND(((SUM(C.3) + SUM(C.4) + SUM(C.5)) / 3) / COUNT(*),1) AS '2',
                ROUND(((SUM(C.6) + SUM(C.7) + SUM(C.8)) / 3) / COUNT(*),1) AS '3',
                CASE 
                WHEN SUM(C.11) = 0 THEN ROUND(((SUM(C.9) + SUM(C.10)) / 2) / COUNT(*),1) 
                ELSE ROUND(((SUM(C.9) + SUM(C.10)  + SUM(C.11)) / 3) / COUNT(*),1) 
                END AS '4'            
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
        let query = "SELECT * FROM cadomec_innovactionmeter.iam_empresa WHERE IdEmpresa = " + req.query.id
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
    lista_reporte_empleado

}
