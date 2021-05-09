import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import { Form, Button, Message, Modal, Grid, Image, MenuItem, ModalContent, Statistic, Icon, Label, Input, FormInput, GridRow, GridColumn, ModalHeader, Divider } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import * as EVENTS from '../../const/events';
import * as Const from '../../const/const';
import ErrorBox from '../ErrorBox';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';

const REFERRAL_BASE_URL = 'https://canvas.pixelproperty.io/?referral=';

class AdminPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            privateKey: '',
        };

        //referral link input ref
        this.referralInput = null;
    }

    updatePrivateKey(val) {
        this.setState({privateKey: val});
    }

    sendPrivateKey() {
        SDM.sendPrivateKey(this.state.privateKey, (result) => {
            if (result) {
                ctr.sendResults(LISTENERS.Alert, {result: true, message: "Proper private key. Server is setup."});
            } else {
                ctr.sendResults(LISTENERS.Alert, {result: true, message: "Inproper private key, please try again."});
            }
        });
        this.updatePrivateKey('');
    }

    render() {
        return ( 
            <Modal size='tiny' 
                closeIcon 
                trigger={
                    <MenuItem position='right' name='settings'>
                        <Icon name='settings'></Icon>
                    </MenuItem>
                }
            >
                <ModalContent>  
                    <ModalHeader>
                        Admin Panel
                    </ModalHeader>
                    <Divider/>
                    Send the private key to the server to relogin to the giveaway account. 
                    <FormInput
                        fluid
                        maxLength={500}
                        type='text'
                        value={this.state.privateKey}
                        onChange={(e) => this.updatePrivateKey(e.target.value)}
                        action={<Button onClick={() => this.sendPrivateKey()}>Send</Button>}
                    />
                    <Divider/>
                    Connect the VRE and PXL contracts together.
                    <Button onClick={() => {ctr.setupContracts()}}>Setup Contracts</Button>
                </ModalContent>
            </Modal>
        );
    }
}

export default AdminPanel;