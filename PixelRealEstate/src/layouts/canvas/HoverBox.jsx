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
import {Popup, Icon} from 'semantic-ui-react';

class HoverLabel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            hoverX: -1,
            hoverY: -1,
            canvasWidth: 0,
            canvasHeight: 0,
            offsetX: 0,
            offsetY: 0,
        }
    }

    componentDidMount() {
        GFD.listen('hoverX', 'hoverBox', (hoverX) => {
            this.setState({
                hoverX: hoverX,
            });
            this.updateLabel(hoverX, GFD.getData('hoverY'));
        })
        GFD.listen('hoverY', 'hoverBox', (hoverY) => {
            this.setState({
                hoverY: hoverY,
            });
            this.updateLabel(GFD.getData('hoverX'), hoverY);
        })
        GFD.listen('canvasTopOffset', 'hoverBox', (top) => {
            this.setState({
                offsetY: top
            });
        })
        GFD.listen('canvasLeftOffset', 'hoverBox', (left) => {
            this.setState({
                offsetX: left
            });
        })
        GFD.listen('canvasWidth', 'hoverBox', (width) => {
            this.setState({
                canvasWidth: width
            });
        })
        GFD.listen('canvasHeight', 'hoverBox', (height) => {
            this.setState({
                canvasHeight: height
            });
        })
    }

    updateLabel(x, y) {
        //get hover text by property x,y here. also make sure to check its not te same property its requesting on a 1 pixel mouse move or something
        if (x < 0 || y < 0) {
            this.setState({show: false})
        } else {
            this.setState({show: true});
        }
    }

    render() {
        return (
            <div>
                <div 
                    className={'hoverBox ' + (this.state.show ? '' : 'hidden')}
                    style={{
                        left: (this.state.offsetY + Math.floor(this.state.hoverX * (this.state.canvasWidth / 100)) - 3) + 'px',
                        top: (this.state.offsetY + Math.floor(this.state.hoverY * (this.state.canvasHeight / 100)) - 1) + 'px',
                        minWidth: (this.state.canvasWidth / 100) + 1.9 + 'px',
                        minHeight: (this.state.canvasWidth / 100) + 1.9 + 'px'
                    }}
                    >
                </div>
            </div>
        );
    }
}

export default HoverLabel