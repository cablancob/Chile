import React, { Component } from 'react'
import { AppContext } from './App'

export default class Empresa extends Component {
    constructor(props) {
        super(props)

        Empresa.contextType = AppContext

        this.state = {
            vista: 0
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    validar_form = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "EmpresaID"
        let form_data = {}
        let form_respuesta = {}
        let peso = 0

        if (this.props.tipo === "m" || this.props.tipo === "n") {
            Array.from(document.getElementById(form_id).elements)
                .filter(obj => { return obj.type === "text" || obj.type === "number" })
                .map(obj => {
                    show_validate(form_id, obj.id)
                    return true
                })

            function show_validate(form_id, id) {
                if (document.getElementById(id).className.includes("Encuesta90") || document.getElementById(id).className.includes("Encuesta180") || document.getElementById(id).className.includes("Encuesta270") || document.getElementById(id).className.includes("Encuesta360")) {
                    if (document.getElementById(document.getElementById(id).className.split(" ")[1]).checked) {                        
                        if (document.getElementById(form_id).elements[id].id === "R090" || document.getElementById(form_id).elements[id].id === "R180" || document.getElementById(form_id).elements[id].id === "R270" || document.getElementById(form_id).elements[id].id === "R360") {                            
                            peso += parseInt(document.getElementById(form_id).elements[id].value.trim())
                        }
                        form_respuesta[document.getElementById(id).className.split(" ")[1]] = 'S'
                        if (document.getElementById(form_id).elements[id].value.trim() === "") {
                            valid = false
                            document.getElementById(form_id).elements[id].classList.remove("is-valid")
                            document.getElementById(form_id).elements[id].classList.add("is-invalid")
                            if (focus) {
                                document.getElementById(form_id).elements[id].focus()
                                focus = false
                            }
                        } else {
                            document.getElementById(form_id).elements[id].classList.remove("is-invalid")
                            document.getElementById(form_id).elements[id].classList.add("is-valid")
                            form_respuesta[id] = document.getElementById(form_id).elements[id].value
                        }
                    } else {
                        form_respuesta[document.getElementById(id).className.split(" ")[1]] = 'N'
                        form_respuesta[id] = "0"
                    }
                } else {
                    if (document.getElementById(form_id).elements[id].value.trim() === "") {
                        valid = false
                        document.getElementById(form_id).elements[id].classList.remove("is-valid")
                        document.getElementById(form_id).elements[id].classList.add("is-invalid")
                        if (focus) {
                            document.getElementById(form_id).elements[id].focus()
                            focus = false
                        }
                    } else {
                        document.getElementById(form_id).elements[id].classList.remove("is-invalid")
                        document.getElementById(form_id).elements[id].classList.add("is-valid")
                        form_respuesta[id] = document.getElementById(form_id).elements[id].value
                    }
                }

            }
        }
        if (peso < 100) {
            window.ModalError(this.state.titulo_principal, "La suma de los valores del campo peso (Resumen) no puede ser menor a 100")            
            valid = false
        }

        if (valid) {
            try {
                if (this.props.tipo === "m" || this.props.tipo === "n") {
                    let fecha = form_respuesta["Fecha"].split("/")
                    if (this.props.tipo === "m") {
                        form_data["IdEmpresa"] = this.state.datos_empresa.IdEmpresa
                    }
                    if (this.props.tipo === "n") {
                        form_respuesta["Vigente"] = 'S'
                    }
                    form_respuesta["Fecha"] = fecha[2] + "-" + fecha[1] + "-" + fecha[0]
                    form_data["datos"] = form_respuesta
                }

                if (this.props.tipo === "e") {
                    form_data["IdEmpresa"] = this.state.datos_empresa.IdEmpresa
                }

                let URL = ""
                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

                if (this.props.tipo === "m") {
                    URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/modificar_empresa"
                }

                if (this.props.tipo === "n") {
                    URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/crear_empresa"
                }

                if (this.props.tipo === "e") {
                    URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/eliminar_empresa"
                }

                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    if (this.props.tipo === "m") {
                        window.ModalOk(this.state.titulo_principal, "Los datos de la empresa fueron modificados con exito")
                        await this.datos_empresa(this.props.IdEmpresa)
                    }
                    if (this.props.tipo === "n") {
                        window.ModalOk(this.state.titulo_principal, "La empresa fue creada con exito")
                        //document.getElementById(form_id).reset()
                        this.props.funcion()
                    }
                    if (this.props.tipo === "e") {
                        window.ModalOk(this.state.titulo_principal, "La empresa fue borrada con exito")
                        this.props.funcion()
                    }
                    window.RemoveClass()

                } else if (response.status === 400) {
                    window.ModalError(this.state.titulo_principal, data.error)
                } else {
                    this.state.auth_false()
                }
            } catch (e) {
                window.ModalError(this.state.titulo_principal, e.error)
            }
        }
    }

