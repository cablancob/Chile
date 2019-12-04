import React, { Component } from 'react'

export default class ModalWarning extends Component {


    funcion = () => {   
        this.props.funcion()        
        window.closemodal("Modal_Warning")
    }

    render() {
        return (
            <div id='Modal_Warning' className='modal fade'>
                <div className='modal-dialog modal-confirm'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='icon-box bg-warning' id='ModalEventoIconBox'>
                                <i className="fas fa-exclamation"></i>
                            </div>
                            <h4 className='modal-title' id='Modal_WarningTitle'>Titulo</h4>
                        </div>
                        <div className='modal-body'>
                            <p className='text-justify' id='Modal_WarningBody'>Contenido</p>

                            <div className="row py-3">
                                <div className="col-6">
                                    <button className='btn btn-primary btn-user btn-block' onClick={this.funcion}>SI</button>
                                </div>
                                <div className="col-6">
                                    <button className='btn btn-secondary btn-user btn-block' data-dismiss='modal'>NO</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
