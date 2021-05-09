import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';
import {Modal, Button, ModalHeader, ModalContent, ModalActions, Icon, Divider, Image, Message, List} from 'semantic-ui-react';
import * as Strings from '../const/strings';
import * as Const from '../const/const';
import * as Func from '../functions/functions';
import {FB, FireBase} from '../const/firebase';
import {GFD, GlobalState, TUTORIAL_STATE} from '../functions/GlobalState';
import Info from './ui/Info';
import * as Assets from '../const/assets';
import SignUpForm from './forms/SignUpForm';
import Query from 'url-query-parser';

class GetStarted extends Component {
    constructor(props) {
        super(props);
        this.state = {
            continueAdvancedMode: false, //user sees first modal explaining advanced mode and clicks yes.
            noMetaMask: true, //metamask is not installed
            network: Const.NETWORK_DEV, //network.
            userExists: false, //the user exists.
        };
    }

    reloadForMetaMask() {
        localStorage.setItem('startInAdvancedMode', true);
        localStorage.setItem('hideAdvancedModeDialog', true);
        location.reload();
    }

    chooseAdvancedMode() {
        this.setState({continueAdvancedMode: true})
    }

    checkURLQuery() {
        let query = Query.search(location.href).query;

        for (let i = 0; i < query.length; i+=2) {
            if (query[i] === 'showAdvanced') {
                GFD.setData('advancedMode', query[i+1] == 'true' ? true : false);
            }
            if (query[i] === 'referral') {
                console.info(query[i+1])
                this.setState({referralAddress: query[i+1]});
            }
        }
    }

    componentDidMount() {
        GFD.listen('noMetaMask', 'getStarted', (noMetaMask) => {
            this.setState({noMetaMask});
        });

        GFD.listen('network', 'getStarted', (network) => {
            this.setState({network});
        });

        GFD.listen('userExists', 'getStarted', (userExists) => {
            this.setState({userExists});
        });
        if (localStorage.getItem('hideAdvancedModeDialog')) {
            this.setState({continueAdvancedMode: true})
            localStorage.removeItem('hideAdvancedModeDialog');
        }
        this.checkURLQuery();
    }

    componentWillUnmount() {
        GFD.closeAll('getStarted');
    }

    render() {
        if (!this.props.advancedMode)
            return null;
        return(
            <div>
                <Modal
                    size='small'
                    open={(this.state.noMetaMask || !this.state.userExists) && !this.state.continueAdvancedMode}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                    className='becomeAdvanced'
                >
                    <ModalHeader>Register</ModalHeader>
                    <ModalContent>  
                        <Message success>
                            The PixelProperty canvas is a cryptocollectable! 
                            
                            Registered users are able to own and trade parts of PixelProperty. 
                            
                            Sign up for free now to store and trade your crypto assets securely.
                        </Message>
                        <Message warning>
                            <h2>Basic Users</h2>
                            <br/>
                            <List>
                                <List.Item>
                                    <List.Icon name='check' />
                                    <List.Content>
                                    <List.Header>Free Drawing</List.Header>
                                    <List.Description>Draw anywhere that isn't reserved by a Registered User.</List.Description>
                                    </List.Content>
                                </List.Item>
                            </List>
                        </Message>
                        <Message success>
                            <h2>Registered Users</h2>
                            <br/>
                            <List>
                                <List.Item>
                                    <List.Icon name='check' />
                                    <List.Content>
                                        <List.Header>Blockchain Verified Drawing</List.Header>
                                        <List.Description>Earn PXL Token for drawing. Draw priority over basic users.</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Icon name='check' />
                                    <List.Content>
                                        <List.Header>Trade Properties with PXL</List.Header>
                                        <List.Description>Allows extra content control & passive PXL generation.</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Icon name='check' />
                                    <List.Content>
                                        <List.Header>Community</List.Header>
                                        <List.Description>Chat with other users and share your portfolio.</List.Description>
                                    </List.Content>
                                </List.Item>
                                <List.Item>
                                    <List.Icon name='minus' />
                                    <List.Content>
                                        <List.Header>Requires ETH</List.Header>
                                        <List.Description>Fee for drawing and trading across the Ethereum network.</List.Description>
                                    </List.Content>
                                </List.Item>
                            </List>
                        </Message>
                    </ModalContent>
                    <ModalActions>
                        <Button secondary onClick={() => this.props.changeMode()}>Cancel</Button>
                        <Button primary onClick={() => this.chooseAdvancedMode()}>Start Now</Button>
                    </ModalActions>
                </Modal>
                <Modal
                    size='small'
                    open={this.state.noMetaMask && this.state.continueAdvancedMode}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                >
                    <ModalHeader>Get MetaMask</ModalHeader>
                    <ModalContent>  
                        <Message>
                            Looks like you're missing MetaMask! 
                            <br/>
                            You'll need MetaMask to use the canvas in Advanced Mode. Click below to learn more & install the browser extension.
                        </Message>
                        <Image 
                            rounded bordered
                            size='large'
                            className='downloadImage'
                            src={Assets.METAMASK_DOWNLOAD}
                            href='https://metamask.io' 
                            as='a'
                            target='_blank'
                        />
                    </ModalContent>
                    <ModalActions>
                        <Button secondary onClick={() => this.props.changeMode()}>Cancel</Button>
                        <Button primary onClick={() => this.reloadForMetaMask()}>I Installed MetaMask</Button>
                    </ModalActions>
                </Modal>
                <Modal
                    size='small'
                    open={!this.state.noMetaMask && this.state.network != Const.NETWORK_MAIN && this.state.continueAdvancedMode}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                >
                    <ModalHeader>Switch Networks</ModalHeader>
                    <ModalContent>  
                        <Message>
                            We're on the main network! Please open MetaMask and change the network to "Main Network". MetaMask is at the top right of your browser window.
                        </Message>
                        <Image 
                            rounded bordered
                            size='large'
                            className='downloadImage'
                            src={Assets.MAIN_NETWORK}
                            target='_blank'
                        />
                    </ModalContent>
                    <ModalActions>
                        <Button secondary onClick={() => this.props.changeMode()}>Cancel</Button>
                    </ModalActions>
                </Modal>
                <Modal
                    size='tiny'
                    open={!this.state.noMetaMask && this.state.network === Const.NETWORK_MAIN && ctr.account === null && this.state.continueAdvancedMode}
                    closeOnEscape={false}
                    closeOnRootNodeClick={false}
                >
                    <ModalHeader>Sign In to MetaMask</ModalHeader>
                    <ModalContent>  
                        <Message>
                            Please login to your MetaMask wallet! Open MetaMask and enter your wallet password.
                            MetaMask is at the top right of your browser window.
                        </Message>
                    </ModalContent>
                    <ModalActions>
                        <Button secondary onClick={() => this.props.changeMode()}>Cancel</Button>
                    </ModalActions>
                </Modal>
                <SignUpForm
                    open={!this.state.noMetaMask && this.state.network === Const.NETWORK_MAIN && ctr.account !== null && !this.state.userExists && this.state.continueAdvancedMode}
                    referralAddress={this.state.referralAddress}
                    onCancel={() => this.props.changeMode()}
                />
            </div>
        );
    }
}

export default GetStarted