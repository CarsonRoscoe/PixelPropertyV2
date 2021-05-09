
import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import {Contract, ctr} from '../../contract/contract.jsx';

const zoomValues = [25, 50, 100, 100, 200, 400, 800];
const labelValues = ['25%', '50%', '100%', 'Fit', '200%', '400%', '800%'];

class Zoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 3
        }
    }

    onZoom(zoom, clickId) {
        this.props.onZoom(zoom / 100);
        this.setState({selected: clickId});
    }

    render() {
        return (
            <div className='zoom'>
                {zoomValues.map((value, index) => (
                    <ZoomButton 
                        key={index}
                        amount={zoomValues[index]} 
                        label={labelValues[index]}  
                        selected={this.state.selected == index}
                        clicked={(zoom) => this.onZoom(zoom, index)}
                    />
                ))}
            </div>
        );
    }
}

class ZoomButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <input 
                className={'button ' + (this.props.selected ? ' selected' : '')}
                type='button' 
                value={this.props.label} 
                onClick={() => this.props.clicked(this.props.amount)}
            ></input>
        );
    }
}

export default Zoom