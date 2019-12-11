import React, { Component } from 'react'
import { AppContext } from './App'

import ModalUltimatum from './Modals/ModalUltimatum'

export default class EnviarUltimatum extends Component {
    constructor(props) {
        super(props)
        EnviarUltimatum.contextType = AppContext

        this.state = {
            vista: 0,
            titulo_principal: "Envio mail de Ultimatum"
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()        
    }

    obtener_correo = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/obtener_correo"
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos_correo: data
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
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/datos_empresa?id=" + parseInt(id)
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = {}
                datos["usuario"] = this.state.usuario
                datos["empresa"] = data
                this.setState({
                    datos_empresa: data,
                    vista: 1,
                    datos
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
            tipo_warning
        })

        this.setState({
            usuario: this.props.datos.usuario
        })        

        await this.obtener_correo()
        await this.datos(this.props.datos.IdEmpresa)        

    }

    validar_form = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "EnviarUltimatumForm"
        let form_data = {}


        Array.from(document.getElementById(form_id).elements).filter(obj => { return obj.className.includes("requerido") === true }).map(obj => {
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
                window.ModalUltimatum()
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
        const empresa = this.state.datos_empresa
        const usuario = this.state.usuario        
        return (
            <div className={class_principal}>
                <ModalUltimatum datos={this.state.datos} funcion={this.props.funcion}/>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                <div className="row py-3">
                    <div className="col-md-6 text-dark">Empresa:</div>
                    <div className="col-md-6">{empresa.NombreEmpresa}</div>
                </div>
                <div className="row py-3">
                    <div className="col-md-6 text-dark">Usuario:</div>
                    <div className="col-md-6">{usuario.Nombre}</div>
                </div>
                <div className="row py-3">
                    <div className="col-md-6 text-dark">Mail Usuario:</div>
                    <div className="col-md-6">{usuario.Correo}</div>
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
                <label className="py-3"><u><b>REMITENTE:</b></u></label>
                <form id="EnviarUltimatumForm">
                    <div className="form-group">
                        <label htmlFor="Nombre">Nombre:</label>
                        <input type="text" className="form-control requerido" id="Nombre" readOnly defaultValue={this.state.datos_correo[0].nombre} />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="Correo">Correo:</label>
                        <input type="text" className="form-control requerido" id="Correo" readOnly defaultValue={this.state.datos_correo[0].correo} />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>

                </form>
                <div className="row py-5 text-center">
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.validar_form}>Enviar Ultimatum</button>
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
