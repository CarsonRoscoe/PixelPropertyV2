import React, { Component } from 'react'
import {Contract, ctr} from '../../contract/contract.jsx';
import * as Const from '../../const/const';
import * as Func from '../../functions/functions.jsx';
import * as Strings from '../../const/strings';
import Info from '../ui/Info';
import {Modal, ModalActions, ModalHeader, ModalContent, Input, Button, Divider, Message, Label} from 'semantic-ui-react';

class SetLink extends Component {
    constructor(props) {
        super(props);
        this.state = {
            linkText: '',
            pendingState: Const.FORM_STATE.IDLE,
        };
    }

    componentDidMount() {
        this.setState({pendingState: Const.FORM_STATE.IDLE});
        ctr.getAccount((acc) => {
            ctr.getLink(acc.address, (data) => {
                this.setState({linkText: data});
            });
        });
    }

    setLink() {
        this.setState({pendingState: Const.FORM_STATE.PENDING});
        ctr.setHoverText(this.state.linkText, (result) => {
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
                trigger={<Button fluid>Set Link</Button>}
            >
                <ModalHeader>Set Property Links</ModalHeader>
                <ModalContent>
                <Info messages={Strings.FORM_SET_LINK}/>
                <Divider/>
                    <Input 
                        fluid
                        label='http://' 
                        placeholder='website.com'
                        maxLength={64} 
                        onChange={(e) => this.handleInput('linkText', e.target.value)} 
                        value={this.state.linkText}
                    />
                </ModalContent>
                <ModalActions>
                    <Label className={this.state.pendingState.name} color={this.state.pendingState.color}>{this.state.pendingState.message}</Label>
                    <Button primary onClick={() => ctr.setLink('http://' + this.state.linkText.replace(/(^\w+:|^)\/\//, ''))}>Set Link</Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default SetLink