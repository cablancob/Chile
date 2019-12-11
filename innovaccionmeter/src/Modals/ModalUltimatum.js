import React, { Component } from 'react'
import { AppContext } from '../App'

export default class ModalWarning extends Component {
    constructor(props) {
        super(props)
        ModalWarning.contextType = AppContext

        this.state = {
            vista: 0,
            titulo_principal: "Envio mail de Ultimatum"
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


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/xxxx?id=" + parseInt(id)
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    datos_empresa: data,
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

    obtener_cuerpo_correo = async (id) => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/obtener_cuerpo_correo"
            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {
                this.setState({
                    cuerpo_correo: data
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

    enviar_correo_ultimatum = async () => {
        let valid = true
        let form_data = {}

        window.RemoveClass()
        window.RemoveInvalid()

        if (!document.getElementById("c1").checked) {
            if (document.getElementById("c2").checked) {
                if (document.getElementById("1").value.trim() === "") {
                    document.getElementById("1").classList.add("is-invalid")
                    valid = false
                } else {
                    form_data["correo"] = "1"
                    form_data["contenido"] = document.getElementById("1").value.trim()
                }
            }

            if (document.getElementById("c3").checked) {
                if (document.getElementById("2").value.trim() === "") {
                    document.getElementById("2").classList.add("is-invalid")
                    valid = false
                } else {
                    form_data["correo"] = "2"
                    form_data["contenido"] = document.getElementById("2").value.trim()
                }
            }
        } else {
            form_data["correo"] = "0"
            form_data["contenido"] = ""
        }


        if (valid) {
            try {
                document.getElementById("Modal_UltimatumForm").reset()
                form_data["empresa"] = this.props.datos.empresa
                form_data["usuario"] = this.props.datos.usuario.Id                
                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

                let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/enviar_ultimatum"

                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    window.ModalOk(this.state.titulo_principal, "El correo de Ultimatum fue enviado con exito")
                    window.RemoveClass()
                    window.closemodal("Modal_Ultimatum")
                    this.props.funcion()                    
                } else if (response.status === 400) {
                    window.ModalError(this.state.titulo_principal, data.error)
                } else {
                    this.state.auth_false()
                }
            } catch (e) {
                window.ModalError(this.state.titulo_principal, e.error)
            }
        }
    }

    pagina_principal = () => {
        let correo_default = "Esperamos que este bien. Queríamos comentarle que estamos próximos a cerrar el diagnóstico de potencial innovador y capacidad de gestión de la innovación de la " + this.props.datos.empresa.NombreEmpresa + ". Nos encantaría si antes de cerrarse el diagnóstico pudiésemos contar con su opinión la que seguramente será de mucho valor en el trabajo que se está haciendo."
        return (
            <div id='Modal_Ultimatum' className='modal fade'>
                <div className='modal-dialog modal-confirm'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h4 className='modal-title' id='Modal_UltimatumTitle'>Seleccionar Cuerpo del Correo a Enviar</h4>
                        </div>
                        <div className='modal-body'>
                            <div className="alert alert-success" role="alert">El texto seleccionado en esta ventana es solo el contenido del correo, el saludo al usuario y la firma del correo se generan automaticamente.</div>
                            <form id="Modal_UltimatumForm">
                                <div className="row py-2">
                                    <div className="col-md-6 py-2 my-auto">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="exampleRadios" id="c1" value="0" defaultChecked />
                                            <label className="form-check-label" htmlFor="c1">Correo por Defecto</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 py-2">
                                        <div className="form-group">
                                            <textarea className="form-control" rows="5" id="0" defaultValue={correo_default} readOnly />
                                        </div>
                                    </div>

                                    <div className="col-md-6 py-2 my-auto">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="exampleRadios" id="c2" value="1" />
                                            <label className="form-check-label" htmlFor="c2">Correo Personalizado 1</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 py-2">
                                        <div className="form-group">
                                            <textarea className="form-control" rows="5" id="1" />
                                            <div className="invalid-feedback">Campo Obligatorio</div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 py-2 my-auto">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="exampleRadios" id="c3" value="2" />
                                            <label className="form-check-label" htmlFor="c3">Correo Personalizado 2</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 py-2">
                                        <div className="form-group">
                                            <textarea className="form-control" rows="5" id="2" />
                                            <div className="invalid-feedback">Campo Obligatorio</div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div className="row py-3">
                                <div className="col-6">
                                    <button className='btn btn-primary btn-user btn-block' onClick={() => this.enviar_correo_ultimatum()}>Enviar</button>
                                </div>
                                <div className="col-6">
                                    <button className='btn btn-secondary btn-user btn-block' data-dismiss='modal'>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    funcion_inicial = async () => {
        const { state, auth_false, tipo_warning } = await this.context
        this.setState({
            state,
            auth_false,
            tipo_warning
        })

        await this.obtener_cuerpo_correo()

        this.setState({
            vista: 1
        })

        this.state.cuerpo_correo.map((obj) => document.getElementById(obj.id).value = obj.contenido)

    }



    render() {
        return (
            <div>
                {
                    (this.state.vista === 1) ? <this.pagina_principal /> : ""
                }
            </div>
        )
    }
}
