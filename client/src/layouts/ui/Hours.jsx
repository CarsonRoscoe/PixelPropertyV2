import React, { Component } from 'react'

export default class Hours extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hours: 0,
            update: null,
        };
    }

    componentDidMount() {
        this.setState({
            hours: this.calculateHours(this.props.time),
            update: setInterval(() => {
                this.setState({hours: this.calculateHours(this.props.time)});
            }, 15000 + (1000 * Math.random()))
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.update);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.time !== this.props.time) {
            this.setState({
                hours: this.calculateHours(newProps.time)
            });
        }
    }

    calculateHours(time) {
        let millis = (new Date().getTime() / 1000) - time;
        let hours = Math.floor(millis / 3600);
        return hours;
    }

    format(hours) {
        if (hours < 1)
            return '< 1 hour ago';
        if (hours == 1)
            return '1 hour ago';
        return hours + ' hours ago';

    }

    render() {
        return (
            <div className='hours'>
                {this.format(this.state.hours)}
            </div>
        );
    }
}