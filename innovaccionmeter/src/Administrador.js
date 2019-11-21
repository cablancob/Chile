import React, { Component } from 'react'
import { AppContext } from './App'

import Menu from './Menu'
import ListaReporteEmpleados from './ListaReporteEmpleados'
import EncuestaReporte from './EncuestaReporte'

export default class Administrador extends Component {

    constructor(props) {
        super(props)

        Administrador.contextType = AppContext

        this.state = {
            vista: 0,
            tipo: 0,
            empresa: 0
        }
    }

    regresar = (empresa) => {
        this.setState({
            vista: 1
        })
        this.funcion_inicial()
    }

    lista_empleados = (tipo, empresa) => {
        this.setState({
            tipo,
            empresa,
            vista: 2
        })
    }

    reporte_empresa = (tipo, empresa) => {
        this.setState({
            tipo,
            empresa,
            vista: 3
        })
    }

    lista_datos = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/lista_reporte_administrador?id_empresa=" + parseInt(id)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    lista_datos: data,
                    vista: 1
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

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    funcion_inicial = async () => {
        const { state, auth_false } = await this.context
        this.setState({
            state,
            auth_false
        })

        const usuario = this.state.state.usuario

        this.setState({
            empresa: usuario.IdEmpresa
        })

        await this.lista_datos(usuario.IdEmpresa)

    }

    link_reporte_empresa = (obj) => {        
        if (obj.obj.total_contestado > 0) {
            return (
                <u>
                    <a className="text-dark" onClick={() => this.reporte_empresa(obj.obj.Tipo, obj.obj.IdEmpresa)} href="/#">{obj.obj.titulo}</a>
                </u>
            )
        } else {            
            return (
                <u>
                    <a className="text-dark" onClick={() => window.ModalError("Reporte","No hay datos")} href="/#">{obj.obj.titulo}</a>
                </u>
            )
        }
    }


    pagina_principal = () => {
        const datos = this.state.lista_datos

        if (window.screen.width < 720) {
            return (
                <div>
                    <h1 className="h3 mb-4 text-gray-800 text-center">{datos[0].NombreEmpresa}</h1>
                    {datos.map((obj, index) => {
                        return (
                            <div className="row text-center p-4" key={index}>
                                <div className="col-6 bg-primary text-white" style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta</div>
                                <div className="col-6" style={{ "border": "1px solid #c9c9c9" }}>
                                    <this.link_reporte_empresa obj={obj} />
                                </div>
                                <div className="col-6 bg-primary text-white" style={{ "border": "1px solid #c9c9c9" }}>Total Usuarios</div>
                                <div className="col-6" style={{ "border": "1px solid #c9c9c9" }}>{obj.total}</div>
                                <div className="col-6 bg-primary text-white" style={{ "border": "1px solid #c9c9c9" }}>Encuestas Terminadas</div>
                                <div className="col-6" style={{ "border": "1px solid #c9c9c9" }}>{obj.total_contestado}</div>
                                <div className="col-6 bg-primary text-white" style={{ "border": "1px solid #c9c9c9" }}>Accion</div>
                                <div className="col-6" style={{ "border": "1px solid #c9c9c9" }}>
                                    <u>
                                        <a className="text-dark" href="/#" onClick={() => this.lista_empleados(obj.Tipo, this.state.empresa)}>Ver encuestas</a>
                                    </u>
                                </div>
                            </div>
                        )
                    })
                    }
                </div>
            )
        } else {
            return (
                <div>
                    <h1 className="h3 mb-4 text-gray-800 text-center">{datos[0].NombreEmpresa}</h1>
                    <div className="table-responsive p-4">
                        <table className="table table-bordered">
                            <thead className="text-center">
                                <tr className="bg-primary text-white h5">
                                    <th>Tipo Encuesta</th>
                                    <th>Total Usuarios</th>
                                    <th>Encuestas Terminadas</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    datos.map((obj, index) => {
                                        return (
                                            <tr key={index} className="h5">
                                                <td>
                                                    <this.link_reporte_empresa obj={obj} />
                                                </td>
                                                <td>{obj.total}</td>
                                                <td>{obj.total_contestado}</td>
                                                <td className="text-center">
                                                    <u>
                                                        <a className="text-dark" href="/#" onClick={() => this.lista_empleados(obj.Tipo, this.state.empresa)}>Ver encuestas</a>
                                                    </u>
                                                </td>
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
    }


    render() {
        return (
            <div className="">
                <div id="wrapper" className="">
                    <div id="content-wrapper" className="d-flex flex-column">
                        <div id="content">
                            <Menu />
                            {(this.state.vista === 1)
                                ? <this.pagina_principal />
                                : (this.state.vista === 2)
                                    ? <ListaReporteEmpleados usuario={this.state.state.usuario} tipo={this.state.tipo} empresa={this.state.empresa} funcion={this.regresar} />
                                    : (this.state.vista === 3)
                                        ? <EncuestaReporte tipo_encuesta={this.state.tipo} id_usuario={0} id_empresa={this.state.empresa} funcion={this.regresar} />
                                        : ""
                            }
                        </div>
                        <footer className="sticky-footer bg-white">
                            <div className="container my-auto">
                                <div className="copyright text-center my-auto">
                                    <span>Copyright &copy; Best Place to Innovate</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        )
    }
}
