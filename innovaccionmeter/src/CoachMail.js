import React, { Component } from 'react'
import { AppContext } from './App'

export default class CoachMail extends Component {
    constructor(props) {
        super(props)
        CoachMail.contextType = AppContext

        this.state = {
            vista: 0,
            titulo_principal: "Administración Correo Coach",
            boton: "Actualizar Correo"
        }
    }

    componentDidMount = async () => {
        await this.funcion_inicial()
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

    datos = async () => {
        try {
            let headers = new Headers()
            headers.append("Content-Type", "application/json")
            headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))


            let URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/email_coach"

            const response = await fetch(URL, {
                method: "GET",
                headers: headers,
            })
            let data = await response.json()
            if (response.status === 200) {                
                this.setState({                    
                    vista: 1
                })
                document.getElementById("Correo").value = data[0].Correo
            } else if (response.status === 400) {
                window.ModalError(this.state.titulo_principal, data.error)
            } else {
                this.state.auth_false()
            }

        } catch (e) {
            window.ModalError(this.state.titulo_principal, e.error)
        }

    }

    validar_form = async (e) => {
        e.preventDefault()
        let focus = true
        let valid = true
        const form_id = "FormCoachEmail"
        let form_data = {}        

        Array.from(document.getElementById(form_id).elements).filter(obj => { return obj.className.includes("requerido") === true }).map(obj => show_validate(form_id, obj.id))


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

                const URL = "http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/email_coach"
                let headers = new Headers()
                headers.append("Content-Type", "application/json")
                headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

                let response = await fetch(URL, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(form_data)
                })

                let data = await response.json()

                if (response.status === 200) {
                    window.ModalOk(this.state.titulo_principal, "el correo fue modificado con exito")
                    window.RemoveClass()
                    this.setState({                    
                        vista: await 0
                    })
                    await this.datos()

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
        let class_principal = ""
        if (window.screen.width < 720) {
            class_principal = ""

        } else {
            class_principal = "w-50 mx-auto py-3"
        }        
        return (
            <div>
                <h1 className="h3 py-4 text-gray-800 text-center">{this.state.titulo_principal}</h1>
                <form className={class_principal} id="FormCoachEmail">
                    <div className="form-group">
                        <label htmlFor="Correo">Correo:</label>
                        <input type="text" className="form-control requerido" id="Correo" />
                        <div className="invalid-feedback">Campo Obligatorio</div>
                    </div>
                </form>
                <div className="row py-5 text-center">
                    <div className="col-md-6">
                        <button type="button" className="btn btn-primary px-5" onClick={this.validar_form}>{this.state.boton}</button>
                    </div>
                    <div className="col-md-6 py-3">
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
