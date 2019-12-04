import React, { Component } from 'react'
import { AppContext } from './App'


import Empresa from './Empresa'
import MantencionUsuario from './MantencionUsuario'

export default class MantencionEmpresas extends Component {

    constructor(props) {
        super(props)
        MantencionEmpresas.contextType = AppContext
        this.state = {
            vista: 0
        }
    }

    regresar = async () => {
        this.setState({
            vista: 0
        })
        await this.funcion_inicial()
    }

    componentDidMount = async () => {
        await this.funcion_inicial()

    }

    datos = async (tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/mantencion_empresas"

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos: data,
                    vista: 3,
                    IdEmpresa: 214,
                    NombreEmpresa: "AES Gener Chile",
                    tipo_encuesta: 2
                })
            } else if (response.status === 400) {
                window.ModalError("Mantenci&oacute;n Empresas", data.error)
            } else {
                this.state.auth_false()
            }

        } catch (e) {
            window.ModalError("Mantenci&oacute;n Empresas", e.error)
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

    modificar_empresa = async (obj) => {
        this.setState({
            IdEmpresa: obj.IdEmpresa,
            tipo: "m",
            vista: 2
        })
    }

    crear_empresa = async () => {
        this.setState({
            IdEmpresa: 0,
            tipo: "n",
            vista: 2
        })
    }

    borrar_empresa = async (obj) => {
        this.setState({
            IdEmpresa: obj.IdEmpresa,
            tipo: "e",
            vista: 2
        })
    }

    consulta_usuarios = async (tipo_encuesta, obj) => {
        this.setState({
            tipo_encuesta,
            IdEmpresa: obj.IdEmpresa,
            NombreEmpresa: obj.NombreEmpresa,
            vista: 3
        })
    }

    pagina_principal = () => {
        const datos = this.state.datos
        let titulo = ""
        let subtitulo = ""
        let contenido = ""
        let division = ""

        if (window.screen.width < 720) {
            titulo = "row bg-primary text-white text-center d-none"
            subtitulo = "col-md-6 bg-primary text-white"
            contenido = "col-md-6"
            division = "row text-center py-4"

        } else {
            titulo = "row bg-primary text-white text-center"
            subtitulo = "bg-primary text-white d-none"
            contenido = "col-md py-2"
            division = "row text-center"
        }
        return (
            <div className="px-2">
                <div className="row">
                    <div className="col-md-6 py-3 text-center">
                        <u><a className="text-dark" href="/#" onClick={() => { }}>--- Informe Resumen ---</a></u>
                    </div>
                    <div className="col-md-6 py-3 text-center">
                        <u><a className="text-dark" href="/#" onClick={() => this.crear_empresa()}> --- Crea Empresa Nueva ---</a></u>
                    </div>
                </div>
                <div className={titulo}>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>#</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Acci&oacute;n</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Empresa</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Sigla</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>90°</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>180°</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>270°</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>360°</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Ressumen</div>
                </div>
                {
                    datos.map((obj, index) => {
                        return (
                            <div className={division} key={index}>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>#</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{index + 1}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Acci&oacute;n</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}><i className="far fa-trash-alt" onClick={() => this.borrar_empresa(obj)}></i></div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Empresa</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}><u><a className="text-dark" href="/#" onClick={() => this.modificar_empresa(obj)}>{obj.NombreEmpresa.replace("/", " / ")}</a></u></div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sigla</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{obj.Sigla.replace("/", " / ")}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>90°</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{(obj.cuenta90 === "X") ? "-X-" : <u><a className="text-dark" href="/#" onClick={() => this.consulta_usuarios(2, obj)}>{obj.cuenta90}</a></u>}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>180°</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{(obj.cuenta180 === "X") ? "-X-" : <u><a className="text-dark" href="/#" onClick={() => this.consulta_usuarios(3, obj)}>{obj.cuenta180}</a></u>}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>270°</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{(obj.cuenta270 === "X") ? "-X-" : <u><a className="text-dark" href="/#" onClick={() => this.consulta_usuarios(4, obj)}>{obj.cuenta270}</a></u>}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>360°</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{(obj.cuenta360 === "X") ? "-X-" : <u><a className="text-dark" href="/#" onClick={() => this.consulta_usuarios(5, obj)}>{obj.cuenta360}</a></u>}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Ressumen</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}><u><a className="text-dark" href="/#">Resumen Encuesta</a></u></div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        return (
            <div>
                {
                    (this.state.vista === 1) ? <this.pagina_principal />
                        : (this.state.vista === 2) ? <Empresa IdEmpresa={this.state.IdEmpresa} tipo={this.state.tipo} funcion={this.regresar} />
                            : (this.state.vista === 3) ? <MantencionUsuario IdEmpresa={this.state.IdEmpresa} tipo_encuesta={this.state.tipo_encuesta} NombreEmpresa={this.state.NombreEmpresa} funcion={this.regresar} />
                                : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }
}
