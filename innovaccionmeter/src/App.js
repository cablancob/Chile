import React, { Component } from 'react'

import './css/sb-admin-2.css'

import ModalError from './Modals/ModalError'
import ModalOk from './Modals/Modalok'
import ModalWarning from './Modals/ModalWarning'

import Login from './Login'
import Encuestas from './Encuestas'

require('dotenv').config()

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      idioma: "ESP",
      tipo_warning: 0
    }
  }

  tipo_warning = (warning, titulo, texto) => {
    this.setState({
      tipo_warning: warning
    })
    window.ModalWarning(titulo,texto)
  }

  validar_session = () => {
    if (sessionStorage.getItem('innovaccionmeter_session') !== null) {
      return true
    } else {
      return false
    }
  }

  logout = () => {
    sessionStorage.removeItem('innovaccionmeter_session')
    this.setState({
      usuario: undefined
    })
  }

  auth_false = () => {
    sessionStorage.removeItem('innovaccionmeter_session')
    window.ModalError("", "Sessi&oacute;n expirada, inicie sessi&oacute;n nuevamente")
    this.setState({
      usuario: undefined
    })
  }

  pagina_inicial = () => {
    if (this.state.usuario !== undefined) {
      return (        
        (this.state.usuario.TipoUsuario >= 2 && this.state.usuario.TipoUsuario <= 5) ? <Encuestas state={this.state} tipo_warning={this.tipo_warning} auth_false={this.auth_false} /> : ""
      )
    } else {
      return (
        <Login data_session={this.data_session} />
      )
    }
  }

  data_session = async () => {
    try {
      let headers = new Headers()
      headers.append("Content-Type", "application/json")
      headers.append("x-access-token", sessionStorage.getItem('innovaccionmeter_session'))

      const response = await fetch("http://" + window.location.host.split(":")[0] + ":" + process.env.REACT_APP_PORT + "/session", {
        method: "GET",
        headers: headers,
      })

      if (response.status === 200) {
        const data = await response.json()
        this.setState({
          usuario: data
        })
      } else {
        sessionStorage.removeItem('innovaccionmeter_session')
        window.ModalError("", "Sessi&oacute;n expirada, inicie sessi&oacute;n nuevamente")
        this.setState({
          usuario: undefined
        })
      }

    } catch (e) {
      window.ModalError("", e.error)
    }

  }

  componentDidMount = async () => {
    try {
      if (this.validar_session()) {
        await this.data_session()
      } else {
        this.setState({
          usuario: undefined
        })
      }
    } catch (e) {
      window.ModalError("", e.error)
    }
  }



  render() {
    return (
      <div className="container">
        <ModalError />
        <ModalOk />
        <ModalWarning logout={this.logout} tipo={this.state.tipo_warning}/>
        <this.pagina_inicial />
      </div>
    )
  }
}

