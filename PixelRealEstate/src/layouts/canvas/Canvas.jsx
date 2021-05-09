import React, { Component } from 'react'
import * as Const from '../../const/const.jsx';
import {LISTENERS, ctr, Contract} from '../../contract/contract.jsx';
import * as EVENTS from '../../const/events';
import * as Func from '../../functions/functions.jsx';
import * as Compress from 'lzwcompress';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import Zoom from './Zoom';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Assets from '../../const/assets';
import * as Struct from '../../const/structs';

const FOR_SALE_IMAGE = [0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,50,52,0,255,13,13,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,4,4,0,255,122,126,0,255,196,202,0,255,173,179,0,255,68,70,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,82,84,0,255,124,128,0,255,103,106,0,255,38,40,0,255,170,175,0,255,5,5,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,78,80,0,255,146,150,0,255,111,114,0,255,32,33,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,1,1,0,255,98,101,0,255,201,207,0,255,166,171,0,255,64,66,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,102,105,0,255,58,59,0,255,176,181,0,255,38,40,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,103,106,0,255,64,66,0,255,102,105,0,255,32,33,0,255,143,147,0,255,60,61,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,21,22,0,255,176,181,0,255,184,190,0,255,168,173,0,255,163,168,0,255,5,5,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,109,112,0,255,52,54,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255];

