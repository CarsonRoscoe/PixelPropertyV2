import React, { Component } from 'react';
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Timestamp from 'react-timestamp';
import {GFD, GlobalState, TUTORIAL_STATE} from '../../functions/GlobalState';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';
import Hours from '../ui/Hours';
import Moment from 'react-moment';
import { Message, Label, Input, Item, Button, Popup, Icon, Grid, Segment, SegmentGroup, Divider } from 'semantic-ui-react';
import BuyPixelForm from '../forms/BuyPixelForm';
import SellPixelForm from '../forms/SellPixelForm';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import TransferPropertyForm from '../forms/TransferPropertyForm';
import CancelSaleForm from '../forms/CancelSaleForm';
import MakePrivateForm from '../forms/MakePrivateForm';
import MakePublicForm from '../forms/MakePublicForm';
import PlaceBidForm from '../forms/PlaceBidForm';
import MessageModal from './MessageModal';
import Info from './Info';
import ErrorBox from '../ErrorBox';

const NOBODY = '0x0000000000000000000000000000000000000000';

class PixelDescriptionBoxSimple extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenEarnedInterval: null,
            x: '', 
            y: '',
            select: {x1: -1, y1: -1, x2: -1, y2: -1},
            multiRect: false,
            ctx: null,
            dataCtx: null,
            owner: "",
            isForSale: false,
            ETHPrice: 0,
            PPCPrice: 0,
            lastUpdate: 0,
            reserved: 0,
            latestBid: 0,
            isInPrivate: false,
            maxEarnings: 0,
            earnings: 0,
            hoverText: '',
            link: '',
            PPCOwned: 0,
            tutorialState: 0,
            isOpen: {
                BUY: false,
                SELL: false,
                SET_IMAGE: false,
                SET_CANCEL: false,
                SET_PUBLIC: false,
                SET_PRIVATE: false,
                TRANSFER: false,
                PLACCE_BID: false,
            },
            showMessage: false,
            evH1: null, 
            evH2: null, 
            evH3: null,
        }
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
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

    componentDidMount() {
        let ctx = this.canvas.getContext('2d', {alpha: false});
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        let dataCtx = this.dataCanvas.getContext('2d', {alpha: false});
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        this.setState({
            ctx, 
            dataCtx,
        });

        GFD.listen('x', 'pixelBrowse', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'pixelBrowse', (y) => {
            this.loadProperty(GFD.getData('x') - 1, y - 1);
            this.setState({y});
        })

        GFD.listen('select', 'pixelBrowse', (select) => {
            let multiRect = select.x2 != -1 && select.y2 != -1 && (select.x1 != select.x2 || select.y1 != select.y2);
            this.setState({
                select, multiRect,
            });
            if (multiRect)
                this.loadMultiProperty(select.x1, select.y1, select.x2, select.y2);
        })

        this.setState({timerUpdater: setInterval(() => this.timerUpdate(), 60000)});
    }

    timerUpdate(lastUpdate = this.state.lastUpdate, reserved = this.state.reserved) {
        let lastUpdateFormatted = Func.TimeSince(lastUpdate * 1000) + " ago";
        let reservedFormatted = Func.TimeSince(reserved * 1000, true);
        this.setState({
            lastUpdateFormatted,
            reservedFormatted,
        })
    }

    componentWillUnmount() {
        GFD.closeAll('pixelBrowse');
        ctr.stopListeningForResults(LISTENERS.ServerDataManagerInit, 'PixelBox');
        this.stopTokenEarnedInterval();
        if (this.state.evH1 != null)
            this.state.evH1.stopWatching();
        if (this.state.evH2 != null)
            this.state.evH2.stopWatching();
        if (this.state.evH3 != null)
            this.state.evH3.stopWatching();
        clearTimeout(this.state.timerUpdater);
    }

    setCanvas(rgbArr) {
        this.state.ctx.canvas.width = 100;
        this.state.ctx.canvas.height = 100;
        this.state.dataCtx.canvas.width = 10;
        this.state.dataCtx.canvas.height = 10;
        this.state.ctx.imageSmoothingEnabled = false;
        this.state.ctx.webkitImageSmoothingEnabled = false;
        this.state.dataCtx.imageSmoothingEnabled = false;
        this.state.dataCtx.webkitImageSmoothingEnabled = false;
        this.state.ctx.scale(10, 10);
        let ctxID = this.state.dataCtx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.state.ctx.drawImage(this.dataCanvas, 0, 0);
    }

    loadMultiProperty(x1, y1, x2, y2) {
        let w = Math.abs(x1 - x2) + 1;
        let h = Math.abs(y1 - y2) + 1;
        this.state.ctx.canvas.width = w * 20;
        this.state.ctx.canvas.height = h * 20;
        this.state.dataCtx.canvas.width = w * 10;
        this.state.dataCtx.canvas.height = h * 10;
        this.state.ctx.imageSmoothingEnabled = false;
        this.state.ctx.webkitImageSmoothingEnabled = false;
        this.state.dataCtx.imageSmoothingEnabled = false;
        this.state.dataCtx.webkitImageSmoothingEnabled = false;
        this.state.ctx.scale(2, 2);
        let ctxID = this.state.dataCtx.createImageData(w * 10, h * 10);

        let rgbArr = SDM.getPropertyRect(x1 - 1, y1 - 1, x2 - 1, y2 - 1);

        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.state.ctx.drawImage(this.dataCanvas, 0, 0);
    }

    loadProperty(x, y, canvasData = null) {
        if (x === '' || y === '')
            return;
        let propData = SDM.getPropertyData(x, y);
        let lastUpdate = propData.lastUpdate;
        let isInPrivate = propData.isInPrivate;
        let reserved = lastUpdate + ((propData.reserved - lastUpdate) * 10);
        this.setState({
            lastUpdate,
            isInPrivate,
            reserved,
        });
        this.timerUpdate(lastUpdate, reserved);
        
        //     ctr.getHoverText(data[0], (data) => {
        //         this.setState({hoverText: (data != null && data.length > 0 ? data : null)});
        //     });
        //     ctr.getLink(data[0], (data) => {
        //             this.setState({link: (data != null && data.length > 0 ? data : null)});
        //     });
        //     ctr.getBalance((balance) => {
        //         this.setState({PPCOwned: balance});
        //     });
        //     this.timerUpdate(lastUpdate, reserved);
        // });
        this.setCanvas(SDM.getPropertyImage(x, y));
        
        this.stopTokenEarnedInterval();
        this.startTokenEarnedInterval();
    }

    startTokenEarnedInterval() {
        this.setState({
            tokenEarnedInterval: setInterval(() => {
                let newEarned = Func.calculateEarnings(this.state.lastUpdate, this.state.maxEarnings);
                if (this.state.earnings != newEarned)
                    this.setState({earnings: newEarned});
            }, 60000)
        })
    }

    stopTokenEarnedInterval() {
        clearInterval(this.state.tokenEarnedInterval);
    }

    toggleAction(key) {
        if (this.state.tutorialState.index == 3 && key === 'SET_IMAGE') {
            GFD.setData('tutorialStateIndex', 1);
            return;
        }
        let opens = this.state.isOpen;
        opens[key] = !opens[key];
        this.setState({opens});
    }

    getActionsList() {
        let actions = [];
        if (!this.state.isInPrivate || this.state.multiRect) {
            actions.push(
                <Button fluid onClick={() => this.toggleAction('SET_IMAGE')}>Update Image</Button>
            );
        }
        return actions;
    }

    visitLink() {
        let win = window.open(this.state.link, '_blank');
        win.focus();
    }

    render() {
        return (
            <div className='pixelDescriptionBox'>
                {this.state.x === '' && this.state.y === '' &&
                    <Message>Click on the canvas to draw!</Message>
                }
                <div
                    className={(this.state.x === '' && this.state.y === '' && !this.state.multiRect ? 'colorPreview hideElement' : 'colorPreview')}
                >
                    <Item className='colorPreivewCanvasContainer'>
                        <canvas id='colorPreviewCanvas' width={100} height={100} ref={(canvas) => { this.canvas = canvas; }} ></canvas>
                    </Item>
                    <canvas className='hidden' width={10} height={10} ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} ></canvas>
                </div>
                <Divider/>
                <div className='twoColumn w50 left'>
                    <Input
                        placeholder="1 - 100"
                        type={this.state.multiRect ? 'text' : 'number'}
                        className='oneColumnFull'
                        fluid
                        label={<Popup
                            trigger={<Label className='uniform'>X</Label>}
                            content='X Position'
                            className='Popup'
                            size='tiny'
                        />}
                        value={this.state.multiRect ? this.state.select.x1 + ' - ' + this.state.select.x2 : this.state.x} 
                        onChange={(e) => this.setX(e.target.value)}
                    />
                </div>
                <div className='twoColumn w50 right'>
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
                        value={this.state.multiRect ? this.state.select.y1 + ' - ' + this.state.select.y2 : this.state.y} 
                        onChange={(e) => this.setY(e.target.value)}
                    />
                </div>
                {!this.state.multiRect && this.state.x != '' && this.state.y != '' &&
                    <div>
                        <div>
                            <Divider/>
                            {this.state.lastUpdate != 0 &&
                            <Input
                                fluid disabled
                                label={<Popup
                                    trigger={<Label><Icon className='uniform' name='time'/></Label>}
                                    content='Last Update'
                                    className='Popup'
                                    size='tiny'
                                />}
                                className='oneColumn'
                                value={this.state.lastUpdate == 0 ? 'Never' : this.state.lastUpdateFormatted}
                            />}
                            {(this.state.isInPrivate || (this.state.reserved != 0 && this.state.reserved * 1000 > new Date().getTime())) &&
                            <Input
                                label="Reserved"
                                fluid disabled
                                className='oneColumn'
                                label={<Popup
                                    trigger={<Label><Icon className='uniform' name='ban'/></Label>}
                                    content='Is Reserved'
                                    className='Popup'
                                    size='tiny'
                                />}
                                value={this.state.reservedFormatted}
                            />}
                            {this.state.isInPrivate &&
                            <Input
                                label="Private"
                                fluid disabled
                                className='oneColumn'
                                label={<Popup
                                    trigger={<Label><Icon className='uniform' name='hide'/></Label>}
                                    content='Is Private'
                                    className='Popup'
                                    size='tiny'
                                />}
                                value={this.state.isInPrivate ? 'Yes' : 'No'}
                            />}
                            {this.state.owner !== NOBODY && this.state.hoverText !== null &&
                            <Input
                                label={<Popup
                                    trigger={<Label><Icon className='uniform' name='comment'/></Label>}
                                    content='Comment'
                                    className='Popup'
                                    size='tiny'
                                />}
                                fluid disabled
                                className='oneColumn'
                                value={this.state.hoverText != '' ? this.state.hoverText : "None Set"}
                            />}
                            {this.state.owner !== NOBODY && this.state.link !== null &&
                            <Input
                                className='oneColumn combined'
                                fluid disabled
                                action={(this.state.link != '' ? 
                                    <Popup
                                        trigger={<Button onClick={() => this.visitLink()}><Icon className='uniform' name='linkify'/>Visit</Button>}
                                        content='Link'
                                        className='Popup'
                                        size='tiny'
                                    /> : null
                                )}
                                label={(this.state.link == '' ? 
                                    <Popup
                                        trigger={<Label><Icon className='uniform' name='linkify'/></Label>}
                                        content='Link'
                                        className='Popup'
                                        size='tiny'
                                    /> : null
                                )}
                                actionPosition='left'
                                value={this.state.link != '' ? this.state.link : "None Set"}
                            />}
                        </div>
                    </div>
                }
                {((this.state.x != '' && this.state.y != '') || this.state.multiRect) && !this.state.noAccount && 
                    <div className={(this.state.tutorialState.index == 3 ? TUTORIAL_STATE.getClassName(this.state.tutorialState.index, 3) + ' actions' : '')}>
                        <Divider/>
                        <Grid columns={1} divided>
                            {this.getActionsList().map((action, i) => (
                                <Grid.Column key={i}>
                                    {action}
                                </Grid.Column>
                            ))}
                        </Grid>
                    </div>
                } 
                {this.state.noAccount && 
                <div>
                    <Divider/>
                    <ErrorBox/>
                </div>}

                <SetPixelColorForm tutorialState={this.state.tutorialState} isOpen={this.state.isOpen.SET_IMAGE} close={this.toggleAction.bind(this)}/>
            </div>
        );
    }
}

export default PixelDescriptionBoxSimple
