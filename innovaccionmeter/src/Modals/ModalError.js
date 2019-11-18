import React, { Component } from 'react'

export default class ModalError extends Component {
    render() {
        return (
            <div id='Modal_Error' className='modal fade'>
                <div className='modal-dialog modal-confirm'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <div className='icon-box bg-danger' id='ModalEventoIconBox'>
                                <i className="fas fa-times"></i>
                            </div>
                            <h4 className='modal-title' id='Modal_ErrorTitle'>Titulo</h4>
                        </div>
                        <div className='modal-body'>
                            <p className='text-justify' id='Modal_ErrorBody'>Contenido</p>
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
