import React, { Component } from 'react'
import imagen from './img/welcome.png'

export default class Welcome extends Component {
    render() {
        return (
            <div className="d-flex justify-content-center h-100 bg-white">
                <img width="800" height="800" src={imagen} className="img-fluid" alt="welcome" onClick={() => this.props.avanzar()}/>
            </div>
        )
    }
}
