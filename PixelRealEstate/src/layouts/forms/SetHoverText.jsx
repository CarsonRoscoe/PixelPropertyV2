import * as Const from '../../const/const';
import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions.jsx';
import * as web3 from 'web3';
import * as Strings from '../../const/strings';
import Info from '../ui/Info';
import {Modal, ModalActions, ModalHeader, ModalContent, Input, Button, Popup, Label, Icon, Message, Divider} from 'semantic-ui-react';

class SetHoverText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverText: '',
            pendingState: Const.FORM_STATE.IDLE,
        };
    }

    componentDidMount() {
        this.setState({pendingState: Const.FORM_STATE.IDLE});
        ctr.getAccount((acc) => {
            ctr.getHoverText(acc.address, (data) => {
                this.setState({hoverText: data});
            });
        });
    }

    setHoverText() {
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        ctr.setHoverText(this.state.hoverText, (result) => {
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
                trigger={<Button fluid>Set Hover Text</Button>}
            >
                <ModalHeader>Set Property Hover Texts</ModalHeader>
                <ModalContent>
                <Info messages={Strings.FORM_SET_TEXT}/>
                <Divider/>
                    <Input 
                        fluid
                        label={<Popup
                            trigger={<Label><Icon className='uniform' name='comment'/></Label>}
                            content='Hover Text'
                            className='Popup'
                            size='tiny'
                        />}
                        placeholder='Max 64 Characters'
                        maxLength={64} 
                        onChange={(e) => this.handleInput('hoverText', e.target.value)} 
                        value={this.state.hoverText}
                    />
                </ModalContent>
                <ModalActions>
                    <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                    <Button primary onClick={() => this.setHoverText()}>Set Hover Text</Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default SetHoverText