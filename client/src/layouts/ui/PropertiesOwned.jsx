import React, { Component } from 'react';
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import PanelContainerOwned from './PanelContainerOwned';
import * as Assets from '../../const/assets.jsx';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Hours from '../ui/Hours';
import * as Func from '../../functions/functions';
import {Segment, Button, Icon, Table} from 'semantic-ui-react';
import {Panel, PanelItem, PanelPropertyCanvas, PanelDivider} from './Panel';

const ITEM_SIZE = 140;

class PropertiesOwned extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderedItems: [],
            column: '',
            ascending: true,
            eventHandle: null,
        };
        this.newestSort = new Date().getTime();
    }

    componentDidMount() {
        this.props.isLoading(true);

        GFD.listen('userExists', 'Log-OP', (loggedIn) => {
            if (!loggedIn)
                return;
            //add right owner
            ctr.watchEventLogs(EVENTS.PropertyBought, {}, (eventHandle) => {
                this.setState({eventHandle});
                eventHandle.watch((error, log) => {
                    this.reorderItems();
                    this.forceUpdate();
                });
            });
            this.reorderItems();
        });
    }

    reorderItems(column = this.state.column, ascending = this.state.ascending) {

        this.newestSort = new Date().getTime();
        let promise = SDM.orderPropertyListAsync(SDM.ownedProperties, column, ascending);

        let relisten = (results) => {
            if (results.startTime < this.newestSort)
                return;
            this.setState({
                orderedItems: results.data, 
            });
            if (results.promise)
                results.promise.then(relisten);
        }

        promise.then(relisten);
    }

    componentWillUnmount() {
        if (this.state.eventHandle != null)
            this.state.eventHandle.stopWatching();
        this.newestSort = new Date().getTime();
        GFD.closeAll('Log-OP');
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    propertySelected(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
        Func.ScrollTo(Func.PAGES.TOP);
    }

    reorderList(column) {
        this.reorderItems(column, !this.state.ascending);
        this.setState({
            column,
            ascending: !this.state.ascending
        });
    }

    cancelSale(e) {
        window.alert("Not setup yet. Please cancel a sale from Property Inspection.");
    }

    render() {
        if (this.state.orderedItems.length == 0)
            return (<h3 className='noContent'>None Yet!</h3>);
        return (
            <Table celled sortable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={2}>Canvas</Table.HeaderCell>
                <Table.HeaderCell 
                    width={1} 
                    sorted={this.state.column === 'x' ? bToAsc(this.state.ascending) : null} 
                    onClick={() => {this.reorderList('x')}}
                >X</Table.HeaderCell>
                <Table.HeaderCell 
                    width={1} 
                    sorted={this.state.column === 'y' ? bToAsc(this.state.ascending) : null} 
                    onClick={() => {this.reorderList('y')}}
                >Y</Table.HeaderCell>
                <Table.HeaderCell 
                    width={3}
                    sorted={this.state.column === 'PPCPrice' ? bToAsc(this.state.ascending) : null} 
                    onClick={() => {this.reorderList('PPCPrice')}}
                >For Sale</Table.HeaderCell>
                <Table.HeaderCell 
                    width={1}
                    sorted={this.state.column === 'isInPrivate' ? bToAsc(this.state.ascending) : null} 
                    onClick={() => {this.reorderList('isInPrivate')}}
                >Private</Table.HeaderCell>
                <Table.HeaderCell 
                    width={3}
                    sorted={this.state.column === 'lastUpdate' ? bToAsc(!this.state.ascending) : null} 
                    onClick={() => {this.reorderList('lastUpdate')}}
                >Last Update</Table.HeaderCell>
                <Table.HeaderCell 
                    width={5}
                >Action</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
        
            <Table.Body className='tableBodyUi'>
                {this.state.orderedItems.map((child, i) => (   
                    i >= 50 ? null :
                    <Table.Row key={i} className='segmentButton' onClick={() => {this.propertySelected(child.x + 1, child.y + 1)}}>
                        <Table.Cell>
                            <PanelPropertyCanvas x={child.x} y={child.y} width={20}/>
                        </Table.Cell>
                        <Table.Cell>
                            {child.x + 1}
                        </Table.Cell>
                        <Table.Cell>
                            {child.y + 1}
                        </Table.Cell>
                        <Table.Cell>
                            {!child.isForSale ? 'No' : 
                                (Func.NumberWithCommas(child.PPCPrice) + ' PXL')
                            }
                        </Table.Cell>
                        <Table.Cell>
                            {child.isInPrivate ? 'Yes' : 'No'}
                        </Table.Cell>
                        <Table.Cell>
                            {child.lastUpdate != null && child.lastUpdate > 0 ? <Hours time={child.lastUpdate} /> : 'Never'}
                        </Table.Cell>
                        <Table.Cell>
                            {child.isForSale ? 
                                <Button className='delistButton' fluid size='mini' onClick={(e) => this.cancelSale(e)}>Delist</Button>
                            : null}
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
          </Table>
        );
    }
}

const bToAsc = (bool) => {
    if (bool)
        return 'descending';
    return 'ascending';
}

export default PropertiesOwned