class Canvas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ctx: null,
            loadValue: 0,
            cancelToken: null,
            loaded: false,
            queuedUpdates: [],
        }
        this.setCanvasProperty = this.setCanvasProperty.bind(this);
        this.oldPointerX = -1;
        this.oldPointerY = -1;

        this.oldSelect = {x1: -1, y1: -1, x2: -1, y2: -1};
    }
    
    componentDidMount() {
        let ctx = this.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.setState({ ctx });
        this.canvas.onmousemove = (e) => {
            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (100 / rect.width));
            let xyUpdated = false;
            if (x != GFD.getData('hoverX')) {
                GFD.setData('hoverX', x);
                xyUpdated = true;
            }
            let y = Math.floor((e.clientY - rect.top) * (100 / rect.height)); 
            if (y != GFD.getData('hoverY')) {
                GFD.setData('hoverY', y);
                xyUpdated = true;
            }
            let select = GFD.getData('select');
            if (e.buttons == 1 && select.x1 != -1 && select.y1 != -1) {
                if (x != select.x2 - 1) {
                    let x1 = select.x1;
                    if (x1 - x >= 4) {
                        if (select.x2 != x1 - 4)
                            select.x2 = x1 - 4;
                    } else if (x - x1 >= 4) {
                        if (select.x2 != x1 + 4)
                            select.x2 = x1 + 4;
                    } else {
                        select.x2 = x + 1;
                    }
                }
                if (y != select.y2 - 1) {
                    let y1 = select.y1;
                    if (y1 - y >= 4) {
                        if (select.y2 != y1 - 4)
                        select.y2 = y1 - 4;
                    } else if (y - y1 >= 4) {
                        if (select.y2 != y1 + 4)
                        select.y2 = y1 + 4;
                    } else {
                        select.y2 = y + 1;
                    }
                }
            }
            let newSelect = {
                x1: select.x1,
                y1: select.y1,
                x2: select.x2, 
                y2: select.y2, 
            };
            GFD.setData('select', newSelect);
            if (xyUpdated)
                this.setCanvasPointer(x, y);
        };
        this.canvas.onmouseout = (e) => {        
            GFD.setData('hoverX', -1);
            GFD.setData('hoverY', -1);
            this.setCanvasPointer(-1, -1);
            GFD.setData('pressX', -1);
            GFD.setData('pressY', -1);
        };
        this.canvas.onmouseenter = (e) => {
            let rect = this.canvas.getBoundingClientRect();
            GFD.setData('canvasWidth', rect.width);
            GFD.setData('canvasHeight', rect.height);
        };
        
        this.canvas.onclick = (e) => {    
            let select = GFD.getData('select');
            if (!e.isTrusted || select.x1 != select.x2 || select.y1 != select.y2)
                return;

            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
            let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
            GFD.setData('x', x + 1);
            GFD.setData('y', y + 1);

            if (GFD.getData('tutorialStateIndex') == 1) {
                GFD.setData('tutorialStateIndex', 1);
            }
        };
        this.canvas.onmousedown = (e) => {
            if (!e.isTrusted || e.button != 0)
                return;

            let rect = this.canvas.getBoundingClientRect();
            let x = Math.floor((e.clientX - rect.left) * (1000 / rect.width) / 10);
            let y = Math.floor((e.clientY - rect.top) * (1000 / rect.height) / 10); 
            GFD.setData('pressX', x + 1);
            GFD.setData('pressY', y + 1);

            let select = GFD.state.select;
            select.x1 = x + 1;
            select.y1 = y + 1;
            select.x2 = x + 1;
            select.y2 = y + 1;
            GFD.setData('select', select);
        }

        this.canvas.onmouseup = (e) => {     
            GFD.setData('pressX', -1);
            GFD.setData('pressY', -1);
        }

        ctr.listenForResults(LISTENERS.ServerDataManagerInit, 'canvas', (results) => {
            if (results.imageLoaded) {
                if (!this.state.loaded) {
                    this.setCanvasWithImage(SDM.imagePNG);
                    this.setState({loaded: true});
                }
                if (GFD.getData('ServerDataManagerInit') > 1) {
                    for (let i in this.state.queuedUpdates) {
                        this.setCanvasProperty(this.state.queuedUpdates[i].x, this.state.queuedUpdates[i].y, this.state.queuedUpdates[i].colors);
                    }
                    this.setup();
                }
            }
        });

        GFD.listen('imagePNG', 'canvasBox', (PNG) => {
            if (PNG == null)
                return;
            this.setCanvasWithImage(PNG);
            if (this.state.showForSale) {
                this.showPropertiesForSale();
            }
        })

        GFD.listen('select', 'canvasBox', (select) => {
            if (select.x1 == -1 || select.y1 == -1 || select.x2 == -1 || select.y2 == -1)
                return;
            this.updateSelectRect(select.x1 - 1, select.y1 - 1, select.x2 - 1, select.y2 - 1);
        });

        GFD.listen('x', 'canvasBox', (x) => {
            let select = GFD.state.select;
            let y = GFD.getData('y');
            select.x1 = x;
            select.y1 = y;
            select.x2 = x;
            select.y2 = y;
            GFD.setData('select', select);
        });
        GFD.listen('y', 'canvasBox', (y) => {
            let select = GFD.state.select;
            let x = GFD.getData('x');
            select.x1 = x;
            select.y1 = y;
            select.x2 = x;
            select.y2 = y;
            GFD.setData('select', select);
        });
    }

    setup() {
        this.setState({eventHandle: ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (propertyId, colorsArray, lastUpdateTimestamp, lastUpdaterPayeeAddress, becomesPublicTimestamp, rewardedCoinsAmount, event) => {
                let id = ctr.fromID(Func.BigNumberToNumber(propertyId));
                let colors = Func.ContractDataToRGBAArray(colorsArray);
                if (this.state.loaded) {
                    this.setCanvasProperty(id.x, id.y, colors);
                } else {
                    let update = this.state.queuedUpdates;
                    update.push(Struct.CondensedColorUpdate(id.x, id.y, colors));
                    this.setState({queuedUpdates: update});
                }
            }),
        });

        ctr.listenForResults(LISTENERS.PendingSetPixelUpdate, 'Canvas', (data) => {
            this.setCanvasProperty(data.x, data.y, data.pixelData, true);
        });

        ctr.listenForResults(LISTENERS.ShowForSale, 'Canvas', (data) => {
            this.setState({showForSale: data.show});
            if (data.show)
                this.showPropertiesForSale();
            else
                this.setCanvas(SDM.pixelData);
        })
    }

    componentWillUnmount() {
        if (this.state.eventHandle != null)
            this.state.eventHandle.stopWatching();
        GFD.closeAll('Canvas');
        ctr.stopListeningForResults(LISTENERS.ShowForSale, 'Canvas');
    }

    showPropertiesForSale() {
        let image = this.state.ctx.getImageData(0, 0, 1000, 1000);
        for (let y = 0; y < 1000; y++) {
            for (let x = 0; x < 100; x++) {
                for (let i = 0; i < 40; i++) {
                    if (SDM.forSaleProperties[x] != null 
                        && SDM.forSaleProperties[x][Math.floor(y / 10)] != null 
                        && SDM.forSaleProperties[x][Math.floor(y / 10)].isForSale) {
                            image.data[y * 4000 + x * 40 + i] = FOR_SALE_IMAGE[y % 10 * 40 + i];
                    } else {
                    //apply alpha
                    if (i % 4 == 3)
                        image.data[y * 4000 + x * 40 + i] = 128;
                    }
                }
            }
        }
        this.state.ctx.putImageData(image, 0, 0);
    }

    updateSelectRect(x1, y1, x2, y2) {
        this.colorizePointer(this.oldSelect.x1, this.oldSelect.y1, this.oldSelect.x2, this.oldSelect.y2, 255);
        this.oldSelect = {x1, y1, x2, y2};
        this.colorizePointer(x1, y1, x2, y2, 8); 
    }

    setCanvasPointer(x, y) {
        if (x == -1 || y == -1) {
            this.colorizePointer(this.oldPointerX, this.oldPointerY, this.oldPointerX, this.oldPointerY, 255);
            this.oldPointerX = -1;
            this.oldPointerY = -1;
            return;
        }
        if (x == this.oldPointerX && y == this.oldPointerY) {
            return;
        }
        this.colorizePointer(this.oldPointerX, this.oldPointerY, this.oldPointerX, this.oldPointerY, 255);
        this.colorizePointer(x, y, x, y, 8);
        this.oldPointerX = x;
        this.oldPointerY = y;
    }

    //shape vars
    colorizePointer(x1, y1, x2, y2, alpha) {
        if (x1 == -1 || y1 == -1)
            return;
        if (x2 < x1) {
            let t = x1;
            x1 = x2;
            x2 = t;
        }
        if (y2 < y1) {
            let t = y1;
            y1 = y2;
            y2 = t;
        }
        let w = Math.abs(x2 - x1) + 1;
        let h = Math.abs(y2 - y1) + 1;
        let wp = (w * 10) + 4;
        let hp = (h * 10) + 4;
        let ctxID = this.state.ctx.getImageData((x1 * 10) - 2, (y1 * 10) - 2, wp, hp);
        for (let i = 3; i < ctxID.data.length; i+=4) {
            let idx = (i - 3) / 4;
            if (idx < wp * 2 || idx >= (wp * hp) - (wp * 2) || idx % wp < 2 || idx % wp >= wp - 2) {
                ctxID.data[i] = alpha;
            }
        }
        this.state.ctx.putImageData(ctxID, (x1 * 10) - 2, (y1 * 10) - 2);
    }

    setCanvasProperty(x, y, rgbArr, isPending = false) {
        let ctxID = this.state.ctx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = (isPending && i % 4 == 3) ? 80 : rgbArr[i];
        }
        //if pending show loading icon
        this.state.ctx.putImageData(ctxID, x * 10, y * 10);

        let select = GFD.getData('select');
        let hoverX = GFD.getData('hoverX');
        let hoverY = GFD.getData('hoverY');
        if ((x >= select.x1 - 1 || x <= select.x2 + 1) && (y >= select.y1 - 1 || y <= select.y2 + 1))
            GFD.setData('select', select);
        if ((x >= hoverX - 1 || x <= hoverX + 1) && (y >= hoverY - 1 || y <= hoverY + 1)) {
            GFD.setData('hoverX', hoverX);
            GFD.setData('hoverY', hoverY);
        }
    }

    setCanvasWithImage(img) {
        this.state.ctx.drawImage(img, 0, 0);
        this.setState({loaded: true});
        let pxlData = this.state.ctx.getImageData(0, 0, Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT).data;
        for (let y = 0; y < 1000; y++) {
            SDM.pixelData[y] = pxlData.slice(y * 4000, (y + 1) * 4000);
        }
        GFD.setData('select', GFD.getData('select'));
        this.setCanvasPointer(GFD.getData('hoverX'), GFD.getData('hoverY'));
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.ctx.createImageData(Const.CANVAS_WIDTH, Const.CANVAS_HEIGHT);
        for (let i = 0; i < Object.keys(rgbArr).length; i++) {
            for (let j = 0; j < rgbArr[i].length; j++) {
                ctxID.data[i * rgbArr[i].length + j] = rgbArr[i][j];
            }
        }
        this.state.ctx.putImageData(ctxID, 0, 0);
        this.setState({loaded: true});
        
    }

    render() {
        return (
            <div className='canvasContainer'>
                <canvas className='dataCanvas hidden'
                    width={1000}
                    height={1000}
                    ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} 
                ></canvas>
                <canvas 
                    className={'canvas zoom-6 ' + (this.state.loaded ? '' : 'hidden')} 
                    ref={(canvas) => { this.canvas = canvas; }} 
                    width={Const.CANVAS_WIDTH} 
                    height={Const.CANVAS_HEIGHT}
                ></canvas>
                <div className={!this.state.loaded ? 'loading' : 'hidden'}>
                    <img className='icon' src={Assets.LOADING} draggable={false}></img>
                </div>
                <a target='_blank' ref={(linkTag) => {this.linkTag = linkTag}} style={{display: 'hidden'}}></a>
            </div>
        );
    }
}

export default Canvas

//<Zoom onZoom={(zoom) => this.zoomCanvas(zoom)}/>