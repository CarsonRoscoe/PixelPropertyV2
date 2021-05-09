import React, { Component } from 'react';
import * as EVENTS from '../../const/events';
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import TimeAgo from 'react-timeago';
import PanelContainerOwned from './PanelContainerOwned';
import * as Assets from '../../const/assets.jsx';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Dropdown from 'react-dropdown';
import PanelContainerForSale from './PanelContainerForSale';
import {Button, Segment, Icon, Table} from 'semantic-ui-react';
import * as Func from '../../functions/functions';
import Hours from '../ui/Hours';
import {Panel, PanelItem, PanelPropertyCanvas, PanelDivider} from './Panel';

const ITEM_SIZE = 140;

class PropertiesForSale extends Component {
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
        GFD.listen('userExists', 'Log-PFS', (loggedIn) => {
            if (!loggedIn)
                return;
            this.setState({eventHandle: ctr.watchEventLogs(EVENTS.PropertySetForSale, {}, (forSalePrice, event) => {
                    this.reorderItems();
                    this.forceUpdate();
                }),
            });
            this.reorderItems();
        })
    }

    reorderItems(column = this.state.column, ascending = this.state.ascending) {

        this.newestSort = new Date().getTime();
        let promise = SDM.orderPropertyListAsync(SDM.forSaleProperties, column, ascending);

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
        GFD.closeAll('Log-PFS');
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

    buyProperty(e) {
        window.alert("Not setup yet. Please buya property from Property Inspection.");
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
                >PXL Price</Table.HeaderCell>
                <Table.HeaderCell 
                    width={1}
                    sorted={this.state.column === 'isInPrivate' ? bToAsc(this.state.ascending) : null} 
                    onClick={() => {this.reorderList('isInPrivate')}}
                >ETH Price</Table.HeaderCell>
                <Table.HeaderCell 
                    width={3}
                    sorted={this.state.column === 'lastUpdate' ? bToAsc(!this.state.ascending) : null} 
                    onClick={() => {this.reorderList('lastUpdate')}}
                >Owner</Table.HeaderCell>
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
                            {Func.NumberWithCommas( child.PPCPrice )}
                        </Table.Cell>
                        <Table.Cell>
                            {Func.WeiToEth( child.ETHPrice )}
                        </Table.Cell>
                        <Table.Cell>
                            {child.owner}
                        </Table.Cell>
                        <Table.Cell>
                            {child.isForSale ? 
                                <Button className='delistButton' fluid size='mini' onClick={(e) => this.buyProperty(e)}>Buy</Button>
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

export default PropertiesForSale;