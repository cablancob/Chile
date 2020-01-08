import React, { Component } from 'react'

import { AppContext } from './App'
import ListaReporteEmpleados from './ListaReporteEmpleados'
import EncuestaReporte from './EncuestaReporte'

export default class EncuestasTotalEmpresa extends Component {

    constructor(props) {
        super(props)

        EncuestasTotalEmpresa.contextType = AppContext

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


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/total_encuestas_empresas?tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos: data,
                    vista: 1,
                })
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
            } else {
                this.state.auth_false()
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    funcion_inicial = async () => {
        const { state, auth_false } = await this.context
        this.setState({
            state,
            auth_false
        })
        const tipo = this.props.tipo
        await this.datos(tipo)

    }

    reporte_empresa = (tipo, empresa) => {
        this.setState({
            tipo,
            empresa,
            vista: 3
        })
    }

    reporte_empleado = (tipo, empresa) => {
        this.setState({
            tipo,
            empresa,
            vista: 2
        })
    }

    link_reporte_empresa = (obj) => {
        if (obj.obj.total_contestado > 0) {
            return (
                <u>
                    <a className="text-dark" onClick={() => { this.reporte_empresa(obj.tipo, obj.obj.IdEmpresa) }} href="/InnovAccionMeter2020/#">{obj.obj.NombreEmpresa}</a>
                </u>
            )
        } else {
            return (
                <u>
                    <a className="text-dark" onClick={() => window.ModalError("Reporte", "No hay datos")} href="/InnovAccionMeter2020/#">{obj.obj.NombreEmpresa}</a>
                </u>
            )
        }
    }

    link_reporte_empleado = (obj) => {

        if (obj.obj.total_contestado > 0) {
            return (
                <u>
                    <a className="text-dark" onClick={() => { this.reporte_empleado(obj.tipo, obj.obj.IdEmpresa) }} href="/InnovAccionMeter2020/#">{obj.obj.total_contestado + " / " + obj.obj.total}</a>
                </u>
            )
        } else {
            return (
                <u>
                    <a className="text-dark" onClick={() => window.ModalError("Reporte", "No hay datos")} href="/InnovAccionMeter2020/#">{obj.obj.total_contestado + " / " + obj.obj.total}</a>
                </u>
            )
        }
    }

    pagina_principal = () => {
        const datos = this.state.datos
        const tipo = this.props.tipo
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
                <div className={titulo}>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Empresa</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Sigla</div>
                    <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Completas/Total</div>
                </div>
                {
                    datos.map((obj, index) => {
                        return (
                            <div className={division} key={index}>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Empresa</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}><this.link_reporte_empresa tipo={tipo} obj={obj} /></div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sigla</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>{obj.Sigla}</div>
                                <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Completas/Total</div>
                                <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}><this.link_reporte_empleado tipo={tipo} obj={obj} /></div>
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
                        : (this.state.vista === 2) ?
                            <ListaReporteEmpleados usuario={this.state.state.usuario} tipo={this.state.tipo} empresa={this.state.empresa} funcion={this.regresar} />
                            : (this.state.vista === 3)
                                ? <EncuestaReporte tipo_encuesta={this.state.tipo} id_usuario={0} id_empresa={this.state.empresa} funcion={this.regresar} />
                                : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }
}
