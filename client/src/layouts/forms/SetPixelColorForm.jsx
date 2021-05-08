import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Const from '../../const/const.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { ChromePicker } from 'react-color';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import * as Strings from '../../const/strings';
import { Modal, ModalContent, ModalHeader, Button, Divider, Input, List, Popup, Label, ModalActions, Icon, Segment, Grid, GridColumn, GridRow, ButtonGroup, Message, Loader } from 'semantic-ui-react';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import PXLBalanceItem from '../ui/PXLBalanceItem';

const PREVIEW_WIDTH = 100;
const PREVIEW_HEIGHT = 100;

const DrawMode = {
    PIXEL: 0,
    FILL: 1,
    PICK: 2,
    ERASE: 3,
};

class SetPixelColorForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            select: {x1: -1, y1: -1, x2: -1, y2: -1, w: 0, h: 0},
            multiRect: false,
            ppt: '0',
            maxPayout: 5,
            ctxLrg: null,
            ctxSml: null,
            canvasLrg: null,
            canvasSml: null,
            drawColor: {
                    r: 255,
                    g: 255,
                    b: 255,
                    a: 255,
                  },
            drawMode: DrawMode.PIXEL,
            isOpen: false,
            pendingState: Const.FORM_STATE.IDLE,
        };
    }
    
    componentWillReceiveProps(newProps) {
        let update = {};
        Object.keys(newProps).map((i) => {
            if (newProps[i] != this.props[i]) {
                update[i] = newProps[i];
            }
        });
        this.setState(update);
    }

    componentDidUnmountOpen() {
        GFD.closeAll('UpdatePixel');
        this.setState({pendingState: Const.FORM_STATE.IDLE});
        this.state.canvasLrg.onmousedown = null;
        this.state.canvasLrg.onmouseup = null;
        this.state.canvasLrg.onmousemove = null;
        this.setState({
            ctxLrg: null,
            ctxSml: null,
            canvasLrg: null,
            canvasSml: null,
        })
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handlePrice(key, value) {
        let obj = {maxPayout: 0};
        obj[key] = isNaN(parseInt(value)) ? '' : Math.max(0, parseInt(value));
        obj.maxPayout = ((obj[key] === '' ? 0 : obj[key]) + 1) * 5;
        this.setState(obj);
    }

    componentDidMountOpen() {
        let canvasLrg = document.querySelector('canvas#large');
        let canvasSml = document.querySelector('canvas#normal');
        if (canvasLrg == null || canvasSml == null)
            return;
        let ctxLrg = canvasLrg.getContext("2d");
        let ctxSml = canvasSml.getContext("2d");
        ctxSml.imageSmoothingEnabled = false;
        ctxLrg.imageSmoothingEnabled = false;
        ctxSml.webkitImageSmoothingEnabled = false;
        ctxLrg.webkitImageSmoothingEnabled = false;
        this.canvasLrg.onmousedown = this.canvasLrg.onmouseenter = (ev) => {
            if (ev.buttons == 0 || ev.button != 0)
                return;
            this.setState({mousePressed: true});
            this.attemptDraw(ev);
        };
        this.canvasLrg.onmouseup = this.canvasLrg.onmouseleave = (ev) => {
            this.setState({mousePressed: false});
        };
        this.canvasLrg.onmousemove = (ev) => {
            if (this.state.mousePressed)
                this.attemptDraw(ev);
        };
        GFD.listen('select', 'UpdatePixel', (select) => {
            let multiRect = select.x2 != -1 && select.y2 != -1 && (select.x1 != select.x2 || select.y1 != select.y2);
            select.w = Math.abs(select.x2 - select.x1) + 1;
            select.h = Math.abs(select.y2 - select.y1) + 1;
            if (multiRect) {
                this.setMultiCanvas(select.w, select.h, SDM.getPropertyRect(select.x1 - 1, select.y1 - 1, select.x2 - 1, select.y2 - 1), ctxSml, ctxLrg, canvasSml);
            } else if (GFD.getData('x') - 1 > -1 && GFD.getData('y') - 1 > -1) {
                this.setCanvas(SDM.getPropertyImage(GFD.getData('x') - 1, GFD.getData('y') - 1), ctxSml, ctxLrg, canvasSml);
            }
            this.setState({
                select, multiRect,
            });
        })
        this.setState({
            ctxLrg, 
            ctxSml,
            canvasLrg,
            canvasSml
        });
        GFD.listen('x', 'UpdatePixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'UpdatePixel', (y) => {
            this.setState({y});
        })
    }

    attemptDraw(ev) {
        if (!ev.isTrusted)
                return;
            
        let pixelClick = {
            x: Math.floor(ev.offsetX / 10), 
            y: Math.floor(ev.offsetY / 10), 
        };

        switch(this.state.drawMode) {
            case DrawMode.PIXEL:
                return this.drawPixel(pixelClick.x, pixelClick.y);
            case DrawMode.FILL:
                return this.drawFill(pixelClick.x, pixelClick.y);
            case DrawMode.PICK:
                return this.pickPixelColor(pixelClick.x, pixelClick.y);
            case DrawMode.ERASE:
                return this.erasePixel(pixelClick.x, pixelClick.y);
            default:
                return;
        }
    }

    setCanvas(rgbArr, ctxSml = this.state.ctxSml, ctxLrg = this.state.ctxLrg, canvasSml = this.state.canvasSml) {
        ctxLrg.canvas.width = 100;
        ctxLrg.canvas.height = 100;
        ctxSml.canvas.width = 10;
        ctxSml.canvas.height = 10;
        ctxLrg.imageSmoothingEnabled = false;
        ctxLrg.webkitImageSmoothingEnabled = false;
        ctxSml.imageSmoothingEnabled = false;
        ctxSml.webkitImageSmoothingEnabled = false;
        let ctxID = ctxSml.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctxSml.putImageData(ctxID, 0, 0);
        ctxLrg.drawImage(canvasSml, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    }

    setMultiCanvas(w, h, rgbArr, ctxSml = this.state.ctxSml, ctxLrg = this.state.ctxLrg, canvasSml = this.state.canvasSml) {
        ctxLrg.canvas.width = w * 100;
        ctxLrg.canvas.height = h * 100;
        ctxSml.canvas.width = w * 10;
        ctxSml.canvas.height = h * 10;
        ctxLrg.imageSmoothingEnabled = false;
        ctxLrg.webkitImageSmoothingEnabled = false;
        ctxSml.imageSmoothingEnabled = false;
        ctxSml.webkitImageSmoothingEnabled = false;
        let ctxID = ctxSml.createImageData(w * 10, h * 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctxSml.putImageData(ctxID, 0, 0);
        ctxLrg.drawImage(canvasSml, 0, 0, w * 100, h * 100);
    }

    pickPixelColor(x, y) {
        let pixelData = this.state.ctxSml.getImageData(x, y, 1, 1);
        let p = {
            r: pixelData.data[0],
            g: pixelData.data[1],
            b: pixelData.data[2],
            a: 1,
        };
        this.setState({
            drawColor: p,
            drawMode: DrawMode.PIXEL
        });
    }

    erasePixel(x, y) {
        let ctxID = this.state.ctxLrg.createImageData(10, 10);
        for (let i = 0; i < 400; i++) {
            ctxID.data[i] = 0;
        }
        this.state.ctxLrg.putImageData(ctxID, x * 10, y * 10);
        this.state.ctxSml.putImageData(ctxID, x, y, 0, 0, 1, 1);
    }

    drawPixel(x, y) {
        let ctxID = this.state.ctxLrg.createImageData(10, 10);
        for (let i = 0; i < 400; i+=4) {
            ctxID.data[i] = this.state.drawColor.r;
            ctxID.data[i+1] = this.state.drawColor.g;
            ctxID.data[i+2] = this.state.drawColor.b;
            ctxID.data[i+3] = this.state.drawColor.a * 255;
        }
        this.state.ctxLrg.putImageData(ctxID, x * 10, y * 10);
        this.state.ctxSml.putImageData(ctxID, x, y, 0, 0, 1, 1);
    }

    //Old "Fill" that filled the whole Property with one color. Still may be useful as a UI item if properly name
    drawClearToColor() {
        let editor = this.getEditorSize();
        let ctxID = this.state.ctxLrg.createImageData(editor.w, editor.h);
        for (let i = 0; i < editor.size; i+=4) {
            ctxID.data[i] = this.state.drawColor.r;
            ctxID.data[i+1] = this.state.drawColor.g;
            ctxID.data[i+2] = this.state.drawColor.b;
            ctxID.data[i+3] = this.state.drawColor.a * 255;
        }
        this.state.ctxLrg.putImageData(ctxID, 0, 0);
        this.state.ctxSml.putImageData(ctxID, 0, 0, 0, 0, editor.w / 10, editor.h / 10);
    }

    drawFill(x, y) {
        let colorToReplace = this.state.ctxSml.getImageData(x, y, 1, 1);
        let visitedPoints  = [];
        let pointsToCheck = [ {x, y} ];
        let smallCanvasWidth = this.state.ctxSml.canvas.width;
        let smallCanvasHeight = this.state.ctxSml.canvas.height;

        let ifReplaceColor = function(colorToCheck) {
            return colorToReplace.data[0] == colorToCheck.data[0] && colorToReplace.data[1] == colorToCheck.data[1] && colorToReplace.data[2] == colorToCheck.data[2];
        }

        let pointIsUnvisited = function(xToCheck, yToCheck) {
            for (let i = 0 ; i < visitedPoints.length; ++i)
                if (visitedPoints[i]["x"] === xToCheck && visitedPoints[i]["y"] === yToCheck)
                    return false;
            return true;
        }

        let tryAddPointToCheck = function(xToCheck, yToCheck) {
            if (xToCheck >= 0 && yToCheck >= 0 && xToCheck <= smallCanvasWidth - 1 && yToCheck <= smallCanvasHeight - 1 && pointIsUnvisited(xToCheck, yToCheck) ) {
                pointsToCheck.push( {x : xToCheck, y : yToCheck });
            }
        }

        let updateColor = function(xToChange, yToChange, state) {
            let ctxID = state.ctxLrg.createImageData(10, 10);
            for (let i = 0; i < 400; i+=4) {
                ctxID.data[i] = state.drawColor.r;
                ctxID.data[i+1] = state.drawColor.g;
                ctxID.data[i+2] = state.drawColor.b;
                ctxID.data[i+3] = state.drawColor.a * 255;
            }
            state.ctxLrg.putImageData(ctxID, xToChange * 10, yToChange * 10);
            state.ctxSml.putImageData(ctxID, xToChange, yToChange, 0, 0, 1, 1);
        }

        while(pointsToCheck.length != 0) {
            let pointToCheck = pointsToCheck.pop();
            let xToCheck = pointToCheck["x"];
            let yToCheck = pointToCheck["y"];
            let currentRGB = this.state.ctxSml.getImageData(xToCheck, yToCheck, 1, 1);

            if (pointIsUnvisited(xToCheck, yToCheck)) {
                visitedPoints.push(pointToCheck);
                if (ifReplaceColor(currentRGB)) {
                    tryAddPointToCheck(xToCheck - 1, yToCheck);
                    tryAddPointToCheck(xToCheck + 1, yToCheck);
                    tryAddPointToCheck(xToCheck, yToCheck - 1);
                    tryAddPointToCheck(xToCheck, yToCheck + 1);
                    updateColor(xToCheck, yToCheck, this.state);
                }
            }
        }
    }

    colorChange(color, event) {
        this.setState({drawColor: color.rgb});
    }

    changeTool(tool) {
        this.setState({drawMode: tool});
    }

    uploadImage(e) {
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        if (files.length < 1)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            let img = new Image();
            img.onload = () => {
                this.drawImages(img);
            }
            img.src = event.target.result;
        };
        reader.readAsDataURL(files[0]);
    }

    drawImages(img) {
        if (img == null) 
            return;

        let editor = this.getEditorSize();

        this.state.ctxLrg.drawImage(img, 0, 0, editor.w, editor.h);
        this.state.ctxSml.drawImage(img, 0, 0, editor.w / 10, editor.h / 10);
    }

    getEditorSize() {
        let ret = {
            rect: this.state.multiRect,
            w: 100,
            h: 100,
            s: this.w * this.h * 4,
        }
        if (this.state.multiRect) {
            ret.w = this.state.select.w * 100;
            ret.h = this.state.select.h * 100;
        }
        return ret;
    }

    setPixels() {
        let editor = this.getEditorSize();
        let pixelData = this.state.ctxSml.getImageData(0, 0, editor.w / 10, editor.h / 10).data;
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        if (this.state.multiRect) {
            let xx = 0;
            for (let x = this.state.select.x1; x <= this.state.select.x2; x++) {
                let yy = 0;
                for (let y = this.state.select.y1; y <= this.state.select.y2; y++) {
                    let pixelDataSection = this.getImageDataFromRect(pixelData, xx, yy, this.state.select.w, this.state.select.h);
                    ctr.setColors(x - 1, y - 1, pixelDataSection, this.state.ppt, (result) => {
                        if (result === 'pending')
                            ctr.sendResults(LISTENERS.PendingSetPixelUpdate, {x: x - 1, y: y - 1, pixelData: pixelDataSection});
                        if (this.state.pendingState !== Const.FORM_STATE.IDLE && result !== 'pending')
                            this.setState({pendingState: result ? Const.FORM_STATE.COMPLETE : Const.FORM_STATE.FAILED});
                    });
                    yy++;
                }
                xx++;
            }
        } else {
            ctr.setColors(this.state.x - 1, this.state.y - 1, pixelData, this.state.ppt, (result) => {
                if (result === 'pending')
                    ctr.sendResults(LISTENERS.PendingSetPixelUpdate, {x: this.state.x - 1, y: this.state.y - 1, pixelData});
                if (this.state.pendingState !== Const.FORM_STATE.IDLE && result !== 'pending')
                    this.setState({pendingState: result ? Const.FORM_STATE.COMPLETE : Const.FORM_STATE.FAILED});
            });
        }
    }

    getImageDataFromRect(data, xx, yy, w, h) {
        let pixelW = w * 10;
        let pixelH = h * 10;
        let pixelX = xx * 10;
        let pixelY = yy * 10;
        let retData = [];
        for (let y = 0; y < 10; y++) {
            retData = retData.concat(Array.from(data.slice(((pixelY + y) * pixelW * 4) + (pixelX * 4), ((pixelY + y) * pixelW * 4) + ((pixelX + 10) * 4))));
        }
        return retData;
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close("SET_IMAGE");
    }

    clearCanvas() {
        let editor = this.getEditorSize();

        let ctxID = this.state.ctxLrg.createImageData(editor.w, editor.h);
        for (let i = 0; i < editor.size; i++) {
            ctxID.data[i] = 0;
        }
        this.state.ctxLrg.putImageData(ctxID, 0, 0);
        this.state.ctxSml.putImageData(ctxID, 0, 0, 0, 0, editor.w / 10, editor.h / 10);
    }

    loadCanvas() {
        if (this.state.multiRect) {
            let select = this.state.select;
            this.setMultiCanvas(select.w, select.h, SDM.getPropertyRect(select.x1 - 1, select.y1 - 1, select.x2 - 1, select.y2 - 1), this.state.ctxSml, this.state.ctxLrg, this.state.canvasSml);
        } else {
            this.setCanvas(SDM.getPropertyImage(this.state.x - 1, this.state.y - 1), this.state.ctxSml, this.state.ctxLrg, this.state.canvasSml);
        }
    }

    componentDidUpdate(pP, pS) {
        if (this.state.isOpen && !pS.isOpen)
            this.componentDidMountOpen();
        else if (!this.state.isOpen && pS.isOpen)
            this.componentDidUnmountOpen();
    }

    render() {
        return (
            <Modal size='large'
                open={this.state.isOpen || this.props.tutorialState.index == 4} 
                closeIcon={this.props.tutorialState.index != 4}
                closeOnRootNodeClick={false}
                dimmer={this.props.tutorialState.index != 4}
                onClose={() => this.toggleModal(false)}
                className={TUTORIAL_STATE.getClassName(this.props.tutorialState.index, 4) + ' actions'}
            >
            <ModalHeader>Update Property Image</ModalHeader>
            <ModalContent>     
                {this.state.multiRect && 
                    <Message color='orange'>
                        Multi-Property uploading is currently experemental. Expect upload delays on larger uploads.
                    </Message>
                }
                <Grid>
                    <GridRow columns={2} stretched>
                        <GridColumn width={7}>
                            <Segment>
                                <Grid divided>
                                    <GridRow columns={2} stretched divided>
                                        <GridColumn width={12} stretched>
                                            <div className='largeCanvasContainer'>
                                                <canvas 
                                                    id='large' 
                                                    width={100} 
                                                    height={100} 
                                                    ref={(canvasLrg) => { this.canvasLrg = canvasLrg; }}
                                                ></canvas>
                                            </div>
                                        </GridColumn>
                                        <GridColumn width={4}>                           
                                            <canvas 
                                                id='normal' 
                                                width={10} 
                                                height={10} 
                                                ref={(canvasSml) => { this.canvasSml = canvasSml; }}
                                            ></canvas>
                                        </GridColumn>
                                    </GridRow>
                                    <GridRow columns={2}>
                                        <GridColumn width={9}>
                                            <ButtonGroup fluid>
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon 
                                                        active={this.state.drawMode === DrawMode.PIXEL ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.PIXEL)}
                                                    ><Icon name='pencil'/></Button>
                                                }
                                                content='Pencil Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon
                                                        active={this.state.drawMode === DrawMode.FILL ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.FILL)}
                                                    ><Icon name='maximize'/></Button>
                                                }
                                                content='Fill Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon name='eyedropper' 
                                                        active={this.state.drawMode === DrawMode.PICK ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.PICK)}
                                                    ><Icon name='eyedropper'/></Button>
                                                }
                                                content='Color Picker Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                <Popup 
                                                trigger={
                                                    <Button 
                                                        icon
                                                        active={this.state.drawMode === DrawMode.ERASE ? true : false}
                                                        onClick={() => this.changeTool(DrawMode.ERASE)}
                                                    ><Icon name='erase'/></Button>
                                                }
                                                content='Eraser Tool'
                                                position='bottom left'
                                                className='Popup'
                                                size='tiny'
                                                basic
                                                />
                                                </ButtonGroup>
                                            </GridColumn>
                                            <GridColumn width={7}>
                                                <ButtonGroup fluid>
                                                    <Popup 
                                                        trigger={
                                                            <Button icon
                                                                onClick={(e) => {this.clearCanvas()}}
                                                            ><Icon name='trash outline'/></Button>
                                                        }
                                                        content='Clear drawing canvas'
                                                        position='bottom left'
                                                        className='Popup'
                                                        size='tiny'
                                                        basic
                                                    />
                                                    <Popup 
                                                        trigger={
                                                            <Button icon
                                                                onClick={(e) => {this.loadCanvas()}}
                                                            ><Icon name='cloud upload'/></Button>
                                                        }
                                                        content='Load current image'
                                                        position='bottom left'
                                                        className='Popup'
                                                        size='tiny'
                                                        basic
                                                    />
                                                    <Popup 
                                                        trigger={
                                                            <Button icon
                                                                id='imageInputButton' 
                                                                onClick={(e) => {this.input.click()}}
                                                            ><Icon name='upload'/></Button>
                                                        }
                                                        content='Upload from file...'
                                                        position='bottom left'
                                                        className='Popup'
                                                        size='tiny'
                                                        basic
                                                    />
                                                </ButtonGroup>
                                            <input 
                                                id='imageInput' 
                                                type='file' 
                                                onChange={(e) => this.uploadImage(e)} 
                                                style={{display: 'none'}} 
                                                ref={(input) => { this.input = input; }}
                                            ></input>
                                        </GridColumn>
                                    </GridRow>
                                </Grid>
                                </Segment>
                            </GridColumn>
                            <GridColumn width={9}>
                                <Segment>
                                    <Grid divided>
                                        <GridRow>
                                            <GridColumn width={16} stretched>
                                                <Info messages={Strings.FORM_SET_IMAGE}/>
                                            </GridColumn>
                                        </GridRow>
                                        <GridRow columns={2}>
                                            <GridColumn width={7} stretched>
                                                <ChromePicker 
                                                    className='colorPicker' 
                                                    onChangeComplete={(color, event) => this.colorChange(color, event)}
                                                    color={this.state.drawColor}
                                                    disableAlpha={true}
                                                />
                                            </GridColumn>
                                            <GridColumn width={9} stretched>
                                                <GridRow>
                                                    <Input
                                                        placeholder="1 - 100"
                                                        type={this.state.multiRect ? 'text' : 'number'}
                                                        className='oneColumnFull'
                                                        fluid
                                                        disabled={this.state.multiRect}
                                                        label={<Popup
                                                            trigger={<Label className='uniform'>X</Label>}
                                                            content='X Position'
                                                            className='Popup'
                                                            size='tiny'
                                                        />}
                                                        value={this.state.multiRect ? this.state.select.x1 + ' - ' + this.state.select.x2 : this.state.x} 
                                                        onChange={(e) => this.setX(e.target.value)}
                                                    />
                                                </GridRow>
                                                <GridRow>
                                                    <Input
                                                        placeholder="1 - 100"
                                                        type={this.state.multiRect ? 'text' : 'number'}
                                                        label={<Popup
                                                            trigger={<Label className='uniform'>Y</Label>}
                                                            content='Y Position'
                                                            className='Popup'
                                                            size='tiny'
                                                        />}
                                                        className='oneColumnFull'
                                                        fluid
                                                        disabled={this.state.multiRect}
                                                        value={this.state.multiRect ? this.state.select.y1 + ' - ' + this.state.select.y2 : this.state.y} 
                                                        onChange={(e) => this.setY(e.target.value)}
                                                    />
                                                    </GridRow>
                                                <GridRow>
                                                    <PXLBalanceItem/>
                                                </GridRow>
                                                <GridRow>
                                                    <Input 
                                                        fluid
                                                        labelPosition='right' 
                                                        type={"number"}
                                                        placeholder={"Enter Optional PXL"}
                                                        value={this.state.ppt}
                                                    >
                                                        <Popup
                                                            trigger={<Label><Icon className='uniform' name='money'/></Label>}
                                                            content='PXL to Spend'
                                                            className='Popup'
                                                            size='tiny'
                                                        />
                                                        <input 
                                                        className='bid'
                                                        onChange={(e) => this.handlePrice('ppt', e.target.value)}
                                                        />
                                                        <Label>PXL</Label>
                                                    </Input>
                                                </GridRow>
                                                <GridRow>
                                                    {' = ' + Func.NumberWithCommas(this.state.maxPayout) + 'PXL earned maximum per Property'}
                                                </GridRow>
                                                <GridRow>
                                                    {'+25 PXL for initial Property upload'}
                                                </GridRow>
                                            </GridColumn>
                                        </GridRow>
                                    </Grid>
                                </Segment>
                            </GridColumn>
                        </GridRow>
                    </Grid>
                </ModalContent>
                {this.props.tutorialState.index != 4 && 
                <ModalActions>
                    <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                    <Button primary onClick={() => this.setPixels()}>Change Image</Button>
                </ModalActions>}
            </Modal>
        );
    }
}

export default SetPixelColorForm