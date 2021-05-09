import React, { Component } from 'react'
import * as Func from '../../functions/functions.jsx';
import * as EVENTS from '../../const/events';
import { Contract, ctr } from '../../contract/contract.jsx';
import {GridColumn, Grid, GridRow, Dimmer, Loader} from 'semantic-ui-react';
import { PanelPropertyCanvas } from '../ui/Panel';
import {GFD, GlobalState } from '../../functions/GlobalState';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';


class PropertyChangeLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeLog: [],
            isLoading: true,
            eventHandle: null,
            loadTimeout: null,
        }
    }

    componentDidMount() {
        GFD.listen('ServerDataManagerInit', 'Log-PCL', (initVersion) => {
            if (initVersion < 2)
                return;
            if (SDM.eventData.recentPayouts.length > 0) {
                this.setState({changeLog: SDM.eventData.recentPayouts, isLoading: false});
            }

            let caller = this;
            this.setState({
                eventHandle : ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (property, colors, lastUpdate, lastUpdaterPayee, becomePublic, rewardedCoins, event) => {
                    let old = SDM.eventData.recentPayouts;
                    let id = ctr.fromID(Func.BigNumberToNumber(property));
                    let last = Func.BigNumberToNumber(lastUpdate);
                    let reserved = Func.BigNumberToNumber(becomePublic);
                    let maxEarnings = ((reserved - last) / 30) * 5;
                    let newData = {
                        x: id.x,
                        y: id.y,
                        lastChange: last * 1000,
                        payout: Func.calculateEarnings(last, maxEarnings),
                        maxPayout: maxEarnings,
                        transaction: event.transactionHash,
                    };
                    old.unshift(newData);
                    if (old.length > 20)
                        old.pop();
                    SDM.eventData.recentPayouts = old;
                    caller.setState({ changeLog: old, isLoading: false });
                }),                    
                loadTimeout: setTimeout(() => {this.setState({isLoading: false})}, 15000),
            });
        });
    }

    setLocation(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
        Func.ScrollTo(Func.PAGES.TOP);
        GFD.closeAll('Log-PCL');
    }

    componentWillUnmount() {
        this.state.eventHandle != null && this.state.eventHandle.stopWatching();
        this.state.loadTimeout != null && clearTimeout(this.state.loadTimeout);
    }

    render() {
        if (this.state.changeLog.length == 0 && !this.state.isLoading)
            return (<h3 className='noContent'>None Yet!</h3>);
        if (this.state.isLoading)
            return(<Loader size='small' active/>);
        return (
            <Grid className='detailTable'>
                <GridRow columns={6} textAlign='center'>
                    <GridColumn width={1}>
                        
                    </GridColumn>
                    <GridColumn width={2}>
                        X
                    </GridColumn>
                    <GridColumn width={2}>
                        Y
                    </GridColumn>
                    <GridColumn width={4}>
                        Last Change
                    </GridColumn>
                    <GridColumn width={4}>
                        Payout
                    </GridColumn>
                    <GridColumn width={3}>
                        Tx
                    </GridColumn>
                </GridRow>
                {this.state.changeLog.map((log, i) => (
                    <GridRow className='gridItem' onClick={() => this.setLocation(log.x + 1, log.y + 1) } key={i} columns={6} textAlign='center'> 
                        <GridColumn verticalAlign='middle' width={1}><PanelPropertyCanvas x={log.x} y={log.y} width={20}/></GridColumn>
                        <GridColumn verticalAlign='middle' width={2}>{log.x + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={2}>{log.y + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{Func.TimeSince(log.lastChange)}</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{log.payout >= log.maxPayout ? log.payout : log.payout + '/' + log.maxPayout}</GridColumn>
                        <GridColumn verticalAlign='middle' width={3}><a target='_blank' href={'https://etherscan.io/tx/' + log.transaction} >details</a></GridColumn>
                    </GridRow>
                ))}
            </Grid>
        );
    }
}

export default PropertyChangeLog