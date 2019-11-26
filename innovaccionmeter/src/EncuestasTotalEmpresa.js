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
                    <a className="text-dark" onClick={() => { this.reporte_empresa(obj.tipo, obj.obj.IdEmpresa) }} href="/#">{obj.obj.NombreEmpresa}</a>
                </u>
            )
        } else {
            return (
                <u>
                    <a className="text-dark" onClick={() => window.ModalError("Reporte", "No hay datos")} href="/#">{obj.obj.NombreEmpresa}</a>
                </u>
            )
        }
    }

    link_reporte_empleado = (obj) => {

        if (obj.obj.total_contestado > 0) {
            return (
                <u>
                    <a className="text-dark" onClick={() => { this.reporte_empleado(obj.tipo, obj.obj.IdEmpresa) }} href="/#">{obj.obj.total_contestado + " / " + obj.obj.total}</a>
                </u>
            )
        } else {
            return (
                <u>
                    <a className="text-dark" onClick={() => window.ModalError("Reporte", "No hay datos")} href="/#">{obj.obj.total_contestado + " / " + obj.obj.total}</a>
                </u>
            )
        }
    }

    pagina_principal = () => {
        const datos = this.state.datos
        const tipo = this.props.tipo
        return (
            <div>
                <div className="table-responsive p-4">
                    <table className="table table-bordered">
                        <thead className="text-center">
                            <tr className="bg-primary text-white h5">
                                <th className="d-none d-md-table-cell">Empresa</th>
                                <th>Sigla</th>
                                <th>Completas/Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((obj, index) => {
                                return (
                                    <tr key={index} className="h5">
                                        <td className="d-none d-md-table-cell"><this.link_reporte_empresa tipo={tipo} obj={obj} /></td>
                                        <td>{obj.Sigla}</td>
                                        <td><this.link_reporte_empleado tipo={tipo} obj={obj} /></td>
                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </table>
                </div>
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
                                : ""
                }
            </div>
        )
    }
}
