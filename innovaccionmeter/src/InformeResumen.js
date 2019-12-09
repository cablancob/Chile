import React, { Component } from 'react'
import { AppContext } from './App'

function color(valor) {

    if (valor < 51) {
        return "text-center text-white bg-danger"
    }  
    
    if (valor >= 51 && valor < 70) {
        return "text-center text-white bg-warning"
    }   

    if (valor >= 10) {
        return "text-center text-white bg-success"
    }   
    
} 

export default class InformeResumen extends Component {
    constructor(props) {
        super(props)
        InformeResumen.contextType = AppContext

        this.state = {
            vista: 0,
            titulo_principal: "Informe Resumen"
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    datos = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/informe_resumen"
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
                window.ModalError(this.state.titulo_principal, data.error)
                this.setState({
                    datos: [],
                    vista: 1
                })
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

        await this.datos()

    }

    pagina_principal = () => {

        return (
            <div>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                <div className="table-responsive" style={{"height": "500px"}}>
                    <table className="table table-bordered">
                        <caption style={{ "captionSide": "top" }}>Deslice a la Derecha</caption>
                        <thead>
                            <tr className="text-center text-dark">
                                <th scope="col">Empresa</th>
                                <th scope="col">Contacto</th>
                                <th scope="col">Seguimiento</th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">90°</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">180°</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">Sub Tot Int</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">270°</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">360°</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">Sub Tot Int</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                                <th scope="col">
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-12">Total</div>
                                    </div>
                                    <div className="row" style={{ "width": "200px" }}>
                                        <div className="col-4">OK</div>
                                        <div className="col-4">BD</div>
                                        <div className="col-4">%</div>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.datos.map((obj, index) => {
                                    let t90 = (obj.total90 === 0) ? 0 : (obj.cuenta90 / obj.total90 * 100).toFixed(0)
                                    let t180 = (obj.total180 === 0) ? 0 : (obj.cuenta180 / obj.total180 * 100).toFixed(0)
                                    let st1a = obj.cuenta90 + obj.cuenta180
                                    let st1b = obj.total90 + obj.total180
                                    let st1c = (st1b === 0) ? 0 : (st1a / st1b * 100).toFixed(0)

                                    let t270 = (obj.total270=== 0) ? 0 : (obj.cuenta270 / obj.total270 * 100).toFixed(0)
                                    let t360 = (obj.total360 === 0) ? 0 : (obj.cuenta360 / obj.total360 * 100).toFixed(0)
                                    let st2a = obj.cuenta270 + obj.cuenta360
                                    let st2b = obj.total270 + obj.total360
                                    let st2c = (st2b === 0) ? 0 : (st2a / st2b * 100).toFixed(0)

                                    let total1 = st1a + st2a
                                    let total2 = st1b +st2b
                                    let total3 = (total2 === 0) ? 0 : (total1 / total2 * 100).toFixed(0)

                                    return (
                                        <tr key={index}>
                                            <td>{obj.NombreEmpresa}</td>
                                            <td>{obj.Contacto}</td>
                                            <td>{obj.Fecha.split("T")[0].split("-")[2] + "/" + obj.Fecha.split("T")[0].split("-")[1] + "/" + obj.Fecha.split("T")[0].split("-")[0]}</td>
                                            <td className={color(t90)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{obj.cuenta90}</div>
                                                    <div className="col-4">{obj.total90}</div>
                                                    <div className="col-4">{t90 + "%"}</div>
                                                </div>
                                            </td>
                                            <td className={color(t180)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{obj.cuenta180}</div>
                                                    <div className="col-4">{obj.total180}</div>
                                                    <div className="col-4">{t180 + "%"}</div>
                                                </div>
                                            </td>
                                            <td className={color(st1c)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{st1a}</div>
                                                    <div className="col-4">{st1b}</div>
                                                    <div className="col-4">{st1c + "%"}</div>
                                                </div>
                                            </td>
                                            <td className={color(t270)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{obj.cuenta270}</div>
                                                    <div className="col-4">{obj.total270}</div>
                                                    <div className="col-4">{t270 + "%"}</div>
                                                </div>
                                            </td>
                                            <td className={color(t360)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{obj.cuenta360}</div>
                                                    <div className="col-4">{obj.total360}</div>
                                                    <div className="col-4">{t360 + "%"}</div>
                                                </div>
                                            </td>
                                            <td className={color(st2c)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{st2a}</div>
                                                    <div className="col-4">{st2b}</div>
                                                    <div className="col-4">{st2c + "%"}</div>
                                                </div>
                                            </td>
                                            <td className={color(total3)}>
                                                <div className="row" style={{ "width": "200px" }}>
                                                    <div className="col-4">{total1}</div>
                                                    <div className="col-4">{total2}</div>
                                                    <div className="col-4">{total3 + "%"}</div>
                                                </div>
                                            </td>
                                            
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>

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
                        : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }
}
