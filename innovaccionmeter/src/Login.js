import React, { Component } from 'react'

import Logo from './img/LogoIAM.jpg'

export default class Login extends Component {

    constructor(props) {
        super(props)

        this.state = {
            vista: "login"
        }
    }


    recuperar_clave = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "recuperarform"
        let form_data = {}

        Array.from(document.getElementById(form_id).elements).filter(obj => { return obj.className.includes("requerido") === true }).map(obj => {
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
                const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/recuperar_clave"
                let response = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    window.ModalOk("recuperaci&oacute;n de Clave", "Su clave fue enviada a su correo")
                    window.RemoveClass()
                    document.getElementById("recuperarform").reset()
                    this.setState({
                        vista: "login"
                    })
                } else {
                    window.ModalError("recuperaci&oacute;n de Clave", data.error)
                    document.getElementById(form_id).reset()
                    window.RemoveClass()
                }
            } catch (e) {
                window.ModalError("recuperaci&oacute;n de Clave", e.error)
                document.getElementById(form_id).reset()
            }
        }


    }


    validar_login = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "frmlogin"
        let form_data = {}

        Array.from(document.getElementById(form_id).elements).filter(obj => { return obj.className.includes("requerido") === true }).map(obj => {
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
                const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/login"
                let response = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    window.RemoveClass()
                    sessionStorage.setItem('innovaccionmeter_session', data.token)
                    this.props.data_session()
                } else {
                    window.ModalError("Inicio de Sessi&oacute;n", data.error)
                    document.getElementById(form_id).reset()
                    window.RemoveClass()
                }
            } catch (e) {
                window.ModalError("Inicio de Sessi&oacute;n", e.error)
                document.getElementById(form_id).reset()
            }
        }
    }

    cambiar_vista = (e) => {
        e.preventDefault()
        this.setState({ vista: "recuperar" })
    }



    render() {
        if (this.state.vista === "login") {
            return (
                <div className="custom-class m-auto">
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-12 col-md-9">
                            <div className="card o-hidden border-0 shadow-lg my-5">
                                <div className="card-body p-0">
                                    <div className="row">
                                        <div className="col">
                                            <div className="p-5">
                                                <div className="text-center">
                                                    <img src={Logo} className="img-fluid" alt="Logo IMG" />
                                                </div>
                                                <hr />
                                                <form className="user" id="frmlogin">
                                                    <div className="form-group">
                                                        <label htmlFor="exampleFormControlSelect1">Encuesta</label>
                                                        <select className="form-control requerido" style={{ "borderRadius": "10rem" }} id="frmlogin_tipoEncuesta">
                                                            <option value="2">Equipo Gerencial (90&deg;)</option>
                                                            <option value="3">Colaboradores (180&deg;)</option>
                                                            <option value="4">Proveedores (270&deg;)</option>
                                                            <option value="5">Clientes (360&deg;)</option>
                                                            <option value="88">Administrador</option>
                                                            <option value="99">Coach</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="usuario">Correo Electronico</label>
                                                        <input type="email" className="form-control form-control-user requerido" id="frmlogin_usuario" aria-describedby="emailHelp" />
                                                        <div className="invalid-feedback">
                                                            Campo Obligatorio
												</div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="password">Contreseña</label>
                                                        <input type="password" className="form-control form-control-user requerido" id="frmlogin_password" />
                                                        <div className="invalid-feedback">
                                                            Campo Obligatorio
												</div>
                                                    </div>
                                                    <button type="button" className="btn btn-primary btn-user btn-block" id="frmlogin_enviar" onClick={this.validar_login}>Iniciar Sessi&oacute;n</button>
                                                    <hr />
                                                </form>
                                                <div className="text-center">
                                                    <a className="small" href="/InnovAccionMeter2020/#" onClick={this.cambiar_vista}>Olvide mi Contraseña</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="custom-class m-auto">
                    <div className="row justify-content-center">
                        <div className="col-xl-10 col-lg-12 col-md-9">
                            <div className="card o-hidden border-0 shadow-lg my-5">
                                <div className="card-body p-0">
                                    <div className="row">
                                        <div className="col">
                                            <div className="p-5">
                                                <div className="text-center">
                                                    <img src={Logo} className="img-fluid" alt="Logo IMG" />
                                                </div>
                                                <hr />
                                                <form className="user" id="recuperarform">
                                                    <div className="form-group">
                                                        <label htmlFor="frmlogin_tipoEncuesta">Encuesta</label>
                                                        <select className="form-control requerido" style={{ "borderRadius": "10rem" }} id="frmlogin_tipoEncuesta">
                                                            <option value="">Seleccione</option>
                                                            <option value="2">Equipo Gerencial (90&deg;)</option>
                                                            <option value="3">Colaboradores (180&deg;)</option>
                                                            <option value="4">Proveedores (270&deg;)</option>
                                                            <option value="5">Clientes (360&deg;)</option>
                                                            <option value="88">Administrador</option>
                                                            <option value="99">Coach</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label htmlFor="usuario">Correo Electronico</label>
                                                        <input type="email" className="form-control form-control-user requerido" id="recuperarform_usuario" aria-describedby="emailHelp" />
                                                        <div className="invalid-feedback">Campo Obligatorio</div>
                                                    </div>
                                                    <button type="button" className="btn btn-primary btn-user btn-block" id="recuperarform_enviar" onClick={this.recuperar_clave}>Recuperar Contraseña</button>
                                                    <hr />
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}
