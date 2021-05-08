import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import Info from '../ui/Info';
import * as Const from '../../const/const';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import {Divider, ModalDescription, Input, Popup, Label, Modal, ModalHeader, ModalContent, ModalActions, Button, FormInput, LabelDetail, Icon, Message } from 'semantic-ui-react';

class SellPixelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            valuePrice: 0,
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

    componentDidMount() {
        GFD.listen('x', 'sellPixel', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'sellPixel', (y) => {
            this.setState({y});
        })
        ctr.getSystemSalePrices((data) => {
            if (data == null)
                return;
            let ppc = Func.BigNumberToNumber(data[1]);
            this.setState({
                valuePrice: ppc, 
            });
        });
    }

    componentWillUnmount() {
        GFD.closeAll('sellPixel');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handlePrice(key, value) {
        let obj = {};
        obj[key] = parseInt(value);
        this.setState(obj);
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close('SELL');
    }

    sellProperty() {
        if (this.state.x >= 1 && this.state.x <= 100 && this.state.y >= 1 && this.state.y <= 100) {
            this.setState({pendingState: Const.FORM_STATE.PENDING});
            ctr.sellProperty(this.state.x - 1, this.state.y - 1, this.state.valuePrice, (result) => {
                if (this.state.pendingState !== Const.FORM_STATE.IDLE)
                    this.setState({pendingState: result ? Const.FORM_STATE.COMPLETE : Const.FORM_STATE.FAILED});
            });
        }
    }

    render() {
        return (
            <Modal size='tiny' 
            open={this.state.isOpen} 
            closeIcon 
            onClose={() => this.toggleModal(false)}
            >
            <ModalHeader>Sell Property</ModalHeader>
            <ModalContent>
                <Info messages={Strings.FORM_SELL}/>
                <Divider/>
                <div className='twoColumn w50 left'>
                    <Input
                        placeholder="1 - 100"
                        type="number"
                        className='oneColumnFull'
                        fluid
                        label={<Popup
                            trigger={<Label className='uniform'>X</Label>}
                            content='X Position'
                            className='Popup'
                            size='tiny'
                        />}
                        value={this.state.x} 
                        onChange={(e) => this.setX(e.target.value)}
                    />
                    </div>
                    <div className='twoColumn w50 right'>
                    <Input
                        placeholder="1 - 100"
                        type="number"
                        label={<Popup
                            trigger={<Label className='uniform'>Y</Label>}
                            content='Y Position'
                            className='Popup'
                            size='tiny'
                        />}
                        className='oneColumnFull'
                        fluid
                        value={this.state.y} 
                        onChange={(e) => this.setY(e.target.value)}
                    />
                    </div>
                    <Divider horizontal>PXL Price</Divider>
                    <Input 
                        fluid
                        labelPosition='right' 
                        type={"number"}
                        placeholder={"Enter PXL"}
                        className='oneColumn'
                        value={this.state.valuePrice}
                    >
                        <Popup
                            trigger={<Label><Icon className='uniform' name='money'/></Label>}
                            content='Price in PXL'
                            className='Popup'
                            size='tiny'
                        />
                        <input 
                        className='bid'
                        onChange={(e) => this.handlePrice('valuePrice', e.target.value)}
                        />
                        <Label>PXL</Label>
                    </Input>
            </ModalContent>
            <ModalActions>
                <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                <Button primary onClick={() => this.sellProperty()}>Sell Property</Button>
            </ModalActions>
        </Modal>
        );
    }
}

export default SellPixelForm