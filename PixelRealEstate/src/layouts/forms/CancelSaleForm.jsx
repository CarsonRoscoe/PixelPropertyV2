import Info from '../ui/Info';
import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import * as Const from '../../const/const';
import {Divider, ModalDescription, Input, Popup, Label, Modal, ModalHeader, ModalContent, ModalActions, Button, FormInput, LabelDetail, Icon, Message} from 'semantic-ui-react';

class CancelSaleForm extends Component {
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
        GFD.listen('x', 'cancelSale', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'cancelSale', (y) => {
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
        GFD.closeAll('cancelSale');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close('CANCEL_SALE');
    }

    delistProperty() {
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        ctr.delistProperty(this.state.x - 1, this.state.y - 1, (result) => {
            if (this.state.pendingState !== Const.FORM_STATE.IDLE)
                this.setState({pendingState: result ? Const.FORM_STATE.COMPLETE : Const.FORM_STATE.FAILED});
        });
    }

    render() {
        return (
            <Modal size='tiny' 
                open={this.state.isOpen} 
                closeIcon 
                onClose={() => this.toggleModal(false)}
            >
            <ModalHeader>Delist Property</ModalHeader>
            <ModalContent>
                <Info messages={Strings.FORM_CANCEL_SELL}/>
                <Divider/>
                <p>Are you sure you want stop offering Property ({this.state.x}, {this.state.y}) for Sale?</p>
            </ModalContent>
            <ModalActions>
                <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                <Button onClick={() => this.toggleModal(false)}>Cancel</Button>
                <Button primary onClick={() => this.delistProperty()}>Delist Property</Button>
            </ModalActions>
        </Modal>
        );
    }
}

export default CancelSaleForm