    carga_datos_empresa_default = () => {

        const datos = [17, 17, 17, 17, 16, 16, 25]

        datos.map((obj, index) => {
            let valor = obj
            Array.from(document.getElementsByName(index)).map((obj) => {
                document.getElementById(obj.id).value = valor
                return true
            })
            window.datepicket("Fecha")
            return true
        })

    }

    carga_datos_empresa = () => {

        for (let i in this.state.datos_empresa) {
            if (document.getElementById(i) !== null) {
                if (document.getElementById(i).type === "checkbox") {
                    document.getElementById(i).checked = (this.state.datos_empresa[i] === "S") ? true : false
                } else {
                    if (i === "Fecha") {
                        let fecha = this.state.datos_empresa[i].split("T")
                        fecha = fecha[0].split("-")
                        window.datepicket("Fecha")
                        document.getElementById(i).value = fecha[2] + "/" + fecha[1] + "/" + fecha[0]
                    } else {
                        document.getElementById(i).value = this.state.datos_empresa[i]
                    }
                }

            }

        }
    }

    funcion_inicial = async () => {

        const { state, auth_false, tipo_warning } = await this.context
        this.setState({
            state,
            auth_false,
            tipo_warning
        })

        if (this.props.tipo === "m") {
            this.setState({
                titulo_principal: "Modifica Datos Empresa",
                boton: "Actualiza Empresa"
            })
        }

        if (this.props.tipo === "n") {
            this.setState({
                titulo_principal: "Crea registro de Empresa",
                boton: "Crear Empresa"
            })
        }

        if (this.props.tipo === "e") {
            this.setState({
                titulo_principal: "Borrar Empresa",
                boton: "Borrar Empresa"
            })
        }

        if (this.props.tipo === "m" || this.props.tipo === "e") {
            await this.datos_empresa(this.props.IdEmpresa)
        }

        this.setState({
            vista: await 1
        })

        if (this.props.tipo === "m" || this.props.tipo === "e") {
            this.carga_datos_empresa()
        } else if (this.props.tipo === "n") {
            this.carga_datos_empresa_default()
        }

    }

    boton_accion = (e) => {
        e.preventDefault()
        if (this.props.tipo === "m" || this.props.tipo === "n") {
            this.validar_form(e)
        }
        if (this.props.tipo === "e") {
            this.state.tipo_warning(() => this.validar_form(e), this.state.titulo_principal, "¿Esta seguro que desea borrar la empresa?")
        }
    }

