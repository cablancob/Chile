import React, { Component } from 'react'
import { AppContext } from './App'



export default class EncuestaReporteResumen extends Component {
    constructor(props) {
        super(props)

        EncuestaReporteResumen.contextType = AppContext

        this.state = {
            mostrar: false,
            reporte_final: [],
            promedio_general: 0.0,
            resultados: ["Ingresos", "Reducción de costos & gastos", "Rentabilidad", "Modelo de negocio", "Satisfacción del Cliente", "Sostenibilidad"],
            proposito: ["Propósito de Innovación", "Alineamiento a Resultados", "Desafíos Concretos", "Estrategias"],
            liderazgo: ["Aprendizaje Continuo", "Herramientas", "Asignación Recursos y Responsables", "Comunicación"],
            estructuras_habilitadoras: ["Co-Creación", "Talento", "Recursos", "Procesos"],
            sistemas_consistentes: ["Búsqueda de Oportunidades", "Desarrollo de Soluciones", "Desarrollo de Modelo de Negocio", "Gestión del Cambio"],
            cultura_conectada: ["Apertura hacia lo nuevo", "Orientación Comercial", "Flexibilidad ante Cambios", "Tolerancia a Fallar"]
        }
    }


    Style = (numero) => {
        if (numero < 6) {
            return "badge badge-pill badge-danger px-2 py-1"
        }
        if (numero >= 6 && numero < 8) {
            return "badge badge-pill badge-warning px-2 py-1"
        }
        if (numero >= 8) {
            return "badge badge-pill badge-success px-2 py-1"
        }

    }

