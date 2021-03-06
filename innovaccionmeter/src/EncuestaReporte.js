import React, { Component } from 'react'
import { AppContext } from './App'



export default class EncuestaReporte extends Component {
    constructor(props) {
        super(props)

        EncuestaReporte.contextType = AppContext

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

    enviar_encuesta = async (e) => {
        e.preventDefault()
        let valid = true
        let focus = true
        let form_data = {}
        const form_id = "form_con_coach"

        Array.from(document.getElementById(form_id).elements).map((obj) => {
            show_validate(form_id, obj.id)
            return true
        })

        function show_validate(form_id, id) {
            if (document.getElementById(form_id).elements[id].value.trim() === "") {
                valid = false
                document.getElementById(form_id).elements[id].classList.remove("is-valid")
                document.getElementById(form_id).elements[id].classList.add("is-invalid")
                if (focus) {
                    document.getElementById(form_id).elements[id].focus()
                    focus = false
                }
            } else {
                document.getElementById(form_id).elements[id].classList.remove("is-invalid")
                document.getElementById(form_id).elements[id].classList.add("is-valid")
                form_data[id] = document.getElementById(form_id).elements[id].value
            }
        }

        if (valid) {
            try {
                let canvas_image = ""
                await window.html2canvas(document.getElementById("tabla-final"), {
                    onrendered: function (canvas) {
                        canvas_image = canvas.toDataURL()
                    }
                });
                form_data["IdEmpresa"] = this.state.datos_empresa.IdEmpresa
                form_data["NombreEmpresa"] = this.state.datos_empresa.NombreEmpresa
                form_data["Contacto"] = this.state.datos_empresa.Contacto
                form_data["correo_contacto"] = this.state.datos_empresa.correo_contacto
                form_data["Sigla"] = this.state.datos_empresa.Sigla
                form_data["tipo_encuesta"] = this.props.tipo_encuesta
                form_data["imagen"] = canvas_image

                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

                const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/enviar_conclusion"
                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    window.ModalOk("Env&iacute;o de Conclusi&oacute;n", "Se env&iacute;o satisfactoriamente la conclusi&oacute;n y recomendacion a: " + data.Contacto)

                } else if (response.status === 400) {
                    window.ModalError("Env&iacute;o de Conclusi&oacute;n", data.error)
                } else {
                    this.state.auth_false()
                }
            } catch (e) {
                window.ModalError("Env&iacute;o de Conclusi&oacute;n", e.error)
                document.getElementById(form_id).reset()
            }
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
                if (empresa === 0) {
                    let usuario = this.state.usuario_data
                    for (let i in usuario) {
                        if (i.includes("P09")) {
                            peso_empresa.push(usuario[i])
                        }
                    }
                } else {
                    let empresa = this.state.datos_empresa
                    for (let i in empresa) {
                        if (i.includes("P09")) {
                            peso_empresa.push(empresa[i])
                        }
                    }
                    this.setState({
                        conclusion: (empresa["Conclusion90"]) !== null ? empresa["Conclusion90"] : "",
                        recomendacion: (empresa["Recomendacion90"]) !== null ? empresa["Recomendacion90"] : ""
                    })
                }
                this.setState({
                    peso_empresa
                })
            }
            if (tipo === 3) {
                let peso_empresa = []
                if (empresa === 0) {
                    let usuario = this.state.usuario_data
                    for (let i in usuario) {
                        if (i.includes("P18")) {
                            peso_empresa.push(usuario[i])
                        }
                    }
                } else {
                    let empresa = this.state.datos_empresa
                    for (let i in empresa) {
                        if (i.includes("P18")) {
                            peso_empresa.push(empresa[i])
                        }
                    }
                    this.setState({
                        conclusion: (empresa["Conclusion180"]) !== null ? empresa["Conclusion180"] : "",
                        recomendacion: (empresa["Recomendacion180"]) !== null ? empresa["Recomendacion180"] : ""
                    })
                }
                this.setState({
                    peso_empresa
                })
            }
            if (tipo === 4) {
                let peso_empresa = []
                if (empresa === 0) {
                    let usuario = this.state.usuario_data
                    for (let i in usuario) {
                        if (i.includes("P27")) {
                            peso_empresa.push(usuario[i])
                        }
                    }
                } else {
                    let empresa = this.state.datos_empresa
                    for (let i in empresa) {
                        if (i.includes("P27")) {
                            peso_empresa.push(empresa[i])
                        }
                    }
                    this.setState({
                        conclusion: (empresa["Conclusion270"]) !== null ? empresa["Conclusion270"] : "",
                        recomendacion: (empresa["Recomendacion270"]) !== null ? empresa["Recomendacion270"] : ""
                    })
                }
                this.setState({
                    peso_empresa
                })
            }

            if (tipo === 5) {
                let peso_empresa = []
                if (empresa === 0) {
                    let usuario = this.state.usuario_data
                    for (let i in usuario) {
                        if (i.includes("P36")) {
                            peso_empresa.push(usuario[i])
                        }
                    }
                } else {
                    let empresa = this.state.datos_empresa
                    for (let i in empresa) {
                        if (i.includes("P36")) {
                            peso_empresa.push(empresa[i])
                        }
                    }
                    this.setState({
                        conclusion: (empresa["Conclusion360"]) !== null ? empresa["Conclusion360"] : "",
                        recomendacion: (empresa["Recomendacion360"]) !== null ? empresa["Recomendacion360"] : ""
                    })
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
                this.state.auth_false()
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
                this.state.auth_false()
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
                this.state.auth_false()
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
                this.state.auth_false()
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
                this.state.auth_false()
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
                this.state.auth_false()
                return {}
            }

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    tool_tips_data = async (usuario, empresa, tipo) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/tool_tips_data?user=" + parseInt(usuario) + "&empresa=" + parseInt(empresa) + "&tipo=" + parseInt(tipo)

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                let json_data = []
                for (let i in data) {
                    let item = {}
                    let datos = data[i].split("|")

                    if (parseInt(datos[2]) !== 0) {
                        item["pagina"] = datos[0]
                        item["pregunta"] = datos[1]
                        item["valor"] = datos[2]
                        item["texto"] = datos[3]
                        item["total"] = datos[4]
                        json_data.push(item)
                    }


                }

                this.setState({
                    tooltips: json_data
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
                this.state.auth_false()
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



    componentDidMount = async () => {
        try {
            const usuario = this.props.id_usuario
            const empresa = this.props.id_empresa
            const tipo = this.props.tipo_encuesta


            const { state, auth_false } = await this.context
            this.setState({
                state,
                auth_false
            })

            if (empresa === 0) {
                await this.datos_usuario(usuario)
            } else {
                await this.datos_empresa(empresa)
            }

            if (this.state.state.usuario.TipoUsuario === 99) {
                await this.tool_tips_data(usuario, empresa, tipo)
            }

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
            this.reporte_final(datos, 6)
                        
            this.setState({
                mostrar: true
            })

            document.getElementById("div_principal").style.width = "1080px";

            if (this.props.correo !== undefined) {
                await this.correo_encuesta_finalizada(this.props)
            }            

        } catch (e) {
            window.ModalError("Reporte", e.error)
        }
    }

    correo_encuesta_finalizada = async (usuario) => {
        try {
            let form_data = {}
            let canvas_image = ""               
            await window.html2canvas(document.getElementById("tabla-final"), {
                onrendered: function (canvas) {                    
                    canvas_image = canvas.toDataURL("image/jpeg")
                }
            });                        
            form_data["tipo_encuesta"] = usuario.tipo_encuesta
            form_data["id_usuario"] = usuario.id_usuario
            form_data["imagen"] = canvas_image               
            document.getElementById("div_principal").style.width = ""    

            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

            const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/correo_encuesta_finalizada"            
            let response = await fetch(URL, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(form_data)
            })
            

            let data = await response.json()

            if (response.status === 200) {

            } else if (response.status === 400) {
                window.ModalError("Env&iacute;o de Resultados de Encuesta", data.error)
            } else {
                this.state.auth_false()
            }
        } catch (e) {            
            window.ModalError("Env&iacute;o de Resultados de Encuesta", e.error)
        }
    }

    Reporte = () => {
        const usuario = this.state.usuario_data
        const idioma = this.state.idioma
        const empresa = this.props.id_empresa

        let titulo = ""
        let subtitulo = ""
        let pie_pagina = ""
        let ancho = ""
        let ocultar = ""
        if (window.screen.width < 720) {
            ancho = "970px"
            ocultar = "block"
        } else {
            ancho = "auto"
            ocultar = "none"
        }     

        if (idioma === "ESP") {
            subtitulo = "Muchas gracias por su cooperación"
            pie_pagina = "El equipo de Best Place to Innovate le agradece su participación en contestar esta encuesta."
            if (this.props.tipo_encuesta === 2) {
                titulo = "Resultado Encuesta 90°"
            }
            if (this.props.tipo_encuesta === 3) {
                titulo = "Resultado Encuesta 180°"
            }
            if (this.props.tipo_encuesta === 4) {
                titulo = "Resultado Encuesta 270°"
            }
            if (this.props.tipo_encuesta === 4) {
                titulo = "Resultado Encuesta 360°"
            }
        }        
        return (
            <div className="container-fluid">
                <h1 className="h3 mb-4 text-gray-800 text-center">{titulo}</h1>
                <h1 className="h4 mb-4 text-gray-800 text-center px-2">{subtitulo}</h1>
                <div className="py-5 text-center">
                    <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                </div>                
                <h1 className="h3 mb-4 text-gray-800" style={{"display": ocultar}}>Deslice a la Derecha</h1>
                <div className="table-responsive">         
                <div className="card" id="tabla-final" style={{"width": ancho}}>
                
                    <div className="h5 card-header bg-white text-dark text-center">
                        <div className="row">
                            <div className="col-4 py-2">
                                {(empresa === 0) ? usuario.NombreEmpresa : this.state.datos_empresa.NombreEmpresa}
                            </div>
                            <div className="col-4 py-2">
                                {(empresa === 0) ? usuario.nombre : ""}
                            </div>
                            <div className="col-4">
                                <div className="row">
                                    <div className="col-6 font-weight-bold py-2">SCORE TOTAL</div>
                                    <div className="col-6 py-2">
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
                                        <div className="col-4" key={index} style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                            <div className="card h-100">
                                                <div className="card-header bg-white text-dark text-center" style={{ "height": "110px" }}>
                                                    <div className="row">
                                                        <div className="h6 col-9 py-3">{obj.titulo}</div>
                                                        <div className="col-3 py-2"> <span className={this.Style(obj.promedio)}>{obj.promedio}</span></div>
                                                    </div>
                                                    <div className="row text-right">
                                                        <div className="col-12 h6 pl-5">{obj.peso}</div>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    {
                                                        obj.resultados.map((obj, index) => {
                                                            let resultados = JSON.parse(obj)
                                                            if (this.state.tooltips === undefined) {
                                                                return (
                                                                    <div className="row" key={index}>
                                                                        <div className="col-9 py-2 text-left">{resultados.pregunta}</div>
                                                                        <div className="col-3 py-2 text-center"><span className={this.Style(resultados.resultado)}>{resultados.resultado.toFixed(1)}</span></div>
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
                                                                        <div className="col-9 py-2 text-left" data-toggle="tooltip" title={texto}>{resultados.pregunta}</div>
                                                                        <div className="col-3 py-2 text-center"><span className={this.Style(resultados.resultado)}>{resultados.resultado.toFixed(1)}</span></div>
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
                </div>
                {(empresa !== 0) ? <this.conclusion /> : ""}
                <div className="d-flex justify-content-center py-5">
                    {pie_pagina}
                </div>
                <this.boton />
            </div>
        )
    }

    conclusion = () => {
        return (
            <form className="form-group py-5" id="form_con_coach">
                <div className="form-group">
                    <label htmlFor="comment">Conclusión</label>
                    <textarea className="form-control" rows="3" id="conclusion_coach" readOnly={(this.state.state.usuario.TipoUsuario === 88) ? true : false} defaultValue={this.state.conclusion} />
                    <div className="invalid-feedback">Campo Obligatorio</div>
                </div>
                <div className="form-group">
                    <label htmlFor="comment">Recomendación</label>
                    <textarea className="form-control" rows="3" id="recomendacion_coach" readOnly={(this.state.state.usuario.TipoUsuario === 88) ? true : false} defaultValue={this.state.recomendacion} />
                    <div className="invalid-feedback">Campo Obligatorio</div>
                </div>
            </form>
        )
    }

    boton = () => {
        if (this.state.state.usuario.TipoUsuario === 99 && this.props.id_empresa !== 0) {
            return (
                <div className="row text-center pb-5">
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                    </div>
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.enviar_encuesta}>{"Enviar Encuesta"}</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="d-flex justify-content-center py-1">
                    <button type="button" className="btn btn-primary px-5 my-2" onClick={this.props.funcion}>{"<< Anterior"}</button>
                </div>
            )
        }
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
