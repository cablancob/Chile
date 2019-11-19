import React, { Component } from 'react'

import Menu from './Menu'
import EncuestaReporte from './EncuestaReporte'

export default class Encuestas extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pagina: 8,
            cantidad_preguntas: undefined
        }
    }



    avanzar = async (e) => {
        e.preventDefault()
        let valid = true
        let form_data = {}
        let form_respuesta = {}

        //VALIDAR PREGUNTAS
        this.state.cantidad_preguntas.map((numero) => {
            let preguntas_filtradas = this.state.preguntas.filter((obj) => obj.id.toString() === numero.toString())
            if (document.getElementsByName(preguntas_filtradas[0].name).length > 0) {
                if (preguntas_filtradas[0].tipo === "radio" || preguntas_filtradas[0].tipo === "linea") {
                    let validation = false
                    Array.from(document.getElementsByName(preguntas_filtradas[0].name)).map((obj) => {
                        if (obj.checked) {
                            validation = true
                            form_respuesta[obj.name] = obj.value
                        }
                        return true
                    })
                    if (!validation) {
                        document.getElementById(numero).classList.remove("d-none")
                        document.getElementById(numero).classList.add("d-block")
                        window.ModalError("Encuesta", "Todas las preguntas son obligatorias, por favor validar")
                        valid = false
                    } else {
                        document.getElementById(numero).classList.remove("d-block")
                        document.getElementById(numero).classList.add("d-none")
                    }

                }
                if (preguntas_filtradas[0].tipo === "check") {
                    let validation = false
                    Array.from(document.getElementsByName(preguntas_filtradas[0].name)).map((obj) => {
                        if (obj.checked) {
                            validation = true
                            form_respuesta[obj.id] = "1"
                        } else {
                            form_respuesta[obj.id] = "0"
                        }
                        return true
                    })
                    if (!validation) {
                        document.getElementById(numero).classList.remove("d-none")
                        document.getElementById(numero).classList.add("d-block")
                        window.ModalError("Encuesta", "Todas las preguntas son obligatorias, por favor validar")
                        valid = false
                    } else {
                        document.getElementById(numero).classList.remove("d-block")
                        document.getElementById(numero).classList.add("d-none")
                    }

                }
            }
            return true
        })

        if (valid) {
            form_data["TipoUsuario"] = this.props.state.usuario.TipoUsuario
            form_data["Id"] = this.props.state.usuario.Id
            form_data["Pagina"] = this.state.pagina
            form_data["Respuestas"] = form_respuesta


            try {
                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))
                const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/actualizar_encuesta"
                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    this.setState({
                        pagina: this.state.pagina + 1,
                        cantidad_preguntas: undefined
                    })
                    await this.encuesta_data()
                } else if (response.status === 400) {
                    window.ModalError("Encuesta", data.error)
                } else {
                    this.props.auth_false()
                }
            } catch (e) {
                window.ModalError("Encuesta", e.error)
            }
        }
    }

    regresar = async () => {
        await this.setState({
            pagina: this.state.pagina - 1,
            cantidad_preguntas: undefined
        })
        await this.encuesta_data()
    }

    respuestas_bd = async (usuario) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = ""
            URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/encuesta?user=" + usuario.Id + "&tipousuario=" + usuario.TipoUsuario

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()

            if (response.status === 200) {
                this.setState({
                    respuestas_bd: data
                })
                return true
            } else if (response.status === 400) {
                window.ModalError("Encuesta", data.error)
                return false
            } else {
                this.props.auth_false()
                return false
            }

        } catch (e) {
            window.ModalError("Encuesta", e.error)
        }

    }

    encuesta_data = async () => {
        const usuario = this.props.state.usuario

        if (this.state.pagina !== 8) {
            if (await this.respuestas_bd(usuario)) {
                let form_data = {}

                form_data["idioma"] = this.props.state.idioma
                form_data["TipoUsuario"] = usuario.TipoUsuario.toString()
                form_data["pagina"] = this.state.pagina.toString()


                try {
                    let headers = new Headers()
                    headers.append("Content-Type", "application/json")
                    headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

                    const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/preguntas_encuesta"
                    let response = await fetch(URL, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(form_data)
                    })

                    let data = await response.json()

                    if (response.status === 200) {

                        let cantidad_preguntas = []
                        data.map((obj) => {
                            if (!cantidad_preguntas.includes(obj.id)) {
                                cantidad_preguntas.push(obj.id)
                            }
                            return true
                        })

                        this.setState({
                            preguntas: data,
                            cantidad_preguntas
                        })

                        //CARGA RESPUESTA
                        this.state.cantidad_preguntas.map((numero) => {
                            let preguntas_filtradas = this.state.preguntas.filter((obj) => obj.id.toString() === numero.toString())
                            if (preguntas_filtradas[0].tipo === "radio" || preguntas_filtradas[0].tipo === "linea") {
                                Array.from(document.getElementsByName(preguntas_filtradas[0].name)).map((obj) => obj.value === this.state.respuestas_bd[preguntas_filtradas[0].name].toString() ? obj.checked = true : obj.checked = false)
                            }
                            if (preguntas_filtradas[0].tipo === "check") {
                                Array.from(document.getElementsByName(preguntas_filtradas[0].name)).map((obj) => (this.state.respuestas_bd[obj.id] === 1) ? obj.checked = true : obj.checked = false)
                            }

                            return true
                        })


                    } else if (response.status === 400) {
                        window.ModalError("Encuesta", data.error)
                    } else {
                        this.props.auth_false()
                    }

                } catch (e) {
                    window.ModalError("Encuesta", e.error)
                }

            }
        }
    }


    componentDidMount = async () => {
        await this.encuesta_data()
    }

    Preguntas = () => {
        const usuario = this.props.state.usuario
        let titulo = ""
        let subtitulo = ""
        let explicacion = ""
        let paginacion = "(" + this.state.pagina + "/7)"


        if (this.props.state.idioma === "ESP") {

            if (usuario.TipoUsuario.toString() === "2") {
                titulo = "Encuesta Comité Ejecutivo Inicial - 90°"
                if (this.state.pagina.toString() === "1") subtitulo = "I. Información General"

                if (this.state.pagina.toString() === "2") subtitulo = "II. Resultados de aplicar Innovación"

                if (this.state.pagina.toString() === "3") subtitulo = "III. Impacto y expectativas de las iniciativas de innovación en los resultados"
                if (this.state.pagina.toString() === "3") explicacion = "Se refiere a la importancia en el resultado que han tenido o tendrán los distintos esfuerzos de innovación en la empresa. Entienda resultados como crecimiento en ventas, reducción de costos, rentabilidad, etc."

                if (this.state.pagina.toString() === "4") subtitulo = "IV. Liderando la Innovación"
                if (this.state.pagina.toString() === "4") explicacion = "¿Usted como un líder de la empresa qué tan de acuerdo está con las siguientes afirmaciones?"

                if (this.state.pagina.toString() === "5") subtitulo = "V. Organización para la Innovación"
                if (this.state.pagina.toString() === "5") explicacion = "Respecto al nivel de desarrollo de la organización para llevar adelante la innovación en su empresa, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes afirmaciones"

                if (this.state.pagina.toString() === "6") subtitulo = "VI. Cultura Pro Innovación"
                if (this.state.pagina.toString() === "6") explicacion = "Respecto al nivel de desarrollo de las características que representan la cultura de innovación de la organización, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes afirmaciones"

                if (this.state.pagina.toString() === "7") subtitulo = "VII. Facilitadores de Innovación"
                if (this.state.pagina.toString() === "7") explicacion = "Respecto al uso de herramientas o métodos para innovar que han utilizado en su empresa, por favor seleccione en cada caso el nivel de uso que crea que corresponde."
            }

            if (usuario.TipoUsuario.toString() === "3") {
                titulo = "Encuesta Colaboradores - 180°"
                if (this.state.pagina.toString() === "1") subtitulo = "I. Información General"

                if (this.state.pagina.toString() === "2") subtitulo = "II. Resultados de aplicar Innovación"

                if (this.state.pagina.toString() === "3") subtitulo = "III. Impacto y expectativas de las iniciativas de innovación en los resultados"
                if (this.state.pagina.toString() === "3") explicacion = "Se refiere a la importancia en el resultado que han tenido o tendrán los distintos esfuerzos de innovación en la empresa. Entienda resultados como crecimiento en ventas, reducción de costos, rentabilidad, etc."

                if (this.state.pagina.toString() === "4") subtitulo = "IV. Liderando la Innovación"
                if (this.state.pagina.toString() === "4") explicacion = "¿Usted como un líder de la empresa qué tan de acuerdo está con las siguientes afirmaciones?"

                if (this.state.pagina.toString() === "5") subtitulo = "V. Organización para la Innovación"
                if (this.state.pagina.toString() === "5") explicacion = "Respecto al nivel de desarrollo de la organización para llevar adelante la innovación en su empresa, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes afirmaciones"

                if (this.state.pagina.toString() === "6") subtitulo = "VI. Cultura Pro Innovación"
                if (this.state.pagina.toString() === "6") explicacion = "Respecto al nivel de desarrollo de las características que representan la cultura de innovación de la organización, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes afirmaciones"

                if (this.state.pagina.toString() === "7") subtitulo = "VII. Facilitadores de Innovación"
                if (this.state.pagina.toString() === "7") explicacion = "Respecto al uso de herramientas o métodos para innovar que han utilizado en su empresa, por favor seleccione en cada caso el nivel de uso que crea que corresponde."
            }
            if (usuario.TipoUsuario.toString() === "4") {
                titulo = "Encuesta Proveedores - 270°"
                if (this.state.pagina.toString() === "1") subtitulo = "I. Información General"

                if (this.state.pagina.toString() === "2") subtitulo = "II. Resultados de aplicar Innovación"

                if (this.state.pagina.toString() === "3") subtitulo = "III. Impacto y expectativas de las iniciativas de innovación en los resultados"
                if (this.state.pagina.toString() === "3") explicacion = "Se refiere a la importancia en el resultado que han tenido o tendrán los distintos esfuerzos de innovación en la empresa. Entienda resultados como crecimiento en ventas, reducción de costos, rentabilidad, etc."

                if (this.state.pagina.toString() === "4") subtitulo = "IV. Liderando la Innovación"
                if (this.state.pagina.toString() === "4") explicacion = "¿Usted qué tan de acuerdo creería estar con las siguientes afirmaciones?"

                if (this.state.pagina.toString() === "5") subtitulo = "V. Co-Creación"
                if (this.state.pagina.toString() === "5") explicacion = "Respecto al nivel de desarrollo de la organización para llevar adelante la innovación en LA EMPRESA PARA LA CUAL USTED ES PROVEEDOR, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes"

                if (this.state.pagina.toString() === "6") subtitulo = "VI. Cultura Pro Innovación"
                if (this.state.pagina.toString() === "6") explicacion = "Respecto al nivel de desarrollo de las características que representan la cultura de innovación de la organización, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes afirmaciones"

                if (this.state.pagina.toString() === "7") subtitulo = "VII. Facilitadores de Innovación"
                if (this.state.pagina.toString() === "7") explicacion = "Respecto al uso de herramientas o métodos para innovar que han utilizado en su empresa, por favor seleccione en cada caso el nivel de uso que crea que corresponde."
            }
            if (usuario.TipoUsuario.toString() === "5") {
                titulo = "Encuesta Clientes - 360°"
                if (this.state.pagina.toString() === "1") subtitulo = "I. Información General"

                if (this.state.pagina.toString() === "2") subtitulo = "II. Resultados de aplicar Innovación"

                if (this.state.pagina.toString() === "3") subtitulo = "III. Impacto y expectativas de las iniciativas de innovación en los resultados"
                if (this.state.pagina.toString() === "3") explicacion = "Se refiere a la importancia en el resultado que han tenido o tendrán los distintos esfuerzos de innovación en la empresa. Entienda resultados como crecimiento en ventas, reducción de costos, rentabilidad, etc."

                if (this.state.pagina.toString() === "4") subtitulo = "IV. Liderando la Innovación"
                if (this.state.pagina.toString() === "4") explicacion = "¿Usted qué tan de acuerdo creería estar con las siguientes afirmaciones?"

                if (this.state.pagina.toString() === "5") subtitulo = "V. Co-Creación"
                if (this.state.pagina.toString() === "5") explicacion = "Respecto al nivel de desarrollo de la organización para llevar adelante la innovación en LA EMPRESA PARA LA CUAL USTED ES CLIENTE, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes"

                if (this.state.pagina.toString() === "6") subtitulo = "VI. Cultura Pro Innovación"
                if (this.state.pagina.toString() === "6") explicacion = "Respecto al nivel de desarrollo de las características que representan la cultura de innovación de la organización, por favor seleccione el nivel de desarrollo que crea que corresponde a cada una de las siguientes afirmaciones"

                if (this.state.pagina.toString() === "7") subtitulo = "VII. Facilitadores de Innovación"
                if (this.state.pagina.toString() === "7") explicacion = "Respecto al uso de herramientas o métodos para innovar que han utilizado en su empresa, por favor seleccione en cada caso el nivel de uso que crea que corresponde."
            }
        }

        //PAGINA
        return (
            <div className="">
                <h1 className="h3 mb-4 text-gray-800 text-center">{titulo}</h1>
                <h1 className="h4 mb-4 text-gray-800 text-center px-2">{subtitulo}</h1>
                <h1 className="h4 mb-4 text-gray-800 text-center">{paginacion}</h1>
                <div className={(this.state.pagina > 2 && this.state.pagina < 8) ? "h5 alert alert-warning d-block" : "h5 alert alert-warning d-none"} tabIndex="-1" role="alert">{explicacion}</div>
                {
                    this.state.cantidad_preguntas.map((numero) => {
                        let pregunta = this.state.preguntas.filter((obj) => { return (obj.id === numero) })
                        if (pregunta[0].version.toString() === "0" || pregunta[0].version.toString() === usuario.Version.toString()) {
                            return (
                                <div className="container-fluid" key={numero}>
                                    <div className="card form-group">
                                        <div className="h5 card-header bg-white text-dark text-center" dangerouslySetInnerHTML={{ __html: pregunta[0].pregunta }}></div>
                                        <div className="h5 card-body form-group">
                                            {
                                                pregunta.map((obj, index) => {
                                                    if (obj.tipo.toString() === "radio") {
                                                        if (obj.valor.toString() !== "999") {
                                                            if (obj.version.toString() === "0") {
                                                                return (
                                                                    <div className="form-check" key={obj.valor} id={obj.name}>
                                                                        <input className="form-check-input py-1" type="radio" name={obj.name} value={obj.valor} />
                                                                        <label className="form-check-label py-1" >{obj.pregunta}</label>
                                                                    </div>

                                                                )
                                                            } else if (obj.version.toString() === usuario.Version.toString()) {
                                                                return (
                                                                    <div className="form-check" key={obj.valor}>
                                                                        <input className="form-check-input py-1" type="radio" name={obj.name} value={obj.valor} />
                                                                        <label className="form-check-label py-1" >{obj.pregunta}</label>
                                                                    </div>
                                                                )
                                                            }
                                                        }
                                                    }
                                                    if (obj.tipo.toString() === "check") {
                                                        if (obj.valor.toString() !== "999") {
                                                            if (obj.version.toString() === "0") {
                                                                return (
                                                                    <div className="form-check" key={index}>
                                                                        <input className="form-check-input py-1" type="checkbox" name={obj.name} value={obj.valor} id={obj.id_pregunta} />
                                                                        <label className="form-check-label py-1" >{obj.pregunta}</label>
                                                                    </div>

                                                                )
                                                            } else if (obj.version.toString() === usuario.Version.toString()) {
                                                                return (
                                                                    <div className="form-check" key={index}>
                                                                        <input className="form-check-input py-1" type="checkbox" name={obj.name} value={obj.valor} id={obj.id_pregunta} />
                                                                        <label className="form-check-label py-1" >{obj.pregunta}</label>
                                                                    </div>
                                                                )
                                                            }
                                                        }
                                                    }
                                                    if (obj.tipo.toString() === "linea") {
                                                        if (obj.valor.toString() !== "999") {
                                                            if (obj.version.toString() === "0") {
                                                                return (
                                                                    <div className="table-responsive" key={obj.valor}>
                                                                        <table className="table table-bordered text-center">
                                                                            <caption className="d-md-none">Deslice a la derecha</caption>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th scope="col"></th>
                                                                                    <th scope="col">1</th>
                                                                                    <th scope="col">2</th>
                                                                                    <th scope="col">3</th>
                                                                                    <th scope="col">4</th>
                                                                                    <th scope="col"></th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>{obj.pregunta.split("|")[0]}</td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="1" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="2" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="3" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="4" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>{obj.pregunta.split("|")[1]}</td>
                                                                                </tr>

                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )
                                                            } else if (obj.version.toString() === usuario.Version.toString()) {
                                                                return (
                                                                    <div className="table-responsive" key={obj.valor}>
                                                                        <table className="table table-bordered text-center">
                                                                            <caption className="d-md-none">Deslice a la derecha</caption>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th scope="col"></th>
                                                                                    <th scope="col">1</th>
                                                                                    <th scope="col">2</th>
                                                                                    <th scope="col">3</th>
                                                                                    <th scope="col">4</th>
                                                                                    <th scope="col"></th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td>{obj.pregunta.split("|")[0]}</td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="1" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="2" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="3" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>
                                                                                        <div className="form-check">
                                                                                            <input className="form-check-input" type="radio" name={obj.name} value="4" />
                                                                                        </div>
                                                                                    </td>
                                                                                    <td>{obj.pregunta.split("|")[1]}</td>
                                                                                </tr>

                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )
                                                            }
                                                        }
                                                    }
                                                    return true
                                                })
                                            }
                                        </div>
                                        <div className="alert alert-danger d-none" tabIndex="-1" role="alert" id={pregunta[0].id}>Pregunta Obligatoria</div>
                                    </div>
                                </div>
                            )
                        }
                        return true
                    })
                }
                <div>
                    <div className="row my-5">
                        <div className="col-md-6 text-center">
                            <button type="button" className="btn btn-primary px-5 my-2" style={{ display: this.state.pagina === 1 ? "none" : "inline" }} onClick={this.regresar}>{"<< Anterior"}</button>
                        </div>
                        <div className="col-md-6 text-center">
                            <button type="button" className="btn btn-primary px-5 my-2" style={{ display: this.state.pagina === 8 ? "none" : "inline" }} onClick={this.avanzar}>{"Siguiente >>"}</button>
                        </div>
                    </div>
                </div>

            </div>

        )
    }

    render() {
        const usuario = this.props.state.usuario
        return (
            <div className="">
                <div id="wrapper" className="">
                    <div id="content-wrapper" className="d-flex flex-column">
                        <div id="content">
                            <Menu Nombre={usuario.Nombre} tipo_warning={this.props.tipo_warning} />
                            {(this.state.cantidad_preguntas !== undefined && this.state.pagina !== 8) ? <this.Preguntas /> : ""}
                            {(this.state.pagina === 8) ? <EncuestaReporte tipo_encuesta={this.props.state.usuario.TipoUsuario} id_usuario={this.props.state.usuario.Id} id_empresa={0} idioma={this.props.state.idioma} auth_false={this.props.auth_false} funcion={this.regresar} /> : ""}
                        </div>
                        <footer className="sticky-footer bg-white">
                            <div className="container my-auto">
                                <div className="copyright text-center my-auto">
                                    <span>Copyright &copy; Best Place to Innovate</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        )
    }
}
