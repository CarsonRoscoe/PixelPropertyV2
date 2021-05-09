import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Const from '../../const/const';
import * as Func from '../../functions/functions.jsx';
import * as Strings from '../../const/strings';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Info from '../ui/Info';
import {Modal, ModalActions, ModalHeader, ModalContent, Input, Button, Divider, Message, Label, Grid, GridColumn} from 'semantic-ui-react';
import PXLBalanceItem from '../ui/PXLBalanceItem';

class SendPXL extends Component {
    constructor(props) {
        super(props);
        this.state = {
            PXLOwned: 0,
            PXL: '',
            address: '',
            pendingState: Const.FORM_STATE.IDLE,
        };
    }

    componentDidMount() {
        this.setState({pendingState: Const.FORM_STATE.IDLE});
        GFD.listen('balance', 'SendPXL', (PXLOwned) => {
            this.setState({PXLOwned});
        });
    }

    componentWillUnmount() {
        GFD.closeAll('SendPXL');
    }

    sendPXL() {
        if (this.state.PXL > this.state.PXLOwned)
            return;
        if (!ctr.isAddress(this.state.address))
            return;
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        ctr.sendPXL(this.state.PXL, this.state.address, (result) => {
            if (this.state.pendingState !== Const.FORM_STATE.IDLE)
                this.setState({pendingState: result ? Const.FORM_STATE.COMPLETE : Const.FORM_STATE.FAILED});
        });
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    render() {
        return (
            <Modal
                closeIcon
                size='tiny'
                trigger={
                    <Button 
                        className='buttonRefreshBalance' 
                    >Send</Button>
                }
            >
                <ModalHeader>Send PXL</ModalHeader>
                <ModalContent>
                <Info messages={Strings.FORM_TRANSFER}/>
                <Divider/>
                    <Grid columns={2}>
                        <GridColumn>
                            <PXLBalanceItem/>
                        </GridColumn>
                        <GridColumn>
                            <Input 
                                fluid
                                type='number'
                                label='PXL' 
                                placeholder='PXL to send'
                                onChange={(e) => this.handleInput('PXL', e.target.value)} 
                                value={this.state.PXL}
                            />
                        </GridColumn>
                    </Grid>
                <Divider/>
                    <Input 
                        fluid
                        type='text'
                        label='Receiver Address' 
                        placeholder='0xE67e1f24A637F84BE1E68D547022dE8883a0d89B'
                        onChange={(e) => this.handleInput('address', e.target.value)} 
                        value={this.state.address}
                    />
                    {( !ctr.isAddress(this.state.address)
                    || this.state.PXL > this.state.PXLOwned) && 
                    <Message error>
                        {!ctr.isAddress(this.state.address) && 'Please enter a valid Ethereum address.'}
                        {this.state.PXL > this.state.PXLOwned && <p><br/>You do not have enough PXL!</p>}
                    </Message>}
                </ModalContent>
                <ModalActions>
                    <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                    <Button 
                        primary 
                        onClick={() => this.sendPXL()}
                    >
                    Send PXL
                    </Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default SendPXL