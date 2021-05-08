import React, { Component } from 'react'
import BuyPixelForm from '../forms/BuyPixelForm.jsx';
import SetPixelColorForm from '../forms/SetPixelColorForm';
import SellPixelForm from '../forms/SellPixelForm';
import Pullout from '../ui/Pullout';
import PulloutTab from '../ui/PulloutTab';
import * as Assets from '../../const/assets.jsx';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as EVENTS from '../../const/events';
import {Contract, ctr} from '../../contract/contract';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import {LabelDetail, Label} from 'semantic-ui-react';
import * as Func from '../../functions/functions.jsx';

class HoverLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            labelContent: null,
            hoverX: -1,
            hoverY: -1,
            labelX: -1,
            labelY: -1,
            canvasWidth: 0,
            canvasHeight: 0,
            offsetX: 0,
            offsetY: 0,
        }
    }

    componentDidMount() {
        GFD.listen('hoverX', 'hoverLabel', (hoverX) => {
            this.updateLabel(hoverX, this.state.hoverY);
            
            this.setState({
                hoverX: hoverX,
                labelX: hoverX * this.state.canvasWidth / 100
            });
        })
        GFD.listen('hoverY', 'hoverLabel', (hoverY) => {
            this.updateLabel(this.state.hoverX, hoverY);
            
            this.setState({
                hoverY: hoverY,
                labelY: (hoverY * this.state.canvasHeight / 100) + 30
            });
        })
        GFD.listen('canvasWidth', 'hoverLabel', (width) => {
            this.setState({
                canvasWidth: width
            });
        })
        GFD.listen('canvasHeight', 'hoverLabel', (height) => {
            this.setState({
                canvasHeight: height
            });
        })
    }

    componentWillUnmount() {
        GFD.closeAll('hoverLabel');
    }

    updateLabel(x, y) {
        if (x < 0 || y < 0) {
            this.setState({show: false});
            this.forceUpdate();
        } else if (this.props.showPrices) {
            if (SDM.isPropertyLoaded(x, y)) {
                let data = SDM.forceUpdatePropertyData(x, y, (data) => {
                    if (data.isForSale) {
                        this.setState({show: true, labelContent: 
                            <div>
                                <Label>PXL<LabelDetail>{Func.NumberWithCommas(data.PPCPrice)}</LabelDetail></Label>
                                <Label>ETH<LabelDetail>{Func.WeiToEth(data.ETHPrice)}</LabelDetail></Label>
                            </div>
                        });
                    } else {
                        this.setState({show: false});
                    }
                });
            }
        } else if (SDM.isPropertyLoaded(x, y)) {
            ctr.getHoverText(SDM.getPropertyData(x, y).owner, (data) => {
                if (data != null && data.length > 0)
                    this.setState({show: true, labelContent: data});
                else
                    this.setState({show: false});
            })
        }
    }

    render() {
        return (
            <div 
                className={'hoverLabel ui bottom left popup transition visible compact mini ' + ((this.state.show && this.state.hoverX != -1 && this.state.hoverY != -1) ? '' : 'hidden')}
                style={{
                    left: this.state.labelX,
                    top: this.state.labelY,
                }}
                >
                <div className='content'>
                    {this.state.labelContent}
                </div>
            </div>
        );
    }
}

export default HoverLabel

