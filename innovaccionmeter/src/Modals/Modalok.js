import React, { Component } from 'react'

export default class Modalok extends Component {
    render() {
        return (
            <div id='Modal_Ok' className='modal fade'>
                <div className='modal-dialog modal-confirm'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='icon-box bg-success' id='ModalEventoIconBox'>
                                <i className="fas fa-check"></i>
                            </div>
                            <h4 className='modal-title' id='Modal_OkTitle'>Titulo</h4>
                        </div>
                        <div className='modal-body'>
                            <p className='text-justify' id='Modal_OkBody'>Contenido</p>
                        </div>
                        <div className='modal-footer'>
                            <button className='btn btn-primary btn-user btn-block' data-dismiss='modal'>OK</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
