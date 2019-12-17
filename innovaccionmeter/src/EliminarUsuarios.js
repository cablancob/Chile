import React, { Component } from 'react'
import { AppContext } from './App'

export default class EliminarUsuarios extends Component {
    constructor(props) {
        super(props)
        EliminarUsuarios.contextType = AppContext

        this.state = {
            vista: 0,
            titulo: "Borrar usuarios"
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    datos = async () => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/datos_eliminar_usuarios?IdEmpresa=" + parseInt(this.props.datos.IdEmpresa) + "&tipo_encuesta=" + parseInt(this.props.datos.tipo_encuesta)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {                
                this.setState({
                    vista: 1,
                    EncuestaNoIniciada: data[0].C,
                    EncuestaIncompleta: data[1].C,
                    EncuestaFinalizada: data[2].C
                })
            } else if (response.status === 400) {
                window.ModalError("Usuarios", data.error)
            } else {
                this.state.auth_false()
            }

        } catch (e) {
            window.ModalError("Usuarios", e.error)
        }
    }

    funcion_inicial = async () => {
        const { state, auth_false, tipo_warning } = await this.context
        this.setState({
            state,
            auth_false,
            tipo_warning
        })

        await this.datos()


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
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo}</h1>
                <div className={class_principal}>
                    <div className="row py-2">
                        <div className="col-md-6 py-2"><h4>Empresa:</h4></div>
                        <div className="col-md-6 py-2"><h4><b>{this.props.datos.NombreEmpresa}</b></h4></div>
                    </div>
                    <div className="row py-2">
                        <div className="col-md-6 py-2"><h4>Contacto:</h4></div>
                        <div className="col-md-6 py-2"><h4><b>{this.props.datos.Contacto}</b></h4></div>
                    </div>
                    <div className="row py-2">
                        <div className="col-md-6 py-2"><h4># Encuestas Terminada:</h4></div>
                        <div className="col-md-6 py-2"><h4><b>{this.state.EncuestaFinalizada}</b></h4></div>
                    </div>
                    <div className="row py-2">
                        <div className="col-md-6 py-2"><h4># Encuestas Parciales:</h4></div>
                        <div className="col-md-6 py-2"><h4><b>{this.state.EncuestaIncompleta}</b></h4></div>
                    </div>
                    <div className="row py-2">
                        <div className="col-md-6 py-2"><h4># Encuestas sin Comenzar:</h4></div>
                        <div className="col-md-6 py-2"><h4><b>{this.state.EncuestaNoIniciada}</b></h4></div>
                    </div>
                    <div className="row py-2">
                        <div className="col-md-6 py-2"><h4>Cantidad de Usuarios:</h4></div>
                        <div className="col-md-6 py-2"><h4><b>{this.state.EncuestaNoIniciada + this.state.EncuestaFinalizada + this.state.EncuestaIncompleta}</b></h4></div>
                    </div>
                </div>
                <div className="row py-5 text-center">
                    <div className="col-md-6">
                        <button type="button" className="btn btn-primary px-5" onClick={() => this.state.tipo_warning(this.eliminar_usuarios, this.state.titulo ,"¿Esta seguro que desea borrar los usuarios?")}>{this.state.titulo}</button>
                    </div>
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                    </div>
                </div>
            </div>
        )
    }

    eliminar_usuarios = async () => {
        try {

            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))
            
            let form_data = {}
            form_data["IdEmpresa"] = this.props.datos.IdEmpresa
            form_data["TipoUsuario"] = this.props.datos.tipo_encuesta

            const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/eliminar_usuarios"

            let response = await fetch(URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(form_data)
            })

            let data = await response.json()

            if (response.status === 200) {
                window.ModalOk(this.state.titulo, "Los usuario fueron borrados con exito")
                this.props.funcion()                
            } else if (response.status === 400) {
                window.ModalError(this.state.titulo, data.error)
            } else {
                this.state.auth_false()
            }

        } catch (e) {
            window.ModalError(this.state.titulo, e.error)
        }
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
