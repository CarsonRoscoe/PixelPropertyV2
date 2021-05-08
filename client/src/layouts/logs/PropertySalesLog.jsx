import React, { Component } from 'react'
import {GFD, GlobalState } from '../../functions/GlobalState';
import * as Func from '../../functions/functions.jsx';
import {Contract, ctr } from '../../contract/contract.jsx';
import {GridColumn, Grid, GridRow, Label, LabelDetail, Loader} from 'semantic-ui-react';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';
import * as EVENTS from '../../const/events';
import * as Struct from '../../const/structs';


class PropertySalesLog extends Component {
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
        GFD.listen('ServerDataManagerInit', 'Log-PSL', (initVersion) => {
            if (initVersion < 2)
                return;
            if (SDM.eventData.recentTrades.length > 0) {
                this.setState({changeLog: SDM.eventData.recentTrades, isLoading: false});
            }
            ctr.watchEventLogs(EVENTS.PropertyBought, {}, (handle) => {
                let eventHandle = handle;
                this.setState({
                    eventHandle,
                    loadTimeout: setTimeout(() => {this.setState({isLoading: false})}, 15000),
                });
                handle.watch((error, log) => {
                    let old = SDM.eventData.recentTrades;
                    let id = ctr.fromID(Func.BigNumberToNumber(log.args.property));
                    let PXLPrice = Func.BigNumberToNumber(log.args.PXLAmount);
                    let ETHPrice = Func.BigNumberToNumber(log.args.ethAmount);
                    let timeSold = Func.BigNumberToNumber(log.args.timestamp);
                    let newData = {
                        x: id.x,
                        y: id.y,
                        PXLPrice,
                        ETHPrice,
                        oldOwner: log.args.oldOwner == ctr.account ? "You" : (log.args.oldOwner === Struct.NOBODY ? 'PixelProperty' : log.args.oldOwner),
                        newOwner: log.args.newOwner == ctr.account ? "You" : log.args.newOwner,
                        timeSold: timeSold * 1000,
                        transaction: log.transactionHash,
                    };
                    old.unshift(newData);
                    if (old.length > 20)
                        old.pop();
                    SDM.eventData.recentTrades = old;
                    this.setState({ changeLog: old, isLoading: false });
                });
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
        GFD.closeAll('Log-PSL');
    }

    render() {
        if (this.state.changeLog.length == 0 && !this.state.isLoading)
            return (<h3 className='noContent'>None Yet!</h3>);
        if (this.state.isLoading)
            return(<Loader size='small' active/>);
        return (
            <Grid className='detailTable'>
                <GridRow columns={5} textAlign='center'>
                    <GridColumn width={1}>
                        X
                    </GridColumn>
                    <GridColumn width={1}>
                        Y
                    </GridColumn>
                    <GridColumn width={3}>
                        Price
                    </GridColumn>
                    <GridColumn width={4}>
                        Seller
                    </GridColumn>
                    <GridColumn width={4}>
                        Buyer
                    </GridColumn>
                    <GridColumn width={2}>
                        Time Traded
                    </GridColumn>
                    <GridColumn width={1}>
                        Tx
                    </GridColumn>
                </GridRow>
                {this.state.changeLog.map((log) => (
                    <GridRow className='gridItem' onClick={() => this.setLocation(log.x + 1, log.y + 1) }  key={log.transaction} columns={5} textAlign='center'> 
                        <GridColumn verticalAlign='middle' width={1}>{log.x + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={1}>{log.y + 1}</GridColumn>
                        <GridColumn verticalAlign='middle' width={3}>{
                            <div>
                                {log.PXLPrice > 0 && <Label>PXL<LabelDetail>{Func.NumberWithCommas(log.PXLPrice)}</LabelDetail></Label>}
                                {log.ETHPrice > 0 && <Label>ETH<LabelDetail>{Func.WeiToEth(log.ETHPrice)}</LabelDetail></Label>}
                            </div>
                        }</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{log.oldOwner}</GridColumn>
                        <GridColumn verticalAlign='middle' width={4}>{log.newOwner}</GridColumn>
                        <GridColumn verticalAlign='middle' width={2}>{Func.TimeSince(log.timeSold) + ' ago'}</GridColumn>
                        <GridColumn verticalAlign='middle' width={1}><a target='_blank' href={'https://etherscan.io/tx/' + log.transaction} >details</a></GridColumn>
                    </GridRow>
                ))}
            </Grid>
        );
    }
}

export default PropertySalesLog