import React, { Component } from 'react';
import {Contract, ctr, EVENTS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import Timestamp from 'react-timestamp';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Hours from '../ui/Hours';
import Moment from 'react-moment';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';

class PropertyBids extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '', 
            y: '',
            ctx: null,
            dataCtx: null,
            bids: null,
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
        ctx.scale(10, 10);
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        let dataCtx = this.dataCanvas.getContext('2d', {alpha: false});
        dataCtx.imageSmoothingEnabled = false;
        dataCtx.webkitImageSmoothingEnabled = false;
        this.setState({
            ctx, 
            dataCtx,
        });

        GFD.listen('x', 'propertyBids', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'propertyBids', (y) => {
            this.loadBids(GFD.getData('x') - 1, y - 1);
            this.loadProperty(GFD.getData('x') - 1, y - 1);
            this.setState({y});
        })

        ctr.listenForEvent(EVENTS.PropertyColorUpdate, 'propertyBids', (data) => {
            let xy = {x: 0, y: 0, colors: []};
            if (data.args.x == null || data.args.y == null)
                xy = ctr.fromID(Func.BigNumberToNumber(data.args.property));
            else {
                xy.x = data.args.x;
                xy.y = data.args.y;
            }

            if (xy.x !== this.state.x - 1 || xy.y !== this.state.y - 1)
                return;

            if (data.args.colorsRGB == null)
                xy.colors = Func.ContractDataToRGBAArray(data.args.colors);
            else
                xy.colors = data.args.colorsRGB;

            this.loadProperty(xy.x, xy.y, xy.colors);
        });
    }

    componentWillUnmount() {
        GFD.closeAll('propertyBids');
        ctr.stopListeningForEvent(EVENTS.PropertyColorUpdate, 'propertyBids');
    }

    setCanvas(rgbArr) {
        let ctxID = this.state.dataCtx.createImageData(10, 10);
        for (let i = 0; i < rgbArr.length; i++) {
            ctxID.data[i] = rgbArr[i];
        }
        this.state.dataCtx.putImageData(ctxID, 0, 0);
        this.state.ctx.drawImage(this.dataCanvas, 0, 0);
        this.forceUpdate();
    }

    loadProperty(x, y, data = null) {
        if (!this.validBounds(x, y))
            return;
        if (data === null) {
            ctr.getPropertyColors(x, y, (x, y, data) => {
                this.setCanvas(data);
            });
        } else {
            this.setCanvas(data);
        }
    }

    placeBid() {
        ctr.getBalance((balance) => {
            if (balance < 1) {
                alert("You must have at least 1 PXL to place a bid.");
                return;
            }
            let bid = parseInt(window.prompt("Please enter an amount of PXL from 1 to " + (balance - 1) + ". Bids cost 1 PXL each."));
            if (bid < 1 || bid >= balance) {
                alert("Incorrect bid amount.");
                return;
            }
            ctr.makeBid(this.state.x - 1, this.state.y - 1, bid);
        });
    }

    loadBids(x, y) {
        if (!this.validBounds(x, y)) {
            this.setState({bids: null});
            return;
        }

        if (SDM.bids[x] != null && SDM.bids[x][y] != null) {
            this.setState({bids: SDM.bids[x][y]});
        } else {
            this.setState({bids: null});
        }
    }

    validBounds(x = this.state.x, y = this.state.y) {
        return x !== '' && y !== '' && x >= 0 && x <= 99 && y >= 0 && y <= 99;
    }

    render() {
        return (
            <div>
                <div className='colorPreview'>
                    <canvas id='colorPreviewCanvas' width={100} height={100} ref={(canvas) => { this.canvas = canvas; }} ></canvas>
                    <canvas className='hidden' width={10} height={10} ref={(dataCanvas) => { this.dataCanvas = dataCanvas; }} ></canvas>
                </div>
                <table cellSpacing={0} cellPadding={0} className='data'>
                    <tbody>
                        <tr>
                            <th>X</th>
                            <td><input 
                                    type='number' 
                                    placeholder='1-100'
                                    value={this.state.x} 
                                    onChange={(e) => this.setX(e.target.value)}
                                ></input></td>
                        </tr>
                        <tr>
                            <th>Y</th>
                            <td><input 
                                    type='number' 
                                    placeholder='1-100'
                                    value={this.state.y} 
                                    onChange={(e) => this.setY(e.target.value)}
                                ></input></td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <input 
                                    type='button' 
                                    onClick={() => this.placeBid()} 
                                    value='Place Bid (reword)'
                                ></input>
                            </td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Bids</th>
                        </tr>
                        {this.state.bids != null ?
                            <tr>
                                <th colSpan={2}>
                                    <table className='bidsTable'>
                                        <tbody>
                                            {Object.keys(this.state.bids).reverse().map((key) => (
                                                <tr key={key}>
                                                    <td>
                                                        <Timestamp time={key} precision={2} />
                                                    </td>
                                                    <td>
                                                        {this.state.bids[key]}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </th>
                            </tr>
                        : null}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PropertyBids