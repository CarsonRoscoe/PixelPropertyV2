import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import { Form, Button, Message, ModalActions, Modal, ModalContent, ModalHeader, Checkbox, Label } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import * as EVENTS from '../../const/events';
import * as Const from '../../const/const';
import ErrorBox from '../ErrorBox';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';

class SignUpForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ipAddress: null,
            referralAddress: '',
            wallet: '',
            email: '',
            username: '',
            agreeTos: false,
            errors: [],
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({referralAddress: newProps.referralAddress});
    }

    componentDidMount() {
        ctr.getAccount((acc) => {
            this.setState({wallet: acc.address});
        }); 
        ctr.listenForEvent(EVENTS.AccountChange, 'SignUpForm', (data) => {
            this.setState({wallet: data});
        });
    }

    updateEmail(value) {
        this.setState({email: value});
    }

    updateUsername(value) {
        this.setState({username: value});
    }

    signUp() {
        let errors = [];
        if (!this.state.agreeTos)
            errors.push('Please agree to the Terms of Service & Privacy Policy.');
        this.setState({errors});
        if (errors.length > 0)
            return;
        SDM.requestIPs((ips) => {
            FB.signUp(this.state.wallet, this.state.username, 
                this.state.email, Const.TOS_VERSION, 
                this.state.referralAddress, ips,
                (result, messages) => {
                    if (!result)
                        this.setState({errors: errors.concat(messages)});
                });
        });
    }

    render() {
        return ( 
            <Modal
                size='tiny'
                open={this.props.open}
                closeOnEscape={false}
                closeOnRootNodeClick={false}
            >
                <ModalContent>  
                    <ModalHeader>Sign Up</ModalHeader>
                    <Form>
                        <Message>
                            Please enter your email address and a username for PixelProperty.
                        </Message>
                        <Form.Field>
                            <label>Wallet Address</label>
                            <input disabled value={this.state.wallet} onChange={() => {}}/>
                        </Form.Field>
                        <Form.Field>
                            <label>Email Address</label>
                            <input 
                                placeholder='example@pixelproperty.io' 
                                value={this.state.email} 
                                onChange={(e) => this.updateEmail(e.target.value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>Username</label>
                            <input 
                                placeholder='PixelProperty' 
                                value={this.state.username} 
                                onChange={(e) => this.updateUsername(e.target.value)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox 
                                checked={this.state.agreeTos} 
                                onChange={(e, data) => {this.setState({agreeTos: data.checked})}} 
                                label={{
                                    children: <div>I agree to the <a href='https://www.pixelproperty.io/terms-of-service.html' target='_blank'>Terms of Service</a> & <a href='https://www.pixelproperty.io/privacy-policy.html' target='_blank'>Privacy Policy</a></div>
                                }}
                            />
                        </Form.Field>
                        {this.state.errors.length > 0 &&
                            <Message color='red'>
                                {this.state.errors.map((error, i) => 
                                    <div key={i}>{error}</div>
                                )}
                            </Message>
                        }
                        <Message color='orange'>
                            Make sure to keep a backup of your wallet seed words and private keys. 
                            We can't help you regain access if it's lost.
                        </Message>
                    </Form>
                </ModalContent>
                <ModalActions>
                    <Button secondary onClick={() => this.props.onCancel()} >Cancel</Button>
                    <Button type='submit' onClick={() => this.signUp()} >Submit</Button>
                </ModalActions>
            </Modal>
        );
    }
}

export default SignUpForm