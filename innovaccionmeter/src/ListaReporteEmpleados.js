import React, { Component } from 'react'
import { AppContext } from './App'

import EncuestaReporte from './EncuestaReporte'

export default class ListaReporteEmpleados extends Component {
    constructor(props) {
        super(props)

        ListaReporteEmpleados.contextType = AppContext

        this.state = {
            vista: 0,
            empresa: ""
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

    datos = async (tipo, empresa) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/lista_reporte_empleado?empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos: data,
                    vista: 1,
                    empresa: data[0].NombreEmpresa
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
        const empresa = this.props.empresa

        await this.datos(tipo, empresa)

    }

    pagina_principal = () => {
        const datos = this.state.datos
        const empresa = this.props.empresa
        return (
            <div className="table-responsive p-4">
                <div className="row my-5">
                    <div className="col-12 text-center">
                        <button type="button" className="btn btn-primary px-5 my-2" style={{ display: this.state.vista === 2 ? "none" : "inline" }} onClick={() => { this.props.funcion(empresa) }}>{"<< Anterior"}</button>
                    </div>
                </div>
                <table className="table table-bordered">
                    <thead className="text-center">
                        <tr className="bg-primary text-white">
                            <th className="h5">Usuarios Encuesta Terminada - {this.state.empresa}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            datos.map((obj, index) => {
                                return (
                                    <tr key={index}>
                                        <td className="text-center">
                                            <u>
                                                <a className="text-dark h5" href={process.env.REACT_APP_LINK} onClick={() => this.reporte_individual(obj)}>{obj.Nombre}</a>
                                            </u>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }

    reporte_individual = (obj) => {
        this.setState({
            TipoUsuario: obj.TipoUsuario,
            Id: obj.Id,
            vista: 2
        })
    }


    render() {
        const usuario = this.props.usuario
        const tipo = this.props.tipo
        const empresa = this.props.empresa

        let titulo = ""

        if (tipo === 2) {
            titulo = "Usuarios - Encuesta 90°"
        }
        if (tipo === 3) {
            titulo = "Usuarios - Encuesta 180°"
        }
        if (tipo === 4) {
            titulo = "Usuarios - Encuesta 270°"
        }
        if (tipo === 5) {
            titulo = "Usuarios - Encuesta 360°"
        }

        return (
            <div>
                <h1 className="h3 mb-4 text-gray-800 text-center" style={{ display: usuario.TipoUsuario === 99 ? "none" : "block" }}>{titulo}</h1>
                {(this.state.vista === 1)
                    ? <this.pagina_principal />
                    : (this.state.vista === 2)
                        ? <EncuestaReporte tipo_encuesta={this.state.TipoUsuario} id_usuario={this.state.Id} id_empresa={0} funcion={this.regresar} />
                        : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
                <div className="row my-5">
                    <div className="col-12 text-center">
                        <button type="button" className="btn btn-primary px-5 my-2" style={{ display: this.state.vista === 2 ? "none" : "inline" }} onClick={() => { this.props.funcion(empresa) }}>{"<< Anterior"}</button>
                    </div>
                </div>
            </div>
        )
    }
}
