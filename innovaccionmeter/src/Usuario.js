import React, { Component } from 'react'
import { AppContext } from './App'

export default class Usuario extends Component {
    constructor(props) {
        super(props)
        Usuario.contextType = AppContext

        this.state = {
            vista: 0
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    datos = async () => {
        this.setState({
            datos: await this.props.datos
        })

    }

    cargar_datos = async () => {        
        for (let i in this.state.datos) {
            if (document.getElementById(i) !== null) {
                document.getElementById(i).value = this.state.datos[i]
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
                titulo_principal: "Modificar Datos Usuario",
                boton: "Actualiza Usuario"
            })
        }

        if (this.props.tipo === "n") {
            this.setState({
                titulo_principal: "Crea registro de Usuario",
                boton: "Crear Usuario"
            })
        }

        if (this.props.tipo === "e") {
            this.setState({
                titulo_principal: "Borrar Usuario",
                boton: "Borrar Usuario"
            })
        }

        await this.datos()          

        this.setState({
            vista: 1
        })        

        if (this.props.tipo === "e" || this.props.tipo === "m") {
            this.cargar_datos()
        }

    }

    validar_form = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "FormUsuario"
        let form_data = {}
        let form_respuesta = {}

        if (this.props.tipo === "m" || this.props.tipo === "n") {
            Array.from(document.getElementById(form_id).elements).filter(obj => { return obj.className.includes("requerido") === true }).map(obj => show_validate(form_id, obj.id))
        }

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
                form_respuesta[id] = document.getElementById(form_id).elements[id].value
            }
        }
        form_respuesta["Fono"] = document.getElementById(form_id).elements["Fono"].value
        

        if (valid) {            
            try {                                
                if (this.props.tipo === "m") {
                    form_data["Id"] = this.state.datos.Id
                    form_data["datos"] = form_respuesta
                }

                if (this.props.tipo === "n") {                    
                    form_data["IdEmpresa"] = this.state.datos.IdEmpresa
                    form_data["Sigla"] = this.state.datos.Sigla
                    form_data["TipoUsuario"] = this.state.datos.tipo_encuesta
                    form_data["datos"] = form_respuesta
                }

                if (this.props.tipo === "e") {
                    form_data["Id"] = this.state.datos.Id
                    form_data["TipoUsuario"] = this.state.datos.TipoUsuario                    
                }
                
                let URL = ""
                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

                if (this.props.tipo === "m") {
                    URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/modificar_usuario"
                }

                if (this.props.tipo === "n") {
                    URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/crear_usuario"
                }

                if (this.props.tipo === "e"){                    
                    URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/borrar_usuario"
                }
                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    if (this.props.tipo === "m") {
                        window.ModalOk(this.state.titulo_principal, "Los datos del usuario fueron modificados con exito")
                        this.props.funcion()
                    }
                    if (this.props.tipo === "n") {
                        window.ModalOk(this.state.titulo_principal, "El Usuario fue creado con exito")
                        document.getElementById(form_id).reset()
                    }
                    if (this.props.tipo === "e") {
                        window.ModalOk(this.state.titulo_principal, "El Usuario fue borrada con exito")
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


    boton_accion = (e) => {
        e.preventDefault()
        if (this.props.tipo === "m" || this.props.tipo === "n") {
            this.validar_form(e)
        } 
        if (this.props.tipo === "e") {
            this.state.tipo_warning(() => this.validar_form(e), this.state.titulo_principal ,"¿Esta seguro que desea borrar el usuario?")
        }


    }

    pagina_principal = () => {
        let class_principal = ""
        if (window.screen.width < 720) {
            class_principal = ""

        } else {
            class_principal = "w-50 mx-auto py-3"
        }
        return (
            <div>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                <form className={class_principal} id="FormUsuario">
                    <div className="form-group">
                        <label htmlFor="Nombre">Nombre:</label>
                        <input type="text" className="form-control requerido" id="Nombre" />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="Fono">Fono:</label>
                        <input type="text" className="form-control" id="Fono" />                        
                    </div>

                    <div className="form-group">
                        <label htmlFor="Correo">Correo:</label>
                        <input type="email" className="form-control requerido" id="Correo" />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="Version">Versión:</label>
                        <select className="form-control requerido" id="Version" defaultValue="3">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </select>
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>
                </form>
                <div className="row py-5 text-center">
                    <div className="col-md-6">
                        <button type="button" className="btn btn-primary px-5" onClick={this.boton_accion}>{this.state.boton}</button>
                    </div>
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                    </div>
                </div>
            </div>
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
