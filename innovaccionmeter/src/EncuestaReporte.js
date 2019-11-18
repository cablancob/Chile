import React, { Component } from 'react'


export default class EncuestaReporte extends Component {
    constructor(props) {
        super(props)

        this.state = {
            mostrar: false,
            reporte_final: [],
            promedio_general: 0.0,
            resultados: ["Ingresos", "Reducción de costos & gastos", "Rentabilidad", "Modelo de negocio", "Satisfacción del Cliente", "Sostenibilidad"],
            proposito: ["Propósito de Innovación", "Alineamiento a Resultados", "Desafíos Concretos", "Estrategias"],
            liderazgo: ["Aprendizaje Continuo", "Herramientas", "Asignación Recursos y Responsables", "Comunicación"],
            estructuras_habilitadoras: ["Talento", "Recursos", "Procesos", "Co-Creación"],
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

    resultados_innovacion = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))
            if (tipo === 2) {
                let peso_empresa = []
                let usuario = this.state.usuario_data
                for (let i in usuario) {
                    if (i.includes("P09")) {
                        peso_empresa.push(usuario[i])
                    }
                }
                this.setState({
                    peso_empresa
                })
            }


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/resultados_innovacion?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

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
                this.props.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    proposito = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/proposito?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

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
                this.props.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    liderazgo = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/liderazgo?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

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
                this.props.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    estructuras_habilitadoras = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/estructuras_habilitadoras?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

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
                this.props.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    sistemas_consistentes = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/sistemas_consistentes?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

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
                this.props.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    cultura_conectada = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/cultura_conectada?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

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
                this.props.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    datos_usuario = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/datos_usuario?user=" + parseInt(id)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    usuario_data: data,
                    version: data.Version
                })
            } else if (response.status === 400) {
                window.ModalError("Reporte", data.error)
            } else {
                this.props.auth_false()
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
                //borrar if                
                if (parseInt(i) !== 5) {
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
                let pregunta = ""
                let resultado = 0.0
                pregunta = this.state.proposito[i - 1]
                resultado = datos[i]
                resultados.push(JSON.stringify({ pregunta, resultado }))
                suma += datos[i]
                promedio += 1
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
                let pregunta = ""
                let resultado = 0.0
                pregunta = this.state.liderazgo[i - 1]
                resultado = datos[i]
                resultados.push(JSON.stringify({ pregunta, resultado }))
                suma += datos[i]
                promedio += 1
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
                let pregunta = ""
                let resultado = 0.0
                pregunta = this.state.estructuras_habilitadoras[i - 1]
                resultado = datos[i]
                resultados.push(JSON.stringify({ pregunta, resultado }))
                suma += datos[i]
                promedio += 1
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
                let pregunta = ""
                let resultado = 0.0
                pregunta = this.state.sistemas_consistentes[i - 1]
                resultado = datos[i]
                resultados.push(JSON.stringify({ pregunta, resultado }))
                suma += datos[i]
                promedio += 1
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
                let pregunta = ""
                let resultado = 0.0
                pregunta = this.state.cultura_conectada[i - 1]
                resultado = datos[i]
                resultados.push(JSON.stringify({ pregunta, resultado }))
                suma += datos[i]
                promedio += 1
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



    componentDidMount = async () => {
        try {
            const usuario = this.props.id_usuario
            const empresa = this.props.id_empresa
            const tipo = this.props.tipo_encuesta

            if (empresa === 0) {
                await this.datos_usuario(usuario)
                let datos = []
                datos = await this.resultados_innovacion(usuario, empresa, tipo)
                this.reporte_final(datos, 1)
                datos = await this.proposito(usuario, empresa, tipo)
                this.reporte_final(datos, 2)
                datos = await this.liderazgo(usuario, empresa, tipo)
                this.reporte_final(datos, 3)
                datos = await this.estructuras_habilitadoras(usuario, empresa, tipo)
                this.reporte_final(datos, 4)
                datos = await this.sistemas_consistentes(usuario, empresa, tipo)
                this.reporte_final(datos, 5)
                datos = await this.cultura_conectada(usuario, empresa, tipo)
                this.reporte_final(datos, 5)
            } else {

            }


            this.setState({
                mostrar: true
            })


        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    Reporte = () => {
        const usuario = this.state.usuario_data
        const idioma = this.props.idioma
            
        let titulo = ""
        let subtitulo = ""
        if (idioma === "ESP") {
            subtitulo = "Muchas gracias por su cooperación"
            if (this.props.tipo_encuesta === 2) {
                titulo = "Encuesta Comité Ejecutivo Inicial - 90°"
            }
        }
        return (
            <div className="container-fluid">
                <h1 className="h3 mb-4 text-gray-800 text-center">{titulo}</h1>
                <h1 className="h4 mb-4 text-gray-800 text-center px-2">{subtitulo}</h1>
                <div className="card form-group">
                    <div className="h5 card-header bg-white text-dark text-center">
                        <div className="row">
                            <div className="col-md-4 py-2">
                                {usuario.NombreEmpresa}
                            </div>
                            <div className="col-md-4 py-2">
                                {usuario.nombre}
                            </div>
                            <div className="col-md-4">
                                <div className="row">
                                    <div className="col-md-6 font-weight-bold py-2">SCORE TOTAL</div>
                                    <div className="col-md-6 py-2">
                                        <span className={this.Style((this.state.promedio_general / 6).toFixed(2))}>{(this.state.promedio_general / 6).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body form-group">
                        <div className="row">
                            {
                                this.state.reporte_final.map((obj, index) => {
                                    return (
                                        <div className="col-md-4 py-2" key={index}>
                                            <div className="card form-group h-100">
                                                <div className="card-header bg-white text-dark text-center" style={{ "height": "145px" }}>
                                                    <div className="row">
                                                        <div className="h6 col-md-9 py-3">{obj.titulo}</div>
                                                        <div className="col-md-3 py-2"> <span className={this.Style(obj.promedio)}>{obj.promedio}</span></div>
                                                    </div>
                                                    <div className="row text-right">
                                                        <div className="col-md-12 h6 pl-5">{obj.peso}</div>
                                                    </div>
                                                </div>
                                                <div className="card-body form-group">
                                                    {
                                                        obj.resultados.map((obj, index) => {                                                            
                                                            let resultados = JSON.parse(obj)                                                            
                                                            return (
                                                                <div className="row" key={index}>
                                                                    <div className="col-md-9 py-2 text-left">{resultados.pregunta}</div>
                                                                    <div className="col-md-3 py-2 text-center"><span className={this.Style(resultados.resultado)}>{resultados.resultado.toFixed(1)}</span></div>
                                                                </div>
                                                            )
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
                <div className="d-flex justify-content-center py-5">
                    <button type="button" className="btn btn-primary px-5 my-2" onClick={this.props.funcion}>{"<< Anterior"}</button>                    
                </div>
            </div>
        )
    }


    render() {
        return (
            <div className="">
                {(this.state.mostrar) ? <this.Reporte /> : ""}
            </div>
        )
    }
}
