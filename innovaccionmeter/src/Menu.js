import React, { Component } from 'react'
import { AppContext } from './App'

import Logo from './img/LogoIAM.jpg'



export default class Menu extends Component {
  constructor(props) {
    super(props)

    Menu.contextType = AppContext
  }

  logout = () => {
    const { unbind_usuario } = this.context
    sessionStorage.removeItem('innovaccionmeter_session')
    unbind_usuario()
  }

  menu_coach = (state) => {    
    
    if (state.state.usuario.TipoUsuario === 99) {      
      return (
        <a className="nav-link" href={process.env.REACT_APP_LINK} onClick={() => this.props.coach_mail()}>
          <i className="far fa-user"></i>
          {" " + state.state.usuario.Nombre}
        </a>
      )
    } else {
      return (
        <a className="nav-link" href={process.env.REACT_APP_LINK}>
          <i className="far fa-user"></i>
          {" " + state.state.usuario.Nombre}
        </a>
      )
    }
  }

  render() {
    const { state, tipo_warning } = this.context
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4 static-top shadow">
        <a className="navbar-brand" href={process.env.REACT_APP_LINK}>
          <img src={Logo} className="img-fluid" alt="Logo" />
        </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href={process.env.REACT_APP_LINK} id="navbarDropdownMenuLink" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
                <i className="fas fa-globe"></i>
                Idioma / Language
                  </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                <a className="dropdown-item" href={process.env.REACT_APP_LINK}>Español</a>
                <a className="dropdown-item" href={process.env.REACT_APP_LINK}>English</a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link" href={process.env.REACT_APP_LINK} onClick={() => tipo_warning(this.logout, "Cerrar Sesión", "¿Esta seguro que desea cerrar sesión?")}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
                  </a>
            </li>
            <li className="nav-item">
              <this.menu_coach state={state} />
            </li>
          </ul>
        </div>
      </nav>
    )

  }
}
