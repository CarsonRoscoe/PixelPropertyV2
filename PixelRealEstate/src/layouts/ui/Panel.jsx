import React, { Component } from 'react'
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import * as EVENTS from '../../const/events';
import {ctr, Contract} from '../../contract/contract';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';

export class Panel extends Component {
    render() {
        return (
            <div onClick={() => this.props.onClick()} className='panel'>
                {this.props.children}
            </div>
        );
    }
}

export class PanelButton extends Component {
    render() {
        return (<input type='button' className={'panelButton'} style={{width: this.props.width}} onClick={() => this.props.onClick()} value={this.props.data}></input>);
    }
}

export class PanelItem extends Component {
    render() {
        return (<div className={'panelItem' + (this.props.title ? ' itemTitle' : '')} style={{width: this.props.width}}>{this.props.data}</div>);
    }
}

export class PanelDivider extends Component {
    render() {
        return (<hr className='panelDivider'></hr>);
    }
}

export class PanelPropertyCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listenerToken: 'PanelPropCanvas' + Math.random(),
            ctx: null,
            scale: 1,
            updateHandle: null,
        };
    }

    componentWillMount() {
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d", {alpha: false});
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.scale(this.props.width / 10, this.props.width / 10);
        this.setState({ ctx, scale: this.props.width });
        if (GFD.getData('ServerDataManagerInit') > 1) {
            ctr.getPropertyColors(this.props.x, this.props.y, (x, y, canvasData) => {
                this.setCanvas(canvasData, this.canvas);
            });
        } else if (GFD.getData('ServerDataManagerInit') > 0) {
            this.setCanvas(SDM.getPropertyImage(this.props.x, this.props.y), this.canvas);
        } else {
            let id = 'mini ' + this.state.x + this.state.y
            GFD.listen('ServerDataManagerInit', id, (result) => {
                if (GFD.getData('ServerDataManagerInit') > 1) {
                    ctr.getPropertyColors(this.props.x, this.props.y, (x, y, canvasData) => {
                        this.setCanvas(canvasData, this.canvas);
                    });
                } else if (GFD.getData('ServerDataManagerInit') > 0) {
                    this.setCanvas(SDM.getPropertyImage(this.props.x, this.props.y), this.canvas);
                }
                GFD.close('ServerDataManagerInit', id);
            });
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.x != this.props.x || newProps.y != this.props.y)
            this.setCanvas(SDM.getPropertyImage(newProps.x, newProps.y));
    }

    componentWillUnmount() {
        if (this.state.updateHandle != null)
            this.state.updateHandle.stopWatching();
    }

    setCanvas(rgbArr, canvas = this.canvas) {
        let ctx = this.state.ctx;
        if (ctx == null) {
            ctx = canvas.getContext("2d", {alpha: false});
        }

        if (canvas == null)
            canvas = this.canvas;
        if (canvas == null)
            return;

        let ctxID = ctx.createImageData(10, 10);
        for (let i = 0; i < 400; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctx.putImageData(ctxID, 0, 0)
        ctx.drawImage(canvas, 0, 0);
    }

    render() {
        return (
            <div className='panelCanvasDiv'>
                <canvas 
                    className='panelCanvas'
                    width={this.props.width} 
                    height={this.props.width}
                    ref={(canvas) => { this.canvas = canvas; }} 
                ></canvas>
            </div>
        );
    }
}