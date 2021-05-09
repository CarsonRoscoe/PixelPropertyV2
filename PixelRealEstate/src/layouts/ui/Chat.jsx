import React, { Component } from 'react'
import { Message, List, Icon, Divider, Input, ModalHeader, ModalContent, ModalActions, Button, Modal, GridRow, GridColumn, Grid } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import {ctr, contract, LISTENERS} from '../../contract/contract';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Func from '../../functions/functions.jsx';

export default class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            messages: [],
            showAdminOptions: false,
            selectedAdminMessage: null,
        };
        this.handleMessageInput = this.handleMessageInput.bind(this);
        this.showAdminOptionsModal = this.showAdminOptionsModal.bind(this);
    }

    componentWillMount() {
        GFD.listen('userExists', 'chat', (userExists) => {
            if (userExists) {
                FB.watchChat((newMessage) => {
                    let msg = newMessage.val();
                    msg.id = newMessage.key;
                    this.displayNewMessage(msg);
                },
                (removedMessage) => {
                    let msg = removedMessage.val();
                    msg.id = removedMessage.key;
                    this.removeMessage(msg);
                });
                GFD.close('userExists', 'chat');
            }
        })
    }

    componentDidMount() {
        this.attemptScrollIntoView();
    }

    removeMessage(message) {
        let messages = this.state.messages;
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].id === message.id) {
                messages.splice(i, 1);
                this.setState({messages});
                return;
            }
        }
    }

    displayNewMessage(msgObject) {
        msgObject.isMe = msgObject.username === GFD.getData('user').username;
        let messages = this.state.messages;
        messages.push(msgObject);
        if (messages.length > 100)
            messages.length = 100;
        this.setState({messages});
    }

    componentDidUpdate() {
        this.attemptScrollIntoView();
    }

    attemptScrollIntoView(pxFromBottom = 100) {
        let chatMessages = document.getElementById('chatMessages');
        if (chatMessages.scrollHeight < (chatMessages.clientHeight + chatMessages.scrollTop + pxFromBottom))
            chatMessages.scrollTop = chatMessages.scrollHeight - chatMessages.clientHeight;
    }

    componentWillUnmount() {
        FB.stopWatchingChat();
        GFD.closeAll('chat');
    }

    handleMessageInput(ev, data) {
        this.setState({message: ev.target.value});
    }

    showAdminOptionsModal(message) {
        if (GFD.getData('user').isAdmin) {
            this.setState({
                showAdminOptions: true,
                selectedAdminMessage: message,
            })
        } else {
            this.closeAdminOptions();
        }
    }

    closeAdminOptions() {
        this.setState({
            showAdminOptions: false,
            selectedAdminMessage: null,
        })
    }

    deleteMessage() {
        if (this.state.selectedAdminMessage != null) {
            FB.deleteChatMessage(this.state.selectedAdminMessage.id);
        }
        this.closeAdminOptions();
    }

    muteUser(hours) {
        if (this.state.selectedAdminMessage != null) {
            FB.muteChatUser(this.state.selectedAdminMessage.walletID, new Date().getTime() + (hours * 3600000));
        }
        this.closeAdminOptions();
    }

    sendMessage() {
        FB.sendChatMessage(this.state.message, (result) => {
            if (result == 'success') {
                this.setState({message: ''});
            } else if (result == 'fail') {
                ctr.sendResults(LISTENERS.Alert, {result: false, message: "Unable to send chat message at this time."});
            } else if (result == 'muted') {
                ctr.sendResults(LISTENERS.Alert, {result: false, message: "You have been muted for " + Func.TimeSince(GFD.state.user.mutedUntil, true)});
            }
        })
    }

    render() {
        return (
            <div>
                <Modal
                    open={this.state.showAdminOptions}
                    onClose={() => {this.closeAdminOptions()}}
                >
                    <ModalHeader>Admin Options</ModalHeader>
                    <ModalContent>
                        {this.state.selectedAdminMessage != null &&
                            <h4>{this.state.selectedAdminMessage.username}: {this.state.selectedAdminMessage.message}</h4>
                        }
                        <Divider/>
                        <Grid>
                            <GridRow>
                                <GridColumn width={16}>
                                    <Button fluid content='Delete Message' onClick={() => {this.deleteMessage()}}/>
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={8}>
                                    <Button fluid content='Mute User (1 Hour)' onClick={() => {this.muteUser(1)}}/>
                                </GridColumn>
                                <GridColumn width={8}>
                                    <Button fluid content='Mute User (6 Hours)' onClick={() => {this.muteUser(6)}}/>
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={8}>
                                    <Button fluid content='Mute User (24 Hours)' onClick={() => {this.muteUser(24)}}/>
                                </GridColumn>
                                <GridColumn width={8}>
                                    <Button fluid content='Mute User (7 Days)' onClick={() => {this.muteUser(168)}}/>
                                </GridColumn>
                            </GridRow>
                            <GridRow>
                                <GridColumn width={16}>
                                    <Button fluid content='Mute User (1 Year)' onClick={() => {this.muteUser(8736)}}/>
                                </GridColumn>
                            </GridRow>
                        </Grid>
                    </ModalContent>
                    <ModalActions>
                        <Button content='Close' onClick={() => {this.closeAdminOptions()}}/>
                    </ModalActions>
                </Modal>
            <List 
                divided 
                verticalAlign='middle' 
                className='chatMessages'
                id='chatMessages'
            >
            {this.state.messages.map((message, i) => {
                return <ChatMessage 
                    key={i}
                    isMe={message.isMe}
                    username={message.username}
                    message={message.message}
                    showAdminOptionsModal={this.showAdminOptionsModal}
                    data={message}
                />
            })}
            </List>
            <Divider/>
            <Input 
                focus
                className='sendMessageInput'
                action={<Button content='Send' onClick={() => this.sendMessage()}></Button>}
                onChange={this.handleMessageInput}
                onKeyPress={(ev) => {if (ev.key === 'Enter') this.sendMessage()}}
                placeholder='Send' 
                maxLength={100}
                value={this.state.message}
            />
            </div>
        );
    }
}

class ChatMessage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
        <List.Item className='chatMessage'>
            <List.Content floated={this.props.isMe ? 'right' : 'left'}>
                <List.Header 
                    onClick={() => this.props.showAdminOptionsModal(this.props.data)}
                    style={{textAlign: (this.props.isMe ? 'right' : 'left')}}
                >{this.props.username}</List.Header>
                <List.Description>{this.props.message}</List.Description>
            </List.Content>
        </List.Item>
        );
    }
}



