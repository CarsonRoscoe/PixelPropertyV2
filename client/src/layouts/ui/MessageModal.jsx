import React, { Component } from 'react'
import {Modal, ModalActions, ModalHeader, ModalContent, Button, Header, Icon} from 'semantic-ui-react';

class MessageModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }
  
  componentWillReceiveProps(newProps) {
    this.setState({isOpen: newProps.isOpen});
  }

  open() {
    this.setState({ isOpen: true });
  }

  close() {
    this.setState({ isOpen: false });
    this.props.onClose();
  }
  
    render() {
      return (

      <Modal 
        onOpen={() => this.open()}
        open={this.state.isOpen} 
        onClose={() => this.close()} 
        basic size='tiny'>
      <Header icon='warning' content={this.props.title} />
      <ModalContent>
        {this.props.description}
      </ModalContent>
      <ModalActions>
        <Button color='green' primary inverted onClick={() => this.close()}>
          <Icon name='checkmark'/> OK
        </Button>
      </ModalActions>
    </Modal>
      )
    }
  }

  export default MessageModal