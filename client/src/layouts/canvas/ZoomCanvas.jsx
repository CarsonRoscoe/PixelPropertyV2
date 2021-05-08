import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import * as EVENTS from '../../const/events';
import {ctr, Contract, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import * as Func from '../../functions/functions.jsx';
import Axios from '../../network/Axios.jsx';
import * as Compress from 'lzwcompress';
import Zoom from './Zoom';
import {GFD, GlobalState} from '../../functions/GlobalState';
import {Label, LabelDetail} from 'semantic-ui-react';
import * as Struct from '../../const/structs';


class ZoomCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            dataCtx: null,
            loadValue: 0,
            cancelToken: null,
            loaded: false,
            hoverX: -1,
            hoverY: -1,
            hideCanvas: true,
            queuedUpdates: [],
            loaded: false,
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
    }

    drawWindow(x, y) {
        if (x == -1 || y == -1) {
            this.setState({hideCanvas: true})
            return;
        }
        this.setState({hideCanvas: false})
        if (this.state.ctx == null)
            return;
        
        //the commented out code is for snapping as grid

        let xx = x * 10;
        let yy = y * 10;
        this.state.ctx.drawImage(this.dataCanvas, Math.min(Math.max(0, xx - 20), 950), Math.min(Math.max(0, yy - 20), 950), 500, 500, 0, 0, 1000, 1000);
        this.setState({
            hoverX: x,
            hoverY: y,
        })
    }

    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        let dataCtx = this.dataCanvas.getContext("2d");
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        //ctx.scale(10, 10);
        this.setState({ ctx, dataCtx });

        ctr.listenForResults(LISTENERS.ServerDataManagerInit, 'canvasZoom', (results) => {
            if (results.imageLoaded) {
                if (!this.state.loaded) {
                    this.setCanvasWithImage(SDM.imagePNG);
                    this.setState({loaded: true});
                }
                if (GFD.getData('ServerDataManagerInit') > 1) {
                    for (let i in this.state.queuedUpdates) {
                        this.setCanvasProperty(this.state.queuedUpdates[i].x, this.state.queuedUpdates[i].y, this.state.queuedUpdates[i].colors);
                    }

                    ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (eventHandle) => {
                        this.setState({eventHandle});
                        eventHandle.watch((error, log) => {
                            //console.info('zoom event');
                            let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                            let colors = Func.ContractDataToRGBAArray(log.args.colors);
                            if (this.state.loaded) {
                                this.setCanvasProperty(id.x, id.y, colors);
                            } else {
                                let update = this.state.queuedUpdates;
                                update.push(Struct.CondensedColorUpdate(id.x, id.y, colors));
                                this.setState({queuedUpdates: update});
                            }
                        });
                    });
                }
            }
        });
       

        GFD.listen('hoverX', 'zoomCanvas', (hoverX) => {
            this.drawWindow(hoverX, GFD.getData('hoverY'));
        })
        GFD.listen('hoverY', 'zoomCanvas', (hoverY) => {
            this.drawWindow(GFD.getData('hoverX'), hoverY);
        })
    }

    setCanvasWithImage(img) {
        this.state.dataCtx.drawImage(img, 0, 0);
    }

    componentWillUnmount() {
        this.state.eventHandle.stopWatching();
    }

    setCanvasProperty(x, y, rgbArr) {
        let ctxID = this.state.dataCtx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, x * 10, y * 10);
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.dataCtx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        for (let i = 0; i < Object.keys(rgbArr).length; i++) {
            for (let j = 0; j < rgbArr[i].length; j++) {
                ctxID.data[i * rgbArr[i].length + j] = rgbArr[i][j];
            }
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.setState({loaded: true});
    }

    render() {
        return (
            <div className={'zoomCanvasContainer'/* + (this.state.hideCanvas ? 'hide' : 'show')*/}>
                <canvas className='dataCanvas hidden'
                    width={1000}
                    height={1000}
                    ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} 
                ></canvas>
                <canvas 
                    className='zoomCanvas' 
                    ref={(canvas) => { this.canvas = canvas; }} 
                    width={100}
                    height={100}
                ></canvas>
            </div>
        );
    }
}

export default ZoomCanvas

//<Zoom onZoom={(zoom) => this.zoomCanvas(zoom)}/>