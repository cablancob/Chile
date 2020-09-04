import React, { Component } from "react"
import { AppContext } from "./App"

export default class EnviarInvitaciones extends Component {
    constructor(props) {
        super(props)
        EnviarInvitaciones.contextType = AppContext

        this.state = {
            vista: 0,
            titulo_principal: "Envio mail de Invitación",
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    obtener_correo = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem("innovaccionmeter_session"))

            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/obtener_correo"
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos_correo: data,
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

    datos = async (id) => {
        try {
            let headers = new Headers()
            let contenido_email
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem("innovaccionmeter_session"))

            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/datos_empresa?id=" + parseInt(id)
            let response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/email_text_bienvenida"
                response = await fetch(URL, {
                    method: "GET",
                    headers: headers,
                })
                contenido_email = await response.json()
                this.setState({
                    datos_empresa: data,                    
                    contenido_email: contenido_email[0].contenido,
                    vista: 1,
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

    funcion_inicial = async () => {
        const { state, auth_false, tipo_warning } = await this.context
        this.setState({
            state,
            auth_false,
            tipo_warning,
        })

        await this.obtener_correo()
        await this.datos(this.props.datos.IdEmpresa)
    }

    validar_form = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "EnviarInvitacionesForm"
        let form_data = {}

        Array.from(document.getElementById(form_id).elements)
            .filter((obj) => {
                return obj.className.includes("requerido") === true
            })
            .map((obj) => {
                show_validate(form_id, obj.id)
                return true
            })

        function show_validate(form_id, id) {
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
                form_data[id] = document.getElementById(form_id).elements[id].value
            }
        }

        if (valid) {
            try {
                form_data["empresa"] = this.state.datos_empresa
                form_data["datos"] = this.props.datos.usuarios
                form_data["cotenido_email"] = this.state.contenido_email
                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem("innovaccionmeter_session"))

                let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/enviar_invitaciones"

                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data),
                })                

                let data = await response.json()

                if (response.status === 200) {
                    window.ModalOk(this.state.titulo_principal, "Las invitaciones fueron enviadas con exito")
                    window.RemoveClass()
                    this.props.funcion()
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

    pagina_principal = () => {
        let class_principal = ""
        if (window.screen.width < 720) {
            class_principal = ""
        } else {
            class_principal = "w-50 mx-auto py-3"
        }
        let empresa = this.state.datos_empresa        
        return (
            <div className={class_principal}>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                <div className="row py-3">
                    <div className="col-md-6 text-dark">Empresa:</div>
                    <div className="col-md-6">{empresa.NombreEmpresa}</div>
                </div>
                <div className="row py-3">
                    <div className="col-md-6 text-dark">Contacto Empresa:</div>
                    <div className="col-md-6">{empresa.Contacto}</div>
                </div>
                <div className="row py-3">
                    <div className="col-md-6 text-dark">Mail Contacto:</div>
                    <div className="col-md-6">{empresa.correo_contacto}</div>
                </div>
                <hr />
                <label className="py-3">
                    <u>
                        <b>REMITENTE:</b>
                    </u>
                </label>
                <form id="EnviarInvitacionesForm">
                    <div className="form-group">
                        <label htmlFor="Nombre">Nombre:</label>
                        <input type="text" className="form-control requerido" id="Nombre" defaultValue={this.state.datos_correo[0].nombre} />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="Correo">Correo:</label>
                        <input type="text" className="form-control requerido" id="Correo" defaultValue={this.state.datos_correo[0].correo} />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="Correo">Texto del Correo:</label>
                        <textarea className="form-control requerido" rows="5" id="TextEmail" defaultValue={this.state.contenido_email} />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>
                </form>
                <div className="row py-5 text-center">
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.validar_form}>
                            Enviar Invitaciones
                        </button>
                    </div>
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>
                            {"<< Anterior"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.state.vista === 1 ? (
                    <this.pagina_principal />
                ) : (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="sr-only">Espere...</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}
