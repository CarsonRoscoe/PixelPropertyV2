import React, { Component } from 'react'
import {Panel, PanelItem} from './Panel';

class PanelContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataView: []
        }
    }

    componentDidMount() {
        let start = this.props.viewStart;
        let end = this.props.viewEnd;
        let len = this.props.data.length;
        let maxLen = this.props.maxPageSize;
        let view1 = [];
        let view2 = [];
        let placeholder = [];
        for (let i = Math.abs(end - start); i < maxLen; i++) {
            placeholder.push({});
        }
        if (end > len) {
            end -= len;
        }
        if (end < 0) {
            end += len;
        }
        if (start > end) {
            view1 = this.props.data.slice(start, len);
            view2 = this.props.data.slice(0, end);
            this.setState({
                dataView: view1.concat(view2),
                placeholder
            });
        } else {
            this.setState({
                dataView: this.props.data.slice(start, end),
                placeholder
            });
        }
    }

    componentWillReceiveProps(newProps) {
        let start = newProps.viewStart;
        let len = newProps.data.length;
        let end = newProps.viewEnd;
        let maxLen = newProps.maxPageSize;
        let view1 = [];
        let view2 = [];
        let placeholder = [];
        for (let i = Math.abs(end - start); i < maxLen; i++) {
            placeholder.push({});
        }
        if (end > len) {
            end -= len;
        }
        if (end < 0) {
            end += len;
        }
        if (start > end) {
            view1 = newProps.data.slice(start, len);
            view2 = newProps.data.slice(0, end);
            this.setState({
                dataView: view1.concat(view2),
                placeholder
            });
        } else {
            this.setState({
                dataView: newProps.data.slice(start, end),
                placeholder
            });
        }
    }

    componentWillUnmount() {
        //stop listeneing for update.
        /*
        add an event listener here and cleanup if you want live updating tables too
        */
    }

    render() {
        return (
            <div className='panelContainer'>
                {this.state.dataView.map((child, i) => (
                    <Panel key={i}>
                        <PanelItem width='10%' title data='X:'/>
                        <PanelItem width='40%' data={child.x + 1}/>
                        <PanelItem width='10%' title data='Y:'/>
                        <PanelItem width='40%' data={child.y + 1}/>
                    </Panel>
                ))}
            </div>
        );
    }
}
export default PanelContainer