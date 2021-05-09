import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import * as Const from '../../const/const';
import Info from '../ui/Info';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import {Divider, ModalDescription, Input, Popup, Label, Modal, ModalHeader, ModalContent, ModalActions, Button, FormInput, LabelDetail, Icon, Message} from 'semantic-ui-react';
import PXLBalanceItem from '../ui/PXLBalanceItem';

class PlaceBidForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            valueBid: 0,
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
        GFD.listen('x', 'placeBid', (x) => {
            this.setState({x});
        });
        GFD.listen('y', 'placeBid', (y) => {
            this.setState({y});
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

    handlePrice(value) {
        if (value < 0)
            value = 0;
        if (value >= GFD.getData('balance')) {
            value = GFD.getData('balance') - 1;
        }
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        this.setState({valueBid: value});
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close('PLACE_BID');
    }

    render() {
        return (
            <Modal size='mini' 
                open={this.state.isOpen} 
                closeIcon 
                onClose={() => this.toggleModal(false)}
            >
            <ModalHeader>Place Property Bid</ModalHeader>
            <ModalContent>
                <Info messages={Strings.FORM_BID}/>
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
                    <PXLBalanceItem/>
                    <Divider horizontal>PXL Bid</Divider>
                    <Input 
                    fluid
                    labelPosition='right' 
                    type={"number"}
                    placeholder={"Enter Bid"}
                    className='oneColumn'
                    value={this.state.valueBid}
                >
                    <Popup
                        trigger={<Label><Icon className='uniform' name='money'/></Label>}
                        content='PXL to Bid'
                        className='Popup'
                        size='tiny'
                    />
                    <input 
                    className='bid'
                    onChange={(e) => this.handlePrice(e.target.value)}
                    />
                    <Label>PXL</Label>
                </Input>
                    <FormInput
                        className='buySlider'
                        min={0}
                        max={GFD.getData('balance') - 1}
                        type='range'
                        step={1}
                        value={this.state.valueBid}
                        onChange={(e) => this.handlePrice(e.target.value)}
                    />
                   
            </ModalContent>
            <ModalActions>
                <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                <Button primary onClick={() => ctr.makeBid(this.state.x - 1, this.state.y - 1, parseInt(this.state.valueBid))}>Place Bid</Button>
            </ModalActions>
        </Modal>
        );
    }
}

export default PlaceBidForm