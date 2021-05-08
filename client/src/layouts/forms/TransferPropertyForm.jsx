import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import ConfirmModal from '../ui/ConfirmModal';
import * as Strings from '../../const/strings';
import Info from '../ui/Info';
import {Modal, ModalContent, Input, ModalHeader, Popup, Label, Divider, Icon, ModalActions, Message} from 'semantic-ui-react';

class TransferPropertyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: '',
            y: '',
            valueNewOwner: '',
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
        GFD.listen('x', 'transferProperty', (x) => {
            this.setState({x});
        })
        GFD.listen('y', 'transferProperty', (y) => {
            this.setState({y});
        })
    }

    componentWillUnmount() {
        GFD.closeAll('transferProperty');
    }

    setX(x) {
        GFD.setData('x', x);
    }
    
    setY(y) {
        GFD.setData('y', y);
    }

    handleNewOwner(newOwner) {
        this.setState({valueNewOwner: newOwner});
    }

    toggleModal(set = null, a) {
        console.info(set, a);
        let res = set != null ? set : !this.state.isOpen;
        this.setState({isOpen: res});
        if (!res)
            this.props.close("TRANSFER");
    }

    dialogResults(res) {
        if (res) {
            ctr.transferProperty(this.state.x - 1, this.state.y - 1, this.state.valueNewOwner, (res) => {
                this.toggleModal(!res);
            })
        }
    }

    render() {
        return (
            <Modal size='mini' 
                open={this.state.isOpen} 
                closeIcon 
                closeOnRootNodeClick={true}
                closeOnDocumentClick={false}
                onClose={() => this.toggleModal(false)}
                >
                <ModalHeader>Transfer Property</ModalHeader>
                <ModalContent>
                <Info messages={Strings.FORM_TRANSFER}/>
                <Divider/>
                <Divider horizontal>New Owner</Divider>
                <Input
                    placeholder="Address"
                    fluid
                    className='oneColumn'
                    value={this.state.owner}
                    onChange={(e) => this.handleNewOwner(e.target.value)}
                    label={<Popup
                        trigger={<Label><Icon className='uniform' name='user'/></Label>}
                        content='New Owner Address'
                        className='Popup'
                        size='tiny'
                    />}
                />
                </ModalContent>
                <ModalActions>
                    <ConfirmModal 
                        title='Confirm Property Transfer'
                        description={'Are you sure you would like to give this property to ' + this.state.valueNewOwner + '?'}
                        activateName='Transfer Property' 
                        result={(result) => this.dialogResults(result)}
                    />
                </ModalActions>
            </Modal>
        );
    }
}

export default TransferPropertyForm