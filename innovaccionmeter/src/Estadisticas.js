import React, { Component } from 'react'
import { AppContext } from './App'

import Graficos from './Graficos'

export default class Estadisticas extends Component {
    constructor(props) {
        super(props)
        Estadisticas.contextType = AppContext

        this.state = {
            vista: 0,
            grafico: 0,
            select: 0
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


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/obtener_empresas"
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    lista_empresas: data,
                    vista: 1
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

    mostrar_graficos = async () => {
        let grafico = 0
        let select = 0
        let text = ""


        await Array.from(document.getElementsByName("estadistica")).map((obj) => {
            if (obj.checked) {
                grafico = parseInt(obj.value)
                if (obj.value === "1") {
                    select = 0
                }
                if (obj.value === "2") {
                    select = parseInt(document.getElementById("empresa").value)
                    let sel = document.getElementById("empresa")
                    text = sel.options[sel.selectedIndex].text
                }
                if (obj.value === "3") {
                    select = parseInt(document.getElementById("industria").value)
                    let sel = document.getElementById("industria")
                    text = sel.options[sel.selectedIndex].text
                }
            }
            return true
        })        

        this.setState({
            grafico: 0
        })

        this.setState({
            grafico,
            select,
            TipoUsuario: this.props.tipo,
            nombre: text            
        })

    }

    funcion_inicial = async () => {
        const { state, auth_false, tipo_warning } = await this.context
        this.setState({
            state,
            auth_false,
            tipo_warning
        })


        await this.datos()
        await this.mostrar_graficos()

    }

    pagina_principal = () => {
        return (
            <div>
                <div className="row">
                    <div className="col-md-3 py-2 border">
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="estadistica" id="1" value="1" defaultChecked />
                            <label className="form-check-label" htmlFor="1">Resumen General</label>
                        </div>
                    </div>
                    <div className="col-md-3 border">
                        <div className="row py-2">
                            <div className="col-md-6">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="estadistica" id="2" value="2" />
                                    <label className="form-check-label" htmlFor="2">Empresa: </label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <select className="form-control" id="empresa">
                                        {
                                            this.state.lista_empresas.map((obj, index) => {
                                                return (
                                                    <option value={obj.IdEmpresa} key={index}>{obj.Sigla}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 border">
                        <div className="row py-2">
                            <div className="col-md-6">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="estadistica" id="3" value="3" />
                                    <label className="form-check-label" htmlFor="3">Industria:</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <select className="form-control" id="industria">
                                        <option value="1">Retail</option>
                                        <option value="2">Consumo masivo</option>
                                        <option value="3">Telecomunicaciones / Tecnologia</option>
                                        <option value="4">Manufactura industrial</option>
                                        <option value="5">Servicios financieros</option>
                                        <option value="6">Servicios educacionales</option>
                                        <option value="7">Servicios eléctricos, sanitario</option>
                                        <option value="8">Servicios públicos</option>
                                        <option value="9">Agricultura</option>
                                        <option value="10">Minería</option>
                                        <option value="11">Automotriz</option>
                                        <option value="12">Salud / Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 py-2 border">
                        <div className="form-check text-center">
                            <button type="button" className="btn btn-primary" onClick={() => { this.mostrar_graficos() }}>Ver Estadisticas</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    render() {
        return (
            <div>
                <div>
                    {
                        (this.state.vista === 1) ? <this.pagina_principal />
                            : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                    }
                </div>
                <div>
                    {
                        (this.state.grafico === 1 || this.state.grafico === 2 || this.state.grafico === 3) ? <Graficos grafico={this.state.grafico} select={this.state.select} TipoUsuario={this.state.TipoUsuario} nombre={this.state.nombre} />
                            : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                    }
                </div>
            </div>
        )
    }
}
