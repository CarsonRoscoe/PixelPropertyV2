import React, { Component } from 'react'
import { Message } from 'semantic-ui-react';

export default class Info extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (Array.isArray(this.props.messages))
            return (
                <Message className='infoMessage' size={this.props.size == null ? 'tiny' : this.props.size} floating>
                    {this.props.messages.map((str, i) => (
                        <p key={i}>{str}</p>
                    ))}
                </Message>
            );
        else
            return (
                <Message className='infoMessage' floating size={this.props.size == null ? 'tiny' : this.props.size}>
                    {this.props.messages}
                </Message>
            );
    }
}

