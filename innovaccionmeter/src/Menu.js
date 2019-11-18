import React, { Component } from 'react'

import Logo from './img/LogoIAM.jpg'

export default class Menu extends Component {
    
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4 static-top shadow">
            <a className="navbar-brand" href="/#">
              <img src={Logo} className="img-fluid" alt="Logo"/>
            </a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="/#" id="navbarDropdownMenuLink" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-globe"></i>
                    Idioma / Language
                  </a>
                  <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    <a className="dropdown-item" href="/#">Español</a>
                    <a className="dropdown-item" href="/#">English</a>
                  </div>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/#" onClick={() => this.props.tipo_warning(1, "Cerrar Sesión", "¿Esta seguro que desea cerrar sesión?")}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/#">
                    <i className="far fa-user"></i>                    
                    {" " + this.props.Nombre}
                  </a>
                </li>
              </ul>
            </div>
  
  
          </nav>
        )
    }
}
