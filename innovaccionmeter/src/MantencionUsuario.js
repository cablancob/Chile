import React, { Component } from 'react'
import { AppContext } from './App'

import Usuario from './Usuario'
import EliminarUsuarios from './EliminarUsuarios'
import EnviarInvitaciones from './EnviarInvitaciones'
import EnviarUltimatum from './EnviarUltimatum'

export default class MantencionUsuario extends Component {

    constructor(props) {
        super(props)
        MantencionUsuario.contextType = AppContext

        this.state = {
            vista: 0
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    regresar = async () => {
        this.setState({
            vista: 0
        })
        await this.funcion_inicial()
    }

    ultimatum(obj) {    
        //enviar_ultimatum
        if (obj.status === "1") {
            return <u><a className="text-dark" href="/InnovAccionMeter2020/#" onClick={() => this.enviar_ultimatum(obj)}>Envia Ultimatum</a></u>
        } else {
            return ""
        }
    }

    datos = async () => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/usuarios_empresa?IdEmpresa=" + parseInt(this.props.IdEmpresa) + "&tipo_encuesta=" + parseInt(this.props.tipo_encuesta)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos: data,
                    vista: 1
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
        const { state, auth_false } = await this.context
        this.setState({
            state,
            auth_false
        })
        await this.datos()

    }

    modifcar_usuario(obj) {
        this.setState({
            usuario: obj,
            tipo: "m",
            vista: 2
        })
    }

    crear_usuario(IdEmpresa, tipo_encuesta, Sigla) {
        let obj = {}
        obj["IdEmpresa"] = IdEmpresa
        obj["tipo_encuesta"] = tipo_encuesta
        obj["Sigla"] = Sigla
        this.setState({
            usuario: obj,
            tipo: "n",
            vista: 2
        })
    }

    borrar_usuario(obj) {
        this.setState({
            usuario: obj,
            tipo: "e",
            vista: 2
        })
    }

    eliminar_usuarios(IdEmpresa, tipo_encuesta, NombreEmpresa, Contacto) {
        let obj = {}
        obj["IdEmpresa"] = IdEmpresa
        obj["tipo_encuesta"] = tipo_encuesta
        obj["NombreEmpresa"] = NombreEmpresa
        obj["Contacto"] = Contacto
        this.setState({
            usuario: obj,
            vista: 3
        })
    }

    enviar_ultimatum(usuario) {
        let obj = {}
        obj["IdEmpresa"] = this.props.IdEmpresa
        obj["usuario"] = usuario        
        this.setState({
            usuario: obj,
            vista: 5
        })
    }

    enviar_invitaciones() {
        let obj = {}                       
        obj["IdEmpresa"] = this.props.IdEmpresa        
        obj["usuarios"] = this.state.datos.filter((obj) => {return obj.status === "0"})                    
        this.setState({
            usuario: obj,
            vista: 4
        })
    }


    pagina_principal = () => {
        const datos = this.state.datos
        let titulo = ""
        let subtitulo = ""
        let contenido = ""
        let division = ""
        let contenido_2 = ""
        let contenido_3 = ""

        if (window.screen.width < 720) {
            titulo = "row bg-primary text-white text-center d-none"
            subtitulo = "col-md-6 bg-primary text-white"
            contenido = "col-md-6"
            contenido_2 = "col-md-6"
            contenido_3 = "col-md-6"
            division = "row text-center py-4"

        } else {
            titulo = "row bg-primary text-white text-center"
            subtitulo = "bg-primary text-white d-none"
            contenido = "col py-2"
            contenido_2 = "col-2 py-2"
            contenido_3 = "col-3 py-2"
            division = "row text-center"
        }
        return (
            <div className="px-2">
                <h1 className="h3 my-4 text-gray-800 text-center">Usuarios: {this.props.NombreEmpresa}</h1>
                <h1 className="h3 my-4 text-gray-800 text-center"><i className="far fa-trash-alt" onClick={() => this.eliminar_usuarios(this.props.IdEmpresa, this.props.tipo_encuesta, this.props.NombreEmpresa, this.props.Contacto)}></i></h1>
                <div className="row">
                    <div className="col-md-6 py-3 text-center">
                        <u><a className="text-dark" href="/InnovAccionMeter2020/#" onClick={() => this.crear_usuario(this.props.IdEmpresa, this.props.tipo_encuesta, this.props.Sigla)}>--- Crea Nuevo Usuario ---</a></u>
                    </div>
                    <div className="col-md-6 py-3 text-center">
                        <u><a className="text-dark" href="/InnovAccionMeter2020/#" onClick={async () => await this.enviar_invitaciones()} >---Envia Invitaciones ---</a></u>
                    </div>
                </div>
                <div className={titulo}>
                    <div className="col py-2" style={{ "border": "1px solid #c9c9c9" }}>#</div>
                    <div className="col py-2" style={{ "border": "1px solid #c9c9c9" }}>Acci&oacute;n</div>
                    <div className="col-2 py-2" style={{ "border": "1px solid #c9c9c9" }}>Nombre</div>
                    <div className="col py-2" style={{ "border": "1px solid #c9c9c9" }}>Fono</div>
                    <div className="col-3 py-2" style={{ "border": "1px solid #c9c9c9" }}>Correo</div>
                    <div className="col py-2" style={{ "border": "1px solid #c9c9c9" }}>Ver.</div>
                    <div className="col py-2" style={{ "border": "1px solid #c9c9c9" }}>Status</div>
                    <div className="col py-2" style={{ "border": "1px solid #c9c9c9" }}>Ultimatum</div>
                </div>
                {
                    datos.map((obj, index) => {
                        return (
                            <div className={division} key={index}>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>#</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{index + 1}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Acci&oacute;n</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}><i className="far fa-trash-alt" onClick={() => this.borrar_usuario(obj)}></i></div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Nombre</div>
                                <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}><u><a className="text-dark" href="/InnovAccionMeter2020/#" onClick={() => this.modifcar_usuario(obj)}>{obj.Nombre}</a></u></div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Fono</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{obj.Fono}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Correo</div>
                                <div className={contenido_3} style={{ "border": "1px solid #c9c9c9" }}>{obj.Correo}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Ver.</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{"V." + obj.Version}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Status</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{(obj.status === "0") ? "Encuesta Sin Comenzar" : (obj.status === "1") ? "Encuesta Incompleta" : "Encuesta Finalizada"}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Ultimatum</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{this.ultimatum(obj)}</div>
                            </div>
                        )
                    })
                }
                <div className="row py-5 text-center">
                    <div className="col-md-12 py-3">
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
                        : (this.state.vista === 2) ? <Usuario tipo={this.state.tipo} datos={this.state.usuario} funcion={this.regresar} />
                            : (this.state.vista === 3) ? <EliminarUsuarios datos={this.state.usuario} funcion={this.regresar} />
                                : (this.state.vista === 4) ? <EnviarInvitaciones datos={this.state.usuario} funcion={this.regresar} />
                                    : (this.state.vista === 5) ? <EnviarUltimatum datos={this.state.usuario} funcion={this.regresar} />
                                        : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }
}
