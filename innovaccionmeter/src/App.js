import React, { Component } from 'react'

import './css/sb-admin-2.css'

import ModalError from './Modals/ModalError'
import ModalOk from './Modals/Modalok'
import ModalWarning from './Modals/ModalWarning'

import Login from './Login'
import Encuestas from './Encuestas'
import Administrador from './Administrador'
import Coach from './Coach'

require('dotenv').config()


export const AppContext = React.createContext({
  state: undefined,
  idioma: undefined,
  tipo_warning: () => { },
  auth_false: () => { }
})


export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      idioma: "ESP",
      tipo_warning: 0
    }
  }


  tipo_warning = (funcion_warning, titulo, texto) => {
    this.setState({
      funcion_warning      
    })
    window.ModalWarning(titulo, texto)
  }

  validar_session = () => {
    if (sessionStorage.getItem('innovaccionmeter_session') !== null) {
      return true
    } else {
      return false
    }
  }

  unbind_usuario = () => {
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
        (this.state.usuario.TipoUsuario >= 2 && this.state.usuario.TipoUsuario <= 5) ? <Encuestas />
          : (this.state.usuario.TipoUsuario === 88) ? <Administrador />
            : (this.state.usuario.TipoUsuario === 99) ? <Coach />
              : ""

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
      <AppContext.Provider value={{
        state: this.state,
        idioma: this.state.idioma,
        tipo_warning: this.tipo_warning,
        auth_false: this.auth_false,
        unbind_usuario: this.unbind_usuario
      }}>
        <div className="container">
          <ModalError />
          <ModalOk />
          <ModalWarning funcion={this.state.funcion_warning} />
          <this.pagina_inicial />
        </div>
      </AppContext.Provider>
    )
  }
}