    resultados_innovacion = async (IdEmpresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

            let peso_empresa = []
            let empresa = this.state.datos_empresa

            peso_empresa.push(empresa["R090"])
            peso_empresa.push(empresa["R180"])
            peso_empresa.push(empresa["R270"])
            peso_empresa.push(empresa["R360"])

            this.setState({
                peso_empresa
            })


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/resultados_innovacion?user=" + parseInt(0) + "&empresa=" + parseInt(IdEmpresa) + "&tipo=" + parseInt(tipo)
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = data
                return datos
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
                return {}
            } else {
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    proposito = async (IdEmpresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/proposito?user=" + parseInt(0) + "&empresa=" + parseInt(IdEmpresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = data
                return datos
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
                return {}
            } else {
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    liderazgo = async (IdEmpresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/liderazgo?user=" + parseInt(0) + "&empresa=" + parseInt(IdEmpresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = data
                return datos
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
                return {}
            } else {
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    estructuras_habilitadoras = async (IdEmpresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/estructuras_habilitadoras?user=" + parseInt(0) + "&empresa=" + parseInt(IdEmpresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = data
                return datos
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
                return {}
            } else {
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    sistemas_consistentes = async (IdEmpresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/sistemas_consistentes?user=" + parseInt(0) + "&empresa=" + parseInt(IdEmpresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = data
                return datos
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
                return {}
            } else {
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    cultura_conectada = async (IdEmpresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/cultura_conectada?user=" + parseInt(0) + "&empresa=" + parseInt(IdEmpresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let datos = data
                return datos
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
                return {}
            } else {
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }



    datos_empresa = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/datos_empresa?id=" + parseInt(id)
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos_empresa: data
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

    //1REP
    reporte_final = (datos, reporte) => {
        let suma = 0
        let promedio = 0
        let datos_reporte = {}
        let resultados = []

        if (reporte === 1) {
            datos_reporte["titulo"] = "ICC (Resultados Innovación)"
            for (let i in datos) {
                if (datos[i] > 0) {
                    let pregunta = ""
                    let resultado = 0.0
                    pregunta = this.state.resultados[i]
                    resultado = datos[i]
                    resultados.push(JSON.stringify({ pregunta, resultado }))
                    suma += datos[i]
                    promedio += 1
                }
            }
            datos_reporte["resultados"] = resultados
            datos_reporte["promedio"] = (suma / promedio).toFixed(1)
            this.setState({
                promedio_general: this.state.promedio_general + (suma / promedio)
            })
            datos_reporte["peso"] = this.state.peso_empresa[reporte - 1] + "%"
        }

        if (reporte === 2) {
            datos_reporte["titulo"] = "Propósito, Objetivo, Estrategia"
            for (let i in datos) {
                if (datos[i] > 0) {
                    let pregunta = ""
                    let resultado = 0.0
                    pregunta = this.state.proposito[i - 1]
                    resultado = datos[i]
                    resultados.push(JSON.stringify({ pregunta, resultado }))
                    suma += datos[i]
                    promedio += 1
                }
            }
            datos_reporte["resultados"] = resultados
            datos_reporte["promedio"] = (suma / promedio).toFixed(1)
            this.setState({
                promedio_general: this.state.promedio_general + (suma / promedio)
            })
            datos_reporte["peso"] = this.state.peso_empresa[reporte - 1] + "%"
        }

        if (reporte === 3) {
            datos_reporte["titulo"] = "Liderazgo Inspirador"
            for (let i in datos) {
                if (datos[i] > 0) {
                    let pregunta = ""
                    let resultado = 0.0
                    pregunta = this.state.liderazgo[i - 1]
                    resultado = datos[i]
                    resultados.push(JSON.stringify({ pregunta, resultado }))
                    suma += datos[i]
                    promedio += 1
                }
            }
            datos_reporte["resultados"] = resultados
            datos_reporte["promedio"] = (suma / promedio).toFixed(1)
            this.setState({
                promedio_general: this.state.promedio_general + (suma / promedio)
            })
            datos_reporte["peso"] = this.state.peso_empresa[reporte - 1] + "%"
        }

        if (reporte === 4) {
            datos_reporte["titulo"] = "Estructuras Habilitadoras"
            for (let i in datos) {
                if (datos[i] > 0) {
                    let pregunta = ""
                    let resultado = 0.0
                    pregunta = this.state.estructuras_habilitadoras[i - 1]
                    resultado = datos[i]
                    resultados.push(JSON.stringify({ pregunta, resultado }))
                    suma += datos[i]
                    promedio += 1
                }
            }
            datos_reporte["resultados"] = resultados
            datos_reporte["promedio"] = (suma / promedio).toFixed(1)
            this.setState({
                promedio_general: this.state.promedio_general + (suma / promedio)
            })
            datos_reporte["peso"] = this.state.peso_empresa[reporte - 1] + "%"
        }

        if (reporte === 5) {
            datos_reporte["titulo"] = "Sistemas Consistentes & Confiables"
            for (let i in datos) {
                if (datos[i] > 0) {
                    let pregunta = ""
                    let resultado = 0.0
                    pregunta = this.state.sistemas_consistentes[i - 1]
                    resultado = datos[i]
                    resultados.push(JSON.stringify({ pregunta, resultado }))
                    suma += datos[i]
                    promedio += 1
                }
            }
            datos_reporte["resultados"] = resultados
            datos_reporte["promedio"] = (suma / promedio).toFixed(1)
            this.setState({
                promedio_general: this.state.promedio_general + (suma / promedio)
            })
            datos_reporte["peso"] = this.state.peso_empresa[reporte - 1] + "%"
        }

        if (reporte === 6) {
            datos_reporte["titulo"] = "Cultura Conectada"
            for (let i in datos) {
                if (datos[i] > 0) {
                    let pregunta = ""
                    let resultado = 0.0
                    pregunta = this.state.cultura_conectada[i - 1]
                    resultado = datos[i]
                    resultados.push(JSON.stringify({ pregunta, resultado }))
                    suma += datos[i]
                    promedio += 1
                }
            }
            datos_reporte["resultados"] = resultados
            datos_reporte["promedio"] = (suma / promedio).toFixed(1)
            this.setState({
                promedio_general: this.state.promedio_general + (suma / promedio)
            })
            datos_reporte["peso"] = this.state.peso_empresa[reporte - 1] + "%"
        }

        let reporte_final = this.state.reporte_final
        reporte_final.push(datos_reporte)

        this.setState({
            reporte_final
        })

    }

    datos_campos = async (datos) => {
        let max = 0
        for (let i in datos[0]) {
            max = parseInt(i) + 1
        }
        let arreglo = new Array(max).fill(0.0)
        datos.map((obj, index) => {
            let peso_resumen = this.state.peso_empresa[index]
            for (let i in obj) {
                arreglo[i] = (obj[i] * peso_resumen) / 100 + arreglo[i]
            }
            return true
        })
        return arreglo
    }



    componentDidMount = async () => {
        try {

            const empresa = this.props.IdEmpresa

            const { state, auth_false } = await this.context
            this.setState({
                state,
                auth_false
            })


            await this.datos_empresa(empresa)

            let datos = []

            let result = await Promise.all([this.resultados_innovacion(empresa, 2), this.resultados_innovacion(empresa, 3), this.resultados_innovacion(empresa, 4), this.resultados_innovacion(empresa, 5)])
            datos = await this.datos_campos(result)            
            this.reporte_final(datos, 1)

            result = await Promise.all([this.proposito(empresa, 2), this.proposito(empresa, 3), this.proposito(empresa, 4), this.proposito(empresa, 5)])
            datos = await this.datos_campos(result)
            this.reporte_final(datos, 2)

            result = await Promise.all([this.liderazgo(empresa, 2), this.liderazgo(empresa, 3), this.liderazgo(empresa, 4), this.liderazgo(empresa, 5)])
            datos = await this.datos_campos(result)
            this.reporte_final(datos, 3)

            result = await Promise.all([this.estructuras_habilitadoras(empresa, 2), this.estructuras_habilitadoras(empresa, 3), this.estructuras_habilitadoras(empresa, 4), this.estructuras_habilitadoras(empresa, 5)])
            datos = await this.datos_campos(result)
            this.reporte_final(datos, 4)

            result = await Promise.all([this.sistemas_consistentes(empresa, 2), this.sistemas_consistentes(empresa, 3), this.sistemas_consistentes(empresa, 4), this.sistemas_consistentes(empresa, 5)])
            datos = await this.datos_campos(result)
            this.reporte_final(datos, 5)

            result = await Promise.all([this.cultura_conectada(empresa, 2), this.cultura_conectada(empresa, 3), this.cultura_conectada(empresa, 4), this.cultura_conectada(empresa, 5)])
            datos = await this.datos_campos(result)
            this.reporte_final(datos, 6)

            this.setState({
                mostrar: true
            })

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }


    Reporte = () => {
        const empresa = this.props.IdEmpresa
        const usuario = ""
        let size = {"height": "80px"}

        if (window.screen.width < 720) {
            size = {"height": "145px"}
        }

        let titulo = "Resultado Resumen Encuesta"

        return (
            <div className="container-fluid">
                <h1 className="h3 mb-4 text-gray-800 text-center">{titulo}</h1>
                <div className="d-flex justify-content-center py-4">
                    <button type="button" className="btn btn-primary px-5 my-2" onClick={this.props.funcion}>{"<< Anterior"}</button>
                </div>
                <div className="card" id="tabla-final">
                    <div className="h5 card-header bg-white text-dark text-center">
                        <div className="row">
                            <div className="col-md-4 py-2">
                                {(empresa === 0) ? usuario.NombreEmpresa : this.state.datos_empresa.NombreEmpresa}
                            </div>
                            <div className="col-md-4 py-2">
                                {(empresa === 0) ? usuario.nombre : ""}
                            </div>
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-6 font-weight-bold py-2">SCORE TOTAL</div>
                                    <div className="col-md-6 py-2">
                                        <span className={this.Style((this.state.promedio_general / 6).toFixed(1))}>{(this.state.promedio_general / 6).toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body" style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                        <div className="row">
                            {
                                this.state.reporte_final.map((obj, index) => {
                                    let index_superior = index
                                    return (
                                        <div className="col-md-4" key={index} style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                            <div className="card h-100">
                                                <div className="card-header bg-white text-dark text-center" style={size}>
                                                    <div className="row">
                                                        <div className="h6 col-md-9 py-3">{obj.titulo}</div>
                                                        <div className="col-md-3 py-2"> <span className={this.Style(obj.promedio)}>{obj.promedio}</span></div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    {
                                                        obj.resultados.map((obj, index) => {
                                                            let resultados = JSON.parse(obj)
                                                            if (this.state.tooltips === undefined) {
                                                                return (
                                                                    <div className="row" key={index}>
                                                                        <div className="col-md-9 py-2 text-left">{resultados.pregunta}</div>
                                                                        <div className="col-md-3 py-2 text-center"><span className={this.Style(resultados.resultado)}>{resultados.resultado.toFixed(1)}</span></div>
                                                                    </div>
                                                                )
                                                            } else {
                                                                let texto = ""
                                                                this.state.tooltips.map((obj) => {
                                                                    if (obj.pagina === index_superior.toString() && obj.pregunta === index.toString()) {
                                                                        texto += obj.texto + " Puntaje: ( " + (obj.valor / obj.total).toFixed(1) + " ) \n\n"

                                                                    }
                                                                    return true
                                                                })
                                                                return (
                                                                    <div className="row" key={index}>
                                                                        <div className="col-md-9 py-2 text-left" data-toggle="tooltip" title={texto}>{resultados.pregunta}</div>
                                                                        <div className="col-md-3 py-2 text-center"><span className={this.Style(resultados.resultado)}>{resultados.resultado.toFixed(1)}</span></div>
                                                                    </div>
                                                                )
                                                            }
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-center py-4">
                    <button type="button" className="btn btn-primary px-5 my-2" onClick={this.props.funcion}>{"<< Anterior"}</button>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="">
                {(this.state.mostrar) ? <this.Reporte />
                    : <div className="d-flex justify-content-center py-5"><div className="spinner-border text-success" role="status"><span className="sr-only">Espere...</span></div></div>
                }
            </div>
        )
    }
}
