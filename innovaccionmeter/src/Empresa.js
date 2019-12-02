import React, { Component } from 'react'

export default class Empresa extends Component {
    constructor(props) {
        super(props)

        this.state = {
            vista: 0
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
    }

    funcion_inicial = async () => {
        this.setState({
            vista: 1
        })
    }

    boton_accion = (e) => {
        e.preventDefault()
        alert(this.props.tipo)
    }

    pagina_principal = () => {
        let titulo_principal = ""
        let boton = ""
        let class_principal = ""
        let titulo = ""
        let subtitulo = ""
        let contenido = ""
        let contenido_2 = ""
        let division = ""

        if (window.screen.width < 720) {
            class_principal = ""
            titulo = "row bg-primary text-white text-center d-none"
            subtitulo = "col-md-6 bg-primary text-white"
            contenido = "col-md-6"
            contenido_2 = "col-md-6"
            division = "row text-center py-4"

        } else {
            class_principal = "w-75 mx-auto py-3"
            titulo = "row bg-primary text-white text-center"
            subtitulo = "bg-primary text-white d-none"
            contenido = "col-md py-2"
            contenido_2 = "col-md-2 py-2"
            division = "row text-center"
        }

        if (this.props.tipo === "m") {
            titulo_principal = "Modifica Datos Empresa"
            boton = "Actualiza Empresa"
        }
        return (
            <div>
                <h1 className="h3 mb-4 text-gray-800 text-center">{titulo_principal}</h1>
                <form id="EmpresaID">
                    <div className={class_principal}>
                        <div className="form-group">
                            <label htmlFor="NombreEmpresa">Nombre:</label>
                            <input type="text" className="form-control" id="NombreEmpresa" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Sigla">Sigla:</label>
                            <input type="text" className="form-control" id="Sigla" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Contacto">Contacto:</label>
                            <input type="text" className="form-control" id="Contacto" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Correo">Correo:</label>
                            <input type="text" className="form-control" id="Correo" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Correo">Correo:</label>
                            <input type="text" className="form-control" id="Correo" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="Fecha">Fec.Seguimiento:</label>
                            <input type="text" className="form-control" id="Fecha" />
                            <div className="invalid-feedback">Campo Obligatorio</div>
                        </div>
                    </div>
                    <div className="p-2">
                        <div className={titulo}>
                            <div className="col-md-2 py-2" style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className="col-md py-2" style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                        </div>
                        <div className={division}>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="Encuesta90" />
                                    <label className="form-check-label" htmlFor="Encuesta90">Equipo Gerencial (90°)</label>
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P0901" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P0902" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P0903" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P0904" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P0905" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P0906" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="R090" />
                                </div>
                            </div>
                        </div>

                        <div className={division}>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Tipo Encuesta:</div>
                            <div className={contenido_2} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="Encuesta180" />
                                    <label className="form-check-label" htmlFor="Encuesta180">Colaboradores (180°)</label>
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>ICC (Resultados Innovación)</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P1801" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Propósito, Objetivo, Estrategia</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P1802" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Liderazgo Inspirador</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P1803" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Estructuras Habilitadoras</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P1804" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Sistemas Consistentes & Confiables</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P1805" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>Cultura Conectada</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="P1806" />
                                </div>
                            </div>
                            <div className={subtitulo} style={{ "border": "1px solid #c9c9c9" }}>RESUMEN</div>
                            <div className={contenido} style={{ "border": "1px solid #c9c9c9" }}>
                                <div className="form-group">
                                    <input type="text" className="form-control" id="R180" />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="row py-5 text-center">
                    <div className="col-md-6">
                        <button type="button" className="btn btn-primary px-5" onClick={this.boton_accion}>{boton}</button>
                    </div>
                    <div className="col-md-6 py-3">
                        <button type="button" className="btn btn-primary px-5" onClick={this.props.funcion}>{"<< Anterior"}</button>
                    </div>
                </div>
            </div >
        )
    }

    render() {
        console.log(this.props)
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
