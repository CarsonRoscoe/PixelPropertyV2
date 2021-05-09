import React, { Component } from 'react'

export default class Loader extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let maxWidth = (this.props.maxWidth ? this.props.maxWidth : 20);
        let increment = 100 / maxWidth;
        return (
            <div className="progress" 
                style={{
                    width: (this.props.progress / increment) + 'px',
                    maxWidth: maxWidth + 'px',
                }}
            ></div>
        );
    }
}

