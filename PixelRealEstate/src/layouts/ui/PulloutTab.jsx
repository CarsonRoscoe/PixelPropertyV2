import React, { Component } from 'react'

class PulloutTab extends Component {
    constructor(props) {
        super(props);
    }

    togglePullout() {
        this.props.toggle(this.props.isOpen);
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

export default PulloutTab