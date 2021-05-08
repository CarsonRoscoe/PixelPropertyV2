import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';
import * as Assets from '../const/assets';
import {Message} from 'semantic-ui-react';

class ErrorBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            hideErrors: {},
        };
        this.receiveMessage = this.receiveMessage.bind(this);
        this.removeHideError = this.removeHideError.bind(this);
    }

    componentDidMount() {
        ctr.listenForResults(LISTENERS.Error,  'error', this.receiveMessage);
    }

    componentWillUnmount() {
        ctr.stopListeningForResults(LISTENERS.Error, 'error');
    }

    removeHideError(errorId) {
        delete this.state.hideErrors[errorId];
    }

    hideError(errorId) {
        let hideErrors = this.state.hideErrors;
        let errors = this.state.errors;
        delete errors[errorId];
        hideErrors[errorId] = setTimeout(() => this.removeHideError(errorId), 6000);
        this.setState({hideErrors, errors});
    }

    receiveMessage(data) {
        let update = this.state.errors;
        if (data.errorId != null && this.state.hideErrors[data.errorId] == null)
            update[data.errorId] = {errorType: data.errorType, message: data.message};
        if (data.removeErrors != null)
            for(let i = 0; i < data.removeErrors.length; i++)
                delete update[i];
        this.setState({errors: update});
    }

    render() {
        return (
            <div style={this.props.containerStyle}>
               {Object.keys(this.state.errors).map((i) => 
                    <Message 
                        onDismiss={() => this.hideError(i)}
                        key={i} 
                        floating 
                        color={this.state.errors[i].errorType}
                    >
                        <div className='message'>{this.state.errors[i].message}</div>
                    </Message>
               )}
            </div>
        );
    }
}

export default ErrorBox