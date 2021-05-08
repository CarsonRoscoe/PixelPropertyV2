import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import * as Const from '../../const/const';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import {Divider, ModalDescription, Input, Image, Popup, Grid, Label, Modal, ModalHeader, ModalContent, ModalActions, Button, FormInput, LabelDetail, Icon, Segment, Message, GridColumn, GridRow, ListItem } from 'semantic-ui-react';
import PXLBalanceItem from '../ui/PXLBalanceItem';
import * as EVENTS from '../../const/events';
var GIFEncoder = require('gifencoder');
const save = require('save-file')

class ViewTimelapse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startBlock: 5538829,
            endBlock: 5538830,
            blockFrom: 5538829, //ethereum block #
            blockTo: 0, //ethereum block #
            quality: 50, //how good quality you want the GIF. 50 is pretty good and faster.
            frameDelay: 25, //milliseconds
            x1: 1, //1 to 100 of start X size.
            x2: 100,
            y1: 1,
            y2: 100,
            gifLoading: 0, //0 to 1 of gifLoaded
            preLogsLength: 0, //how many logs are being loaded up until the GIF to show the background.
            logsLength: 0, //how many logs (frames) the GIF will have.
            GIF: null, //the gif
            gifCanvasCtx: null, //the ctx of the canvas used to make the gif
        };
        this.killGIFBuild = false;
        this.abort = false;
    }

    componentDidMount() {
        ctr.getCurrentBlock((error, block) => {
            this.setState({
                blockTo: block.number,
                blockFrom: block.number - 1000,
                endBlock: block.number,
            });
        });
    }

    stopBuildingGIF(force = false) {
        this.killGIFBuild = true;
        this.abort = force;
    }

    buildGIF() {
        let ctx = this.gifCanvas.getContext("2d");
        let x1 = this.state.x1;
        let y1 = this.state.y1;
        let x2 = this.state.x2;
        let y2 = this.state.y2;
        let w = Math.abs(this.state.x2 - this.state.x1) + 1;
        let h = Math.abs(this.state.y2 - this.state.y1) + 1;
        ctx.canvas.width = w * 10;
        ctx.canvas.height = h * 10;
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        this.killGIFBuild = false;
        this.abort = false;
        this.setState({ 
            gifCanvasCtx: ctx,
            GIF: null,
            gifLoading: 0,
            logsLength: 0,
            preLogsLength: 0,
         });

        let GIF = new GIFEncoder(w * 10, h * 10);
        GIF.setQuality(this.state.quality);
        GIF.setDelay(this.state.frameDelay);
        GIF.setRepeat(0);

        ctr.getEventLogs(EVENTS.PropertyColorUpdate, {}, (error, preLogs) => {
            
            let preLogsLength = Object.keys(preLogs).length;
            this.setState({preLogsLength})

            let i = 0;
            let loadPreFrame = (resolve, reject) => {
                if (this.killGIFBuild && this.abort) {
                    reject();
                    return;
                } else if (this.killGIFBuild) {
                    this.setState({ 
                        GIF: null,
                        gifLoading: 0,
                        logsLength: 0,
                        preLogsLength: 0,
                     });
                    reject();
                    return;
                }
                setTimeout(() => {
                    if (i >= preLogsLength)
                        return resolve({promise: null});
                    let id = ctr.fromID(Func.BigNumberToNumber(preLogs[i].args.property));
                    if (id.x < x1 || id.y < y1 || id.x > x2 - 1 || id.y > y2 - 1)
                        return resolve({promise: new Promise(loadPreFrame)});
                    this.addCanvasFrame(ctx, id.x - (x1 - 1), id.y - (y1 - 1), Func.ContractDataToRGBAArray(preLogs[i].args.colors));
                    return resolve({promise: new Promise(loadPreFrame)});
                }, 20);
            }
        
            let handlePreFrameResults = (results) => {
                if (this.killGIFBuild && this.abort) {
                    return;
                } else if (this.killGIFBuild) {
                    this.setState({ 
                        GIF: null,
                        gifLoading: 0,
                        logsLength: 0,
                        preLogsLength: 0,
                     });
                     return;
                }
                i++;
                this.setState({gifLoading: i / preLogsLength});
                if (results.promise != null)
                    results.promise.then(handlePreFrameResults);
                else {
                    
                    ctr.getEventLogs(EVENTS.PropertyColorUpdate, {}, (error, logs) => {
                        let logsLength = Object.keys(logs).length;
                        this.setState({logsLength})
                        GIF.start();
                        if (logsLength < 1) {
                            GIF.addFrame(ctx);
                            GIF.finish();
                            this.setState({GIF});
                            return;
                        }
        
                        let i = 0;
                        let loadFrame = (resolve, reject) => {
                            if (this.killGIFBuild && this.abort) {
                                reject();
                                return;
                            } else if (this.killGIFBuild) {
                                GIF.finish();
                                this.setState({GIF});
                                reject();
                                return;
                            }
                            setTimeout(() => {
                                if (i >= logsLength)
                                    return resolve({promise: null});
                                let id = ctr.fromID(Func.BigNumberToNumber(logs[i].args.property));
                                if (id.x < x1 || id.y < y1 || id.x > x2 - 1 || id.y > y2 - 1)
                                    return resolve({promise: new Promise(loadFrame)});
                                this.addCanvasFrame(ctx, id.x - (x1 - 1), id.y - (y1 - 1), Func.ContractDataToRGBAArray(logs[i].args.colors));
                                GIF.addFrame(ctx);
                                return resolve({promise: new Promise(loadFrame)});
                            }, 20);
                        }
                
                        let handleResults = (results) => {
                            if (this.killGIFBuild && this.abort) {
                                return;
                            } else if (this.killGIFBuild) {
                                GIF.finish();
                                this.setState({GIF});
                                return;
                            }

                            i++;
                            this.setState({gifLoading: i / logsLength});
                            if (results.promise != null)
                                results.promise.then(handleResults);
                            else {
                                GIF.finish();
                                this.setState({GIF});
                            }
                        };
                
                        new Promise(loadFrame).then(handleResults);
        
                    }, this.state.blockFrom, this.state.blockTo);

                }
            };
    
            new Promise(loadPreFrame).then(handlePreFrameResults);
        }, this.state.startBlock, this.state.blockFrom - 1);
    }

    addCanvasFrame(ctx, x, y, rgbArr) {
        let ctxID = ctx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        ctx.putImageData(ctxID, x * 10, y * 10);
    }

    downloadGIF() {
        if (this.state.GIF == null)
            return;
        save(this.state.GIF.out.getData(), 'timelapse.gif', (err, data) => {
            if (err) throw err;
        })
    }

    setSingleState(key, value, min = 0, max = 2147483647) {
        let update = this.state;
        update[key] = Math.min(Math.max(min, value), max);
        this.setState(update);
    }

    render() {
        const blocks = this.state.blockTo - this.state.blockFrom;
        const load = this.state.gifLoading;
        return (
            <Modal size='small' 
                closeIcon 
                onClose={() => this.stopBuildingGIF(true)}
                trigger={<Button fluid>Create Timelapse</Button>}
            >
            <ModalHeader>Create Timelapse</ModalHeader>
            <ModalContent>
                <canvas className='dataCanvas hidden'
                    width={1000}
                    height={1000}
                    ref={(gifCanvas) => { this.gifCanvas = gifCanvas; }} 
                ></canvas>
                <Grid>
                    <GridRow>
                        <GridColumn width={8}>
                            <Grid stretched>
                                <GridRow>
                                    <GridColumn width={16}>
                                        <Message
                                            success={load >= 1 && this.state.GIF != null}
                                        >
                                            {load <= 0 && 'Click "Build GIF" to create a timelapse.'}
                                            {load > 0 && load < 1 && this.state.logsLength < 1 && 'History is loading... (' + Math.round(load * 100) + '%)'}
                                            {load >= 1 && this.state.GIF == null && 'History Loaded! Loading animation frames.'}
                                            {load > 0 && load < 1 && this.state.logsLength > 0 && 'GIF is building... (' + Math.round(load * 100) + '%)'}
                                            {load >= 1 && this.state.GIF != null && 'GIF Complete! Click download GIF to view. Animation Frames: ' + this.state.logsLength}
                                        </Message>
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={16}>
                                        <Input
                                            placeholder='Block From'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>From</Label>}
                                                content='Block # to start from'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.blockFrom === 0 ? '' : this.state.blockFrom} 
                                            onChange={(e) => this.setSingleState('blockFrom', e.target.value)}
                                        />
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={16}>
                                        <Input
                                            placeholder='Block To'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>To</Label>}
                                                content='Block # to end at'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.blockTo === 0 ? '' : this.state.blockTo} 
                                            onChange={(e) => this.setSingleState('blockTo', e.target.value)}
                                        />
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={16}>
                                        = {blocks} blocks ({Func.TimeSince(new Date().getTime() - (blocks * 14000))}).
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={6}>
                                        <ListItem>
                                            Quality: {this.state.quality}
                                        </ListItem>
                                    </GridColumn>
                                    <GridColumn width={10}>
                                        <Input
                                            min={10}
                                            max={100}
                                            step={1}
                                            type="range"
                                            fluid
                                            value={this.state.quality} 
                                            onChange={(e) => this.setSingleState('quality', e.target.value)}
                                        />
                                    </GridColumn>
                                </GridRow>
                            </Grid>                        
                        </GridColumn>
                        <GridColumn className='gif' width={8}>
                            <Grid stretched>
                                <GridRow>
                                    <GridColumn width={16}>
                                        <Input
                                            placeholder='Frame Delay (ms)'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>Frame Delay</Label>}
                                                content='Milliseconds between each frame'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.frameDelay === 0 ? '' : this.state.frameDelay} 
                                            onChange={(e) => this.setSingleState('frameDelay', e.target.value, 0, 60000)}
                                        />
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={8}>
                                        <Input
                                            placeholder='X1'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>X1</Label>}
                                                content='Left crop side'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.x1 === 0 ? '' : this.state.x1} 
                                            onChange={(e) => this.setSingleState('x1', e.target.value)}
                                        />
                                    </GridColumn>
                                    <GridColumn width={8}>
                                        <Input
                                            placeholder='Y1'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>Y1</Label>}
                                                content='Top crop side'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.y1 === 0 ? '' : this.state.y1} 
                                            onChange={(e) => this.setSingleState('y1', e.target.value)}
                                        />
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={8}>
                                        <Input
                                            placeholder='X2'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>X2</Label>}
                                                content='Right crop side'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.x2 === 0 ? '' : this.state.x2} 
                                            onChange={(e) => this.setSingleState('x2', e.target.value)}
                                        />
                                    </GridColumn>
                                    <GridColumn width={8}>
                                        <Input
                                            placeholder='Y2'
                                            type="number"
                                            label={<Popup
                                                trigger={<Label>Y2</Label>}
                                                content='Bottom crop side'
                                                className='Popup'
                                                size='tiny'
                                            />}
                                            fluid
                                            value={this.state.y2 === 0 ? '' : this.state.y2} 
                                            onChange={(e) => this.setSingleState('y2', e.target.value)}
                                        />
                                    </GridColumn>
                                </GridRow>
                                <GridRow>
                                    <GridColumn width={8}>
                                    {(load <= 0 || this.state.GIF != null) ?
                                        <Button 
                                            onClick={() => this.buildGIF()}
                                        >Build GIF</Button>
                                    :
                                    <Button icon
                                        labelPosition='left'
                                        negative
                                        onClick={() => this.stopBuildingGIF(false)}
                                    >
                                        <Icon name='stop'/>
                                        STOP
                                    </Button>
                                    }
                                    </GridColumn>
                                    <GridColumn width={8}>
                                        <Button 
                                            positive={this.state.GIF != null}
                                            disabled={this.state.GIF == null}
                                            onClick={() => this.downloadGIF()}
                                        >Download GIF</Button>
                                    </GridColumn>
                                </GridRow>
                            </Grid>
                        </GridColumn>
                    </GridRow>
                </Grid>
            </ModalContent>
        </Modal>
        );
    }
}

export default ViewTimelapse