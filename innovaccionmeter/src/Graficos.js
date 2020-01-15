import React, { Component } from 'react'
import { AppContext } from './App'
import Chart from 'react-apexcharts'

export default class Graficos extends Component {
    constructor(props) {
        super(props)
        Graficos.contextType = AppContext              

        this.state = {
            vista: 0,
            titulo_principal: ""
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


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/graficos?tipografico=" + this.props.grafico + "&select=" + this.props.select + "&TipoUsuario=" + this.props.TipoUsuario
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos_graficos: data,
                    vista: 1
                })
            } else if (response.status === 400) {
                window.ModalError(this.state.titulo_principal, data.error)
                this.setState({
                    datos_graficos: [],
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

        if (this.props.grafico === 1) {
            this.setState({
                titulo_principal: "Resumen General"
            })
        }

        if (this.props.grafico === 2) {
            this.setState({
                titulo_principal: "Empresa: " + this.props.nombre
            })
        }

        if (this.props.grafico === 3) {
            this.setState({
                titulo_principal: "Industria: " + this.props.nombre
            })
        }        

        await this.datos()            

    }

    pagina_principal = () => {        
        return (
            <div>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                {
                    this.state.datos_graficos.map((obj, index) => {                        
                        return (
                            <div className="d-flex justify-content-center container_grafico py-5" key={index}>
                                <Chart options={obj.options} series={obj.options.series} type={obj.type} width={700} height={300} />
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
                        : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }

}