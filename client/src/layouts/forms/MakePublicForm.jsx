import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Info from '../ui/Info';
import * as Const from '../../const/const';
import * as Strings from '../../const/strings';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import {Segment, ModalContent, Divider, Modal, Grid, Label, Input, Container, Icon, Button, Popup, ModalActions, ModalHeader, Message} from 'semantic-ui-react';
import PXLBalanceItem from '../ui/PXLBalanceItem';

const TOKENS_TO_MINUTES = 1;

class MakePublicForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            isPrivate: false,
            minutesPrivate: 0,
            tokenCost: 0,
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

    componentDidMountOpen() {
        this.setState({pendingState: Const.FORM_STATE.IDLE});
        GFD.listen('x', 'ChangePropertyMode', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'ChangePropertyMode', (y) => {
            this.setState({y});
            this.setState({
                isPrivate: SDM.getPropertyData(GFD.getData('x') - 1, y - 1).isPrivate,
                becomePublic: SDM.getPropertyData(GFD.getData('x') - 1, y - 1).becomePublic 
            });
            ctr.getPropertyData(GFD.getData('x') - 1, y - 1, (data) => {
                console.info(data);
                this.setState({
                    isPrivate: data[4],
                    becomePublic: data[5]
                });
            });
        })
    }

    componentDidUnmountOpen() {
        GFD.closeAll('ChangePropertyMode');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    setPropertyMode() {
        let x = GFD.getData('x') - 1;
        let y = GFD.getData('y') - 1;
        if (SDM.getPropertyData(x, y).becomePublic) {
            ctr.sendResults(LISTENERS.Alert, {result: false, message: "Property is temorarily reserved by a user."});
            return;
        }
        if (SDM.getPropertyData(x,y).becomePublic) {
            ctr.sendResults(LISTENERS.Alert, {result: false, message: "Property is already in private mode."});
            return;
        }
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        ctr.setPropertyMode(x, y, true, this.state.minutesPrivate, (result) => {
            if (this.state.pendingState !== Const.FORM_STATE.IDLE)
                this.setState({pendingState: result ? Const.FORM_STATE.COMPLETE : Const.FORM_STATE.FAILED});
        })
    }

    componentDidUpdate(pP, pS) {
        if (this.state.isOpen && !pS.isOpen)
            this.componentDidMountOpen();
        else if (!this.state.isOpen && pS.isOpen)
            this.componentDidUnmountOpen();
    }

    changeTokens(t) {
        this.setState({
            tokenCost: t,
            minutesPrivate: t * TOKENS_TO_MINUTES
        })
    }

    changeTime(t) {
        this.setState({
            tokenCost: t * (1 / TOKENS_TO_MINUTES),
            minutesPrivate: t
        })
    }

    toggleModal(set = null) {
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        this.props.close("SET_PUBLIC");
    }

    render() {
        return (
            <Modal size='small'
                open={this.state.isOpen} 
                closeIcon 
                onClose={() => this.toggleModal(false)}
            >
                <ModalHeader>Set Property Private</ModalHeader>
                <ModalContent>
                <Info messages={Strings.FORM_SET_PUBLIC}/>
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
                {this.state.isPrivate || this.state.becomePublic != 0 ?
                    <div>
                        <Divider/>
                        <Segment>            
                            <div>{this.state.isPrivate ? "This Property is already in private mode." : ""}</div>
                            <div>{this.state.becomePublic != 0 ? "This Property is temporarily reserved by a user." : ""}</div>
                        </Segment>
                    </div>
                    :
                    null
                }
            </ModalContent>
            <ModalActions>
                <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                <Button primary onClick={() => ctr.setPropertyMode()}>Set Private</Button>
            </ModalActions>
            </Modal>
        );
    }
}

export default MakePublicForm