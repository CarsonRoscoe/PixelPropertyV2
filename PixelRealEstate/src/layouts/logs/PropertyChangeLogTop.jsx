import React, { Component } from 'react'
import * as Func from '../../functions/functions.jsx';
import * as EVENTS from '../../const/events';
import { Contract, ctr } from '../../contract/contract.jsx';
import {GridColumn, Grid, GridRow, Loader} from 'semantic-ui-react';
import { PanelPropertyCanvas } from '../ui/Panel';
import {GFD, GlobalState } from '../../functions/GlobalState';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';


class PropertyChangeLogTop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeLog: [],
            eventHandle: null,
            loadTimeout: null,
            isLoading: true,
        }
    }

    componentDidMount() {
        GFD.listen('ServerDataManagerInit', 'Log-PCLT', (initVersion) => {
            if (initVersion < 2)
                return;
            if (SDM.eventData.topTenPayouts.length > 0) {
                this.setState({changeLog: SDM.eventData.topTenPayouts, isLoading: false});
            }
            this.setState({
                eventHandle: ctr.watchEventLogs(EVENTS.PropertyColorUpdate, {}, (property, colors, lastUpdate, lastUpdaterPayee, becomePublic, rewardedCoins, event) => {
                    let old = SDM.eventData.topTenPayouts;
                    let last = Func.BigNumberToNumber(lastUpdate);
                    let reserved = Func.BigNumberToNumber(becomePublic);
                    let maxEarnings = ((reserved - last) / 30) * 5;
                    let payout = Func.calculateEarnings(last, maxEarnings);
                    let id = ctr.fromID(Func.BigNumberToNumber(property));
                    let newData = {
                        x: id.x,
                        y: id.y,
                        lastChange: last * 1000,
                        payout,
                        maxPayout: maxEarnings,
                        transaction: event.transactionHash,
                    };
                    if (old.length == 0) {
                        old.unshift(newData);
                        SDM.eventData.topTenPayouts = old;
                        this.setState({ changeLog: old, isLoading: false });
                    } else {
                        for (let i = Math.min(old.length - 1, 9); i >= 0; i--) {
                            if (payout <= old[i].payout || (i == 0 && payout > old[i].payout)) {
                                if (i < 9) {
                                    if (payout <= old[i].payout)
                                        old.splice(i + 1, 0, newData);
                                    else
                                        old.splice(i, 0, newData);
                                    old.splice(10);
                                    SDM.eventData.topTenPayouts = old;
                                    this.setState({ changeLog: old });
                                }
                                return;
                            }
                        }
                    }
                }),                    
                loadTimeout: setTimeout(() => {this.setState({isLoading: false})}, 15000),
            });
        });
    }

    setLocation(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
        Func.ScrollTo(Func.PAGES.TOP);
    }

    componentWillUnmount() {
        this.state.eventHandle != null && this.state.eventHandle.stopWatching();
        this.state.loadTimeout != null && clearTimeout(this.state.loadTimeout);
        GFD.closeAll('Log-PCLT');
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
                        Rank
                    </GridColumn>
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
                    <GridColumn width={2}>
                        Tx
                    </GridColumn>
                </GridRow>
                {this.state.changeLog.map((log, i) => (
                    <GridRow key={i} className='gridItem' onClick={() => { console.info(log, i); this.setLocation(log.x + 1, log.y + 1); } } columns={6} textAlign='center'> 
                        <GridColumn verticalAlign='middle' width={1}>{i + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={1}><PanelPropertyCanvas x={log.x} y={log.y} width={20}/></GridColumn>
                        <GridColumn verticalAlign='middle' width={2}>{log.x + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={2}>{log.y + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{Func.TimeSince(log.lastChange)}</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{log.payout >= log.maxPayout ? log.payout : log.payout + '/' + log.maxPayout}</GridColumn>
                        <GridColumn verticalAlign='middle' width={2}><a target='_blank' href={'https://etherscan.io/tx/' + log.transaction} >details</a></GridColumn>
                    </GridRow>
                ))}
            </Grid>
        );
    }
}

export default PropertyChangeLogTop