    datos_empresa = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/datos_empresa?id=" + parseInt(id)
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos_empresa: data
                })
            } else if (response.status === 400) {
                window.ModalError(this.state.titulo_principal, data.error)
            } else {
                this.state.auth_false()
            }

        } catch (e) {
            window.ModalError(this.state.titulo_principal, e.error)
        }
    }

    pagina_principal = () => {
        let class_principal = ""
        let titulo = ""
        let subtitulo = ""
        let contenido = ""
        let contenido_2 = ""
        let division = ""

        if (window.screen.width < 720) {
            class_principal = ""
            titulo = "row bg-primary text-white text-center d-none"
            subtitulo = "col-md-6 bg-primary text-white"
            contenido = "col-md-6"
            contenido_2 = "col-md-6"
            division = "row text-center py-4"

        } else {
            class_principal = "w-50 mx-auto py-3"
            titulo = "row bg-primary text-white text-center"
            subtitulo = "bg-primary text-white d-none"
            contenido = "col-md py-2"
            contenido_2 = "col-md-2 py-2"
            division = "row text-center"
        }
        return (
            <div>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                <div className="d-flex justify-content-center py-5">
                    <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                </div>
                <form id="EmpresaID">
                    <div className={class_principal}>
                        <div className="form-group">
                            <label htmlFor="NombreEmpresa">Nombre:</label>
                            <input type="text" className="form-control" id="NombreEmpresa" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Sigla">Sigla:</label>
                            <input type="text" className="form-control" id="Sigla" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Contacto">Contacto:</label>
                            <input type="text" className="form-control" id="Contacto" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Correo">Correo:</label>
                            <input type="text" className="form-control" id="Correo" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Fecha">Fec.Seguimiento:</label>
                            <input type="text" className="form-control" id="Fecha" readOnly />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                    </div>
                    <div className="p-2">
                        <div className={titulo}>
                            <div className="col-md-2 py-2" style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                        </div>
                        <div className={division}>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-check text-left">
                                    <input className="form-check-input" type="checkbox" value="" id="Encuesta90" />
                                    <label className="form-check-label" htmlFor="Encuesta90">Equipo Gerencial (90°)</label>
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="0" className="form-control Encuesta90" id="P0901" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="1" className="form-control Encuesta90" id="P0902" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="2" className="form-control Encuesta90" id="P0903" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="3" className="form-control Encuesta90" id="P0904" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="4" className="form-control Encuesta90" id="P0905" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="5" className="form-control Encuesta90" id="P0906" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="6" className="form-control Encuesta90" id="R090" />
                                </div>
                            </div>
                        </div>

                        <div className={division}>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-check text-left">
                                    <input className="form-check-input" type="checkbox" value="" id="Encuesta180" />
                                    <label className="form-check-label" htmlFor="Encuesta180">Colaboradores (180°)</label>
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="0" className="form-control Encuesta180" id="P1801" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="1" className="form-control Encuesta180" id="P1802" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="2" className="form-control Encuesta180" id="P1803" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="3" className="form-control Encuesta180" id="P1804" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="4" className="form-control Encuesta180" id="P1805" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="5" className="form-control Encuesta180" id="P1806" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="6" className="form-control Encuesta180" id="R180" />
                                </div>
                            </div>
                        </div>

                        <div className={division}>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-check text-left">
                                    <input className="form-check-input" type="checkbox" value="" id="Encuesta270" />
                                    <label className="form-check-label" htmlFor="Encuesta270">Proveedores (270°)</label>
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="0" className="form-control Encuesta270" id="P2701" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="1" className="form-control Encuesta270" id="P2702" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="2" className="form-control Encuesta270" id="P2703" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="3" className="form-control Encuesta270" id="P2704" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="4" className="form-control Encuesta270" id="P2705" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="5" className="form-control Encuesta270" id="P2706" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="6" className="form-control Encuesta270" id="R270" />
                                </div>
                            </div>
                        </div>

                        <div className={division}>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-check text-left">
                                    <input className="form-check-input" type="checkbox" value="" id="Encuesta360" />
                                    <label className="form-check-label" htmlFor="Encuesta360">Clientes (360°)</label>
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="0" className="form-control Encuesta360" id="P3601" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="1" className="form-control Encuesta360" id="P3602" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="2" className="form-control Encuesta360" id="P3603" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="3" className="form-control Encuesta360" id="P3604" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="4" className="form-control Encuesta360" id="P3605" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="5" className="form-control Encuesta360" id="P3606" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="number" name="6" className="form-control Encuesta360" id="R360" />
                                </div>
                            </div>
                        </div>


                    </div>
                </form>
                <div className="row py-5 text-center">
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.boton_accion}>{this.state.boton}</button>
                    </div>
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                    </div>
                </div>
            </div >
        )
    }

    render() {
        return (
            <div>
                {
                    (this.state.vista === 1) ? <this.pagina_principal />
                        : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }
}
