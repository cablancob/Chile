import React, { Component } from 'react'

import Menu from './Menu'
import EncuestasTotalEmpresa from './EncuestasTotalEmpresa'
import MantencionEmpresas from './MantencionEmpresas'
import Estadisticas from './Estadisticas'

export default class Coach extends Component {
    constructor(props) {
        super(props)

        this.state = {
            menu: 2,
            submenu: 6
        }
    }

    regresar = async () => {

    }

    cambiar_pagina = async (menu, submenu) => {    
        
        this.setState({
            submenu: await 0
        })
        this.setState({
            menu,
            submenu
        })

    }

    style_menu = (id) => {
        if ((id === this.state.menu || (id === this.state.submenu))) {
            return "p-3 badge badge-success text-uppercase"
        } else {
            return "p-3 badge badge-light text-uppercase"
        }
    }

    //"h5 bg-success text-white"

    pagina_principal = () => {
        return (
            <div className="container-fluid">
                <hr></hr>
                <div className="row form-group text-center">
                    <div className="col-md-3 form-group">
                        <u>
                            <a className={this.style_menu(2)} href="/#" onClick={() => this.cambiar_pagina(2, 6)}>Equipo Gerencial (90°)</a>
                        </u>
                    </div>
                    <div className="col-md-3 form-group">
                        <u>
                            <a className={this.style_menu(3)} href="/#" onClick={() => this.cambiar_pagina(3, 6)}>Colaboradores (180°)</a>
                        </u>
                    </div>
                    <div className="col-md-3 form-group">
                        <u>
                            <a className={this.style_menu(4)} href="/#" onClick={() => this.cambiar_pagina(4, 6)}>Proveedores (270°)</a>
                        </u>
                    </div>
                    <div className="col-md-3 form-group">
                        <u>
                            <a className={this.style_menu(5)} href="/#" onClick={() => this.cambiar_pagina(5, 6)}>Clientes (360°)</a>
                        </u>
                    </div>
                </div>
                <hr></hr>
                <div className="row form-group text-center px-5">
                    <div className="col-md-4 form-group">
                        <u>
                            <a className={this.style_menu(6)} href="/#" onClick={() => this.cambiar_pagina(this.state.menu, 6)}>Estadisticas</a>
                        </u>
                    </div>
                    <div className="col-md-4 form-group">
                        <u>
                            <a className={this.style_menu(7)} href="/#" onClick={() => this.cambiar_pagina(this.state.menu, 7)}>Encuestas Terminadas</a>
                        </u>
                    </div>
                    <div className="col-md-4 form-group">
                        <u>
                            <a className={this.style_menu(8)} href="/#" onClick={() => this.cambiar_pagina(this.state.menu, 8)}>Mantencion Empresas</a>
                        </u>
                    </div>
                </div>                
            </div>
        )

    }


    render() {
        const menu = this.state.menu
        const submenu = this.state.submenu
        return (
            <div>
                <div className="">
                    <div id="wrapper" className="">
                        <div id="content-wrapper" className="d-flex flex-column">
                            <div id="content">
                                <Menu />
                                <this.pagina_principal />
                                <div className="container-fluid">
                                    {
                                        (submenu === 7) ? <EncuestasTotalEmpresa tipo={menu} />
                                            : (submenu === 8) ? <MantencionEmpresas tipo={menu} />
                                                : (submenu === 6) ? <Estadisticas tipo={menu} />
                                                    : ""
                                    }
                                </div>
                            </div>
                            <footer className="sticky-footer bg-white">
                                <div className="container my-auto">
                                    <div className="copyright text-center my-auto">
                                        <span>Copyright &copy; Best Place to Innovate</span>
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
