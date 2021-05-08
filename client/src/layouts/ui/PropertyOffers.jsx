import React, { Component } from 'react';
import {Contract, ctr, EVENTS, LISTENERS} from '../../contract/contract.jsx';
import {SDM, ServerDataManager, Compares} from '../../contract/ServerDataManager.jsx';
import TimeAgo from 'react-timeago';
import PanelContainerOwned from './PanelContainerOwned';
import * as Assets from '../../const/assets.jsx';
import {GFD, GlobalState} from '../../functions/GlobalState';
import Dropdown from 'react-dropdown';
import PanelContainerForSale from './PanelContainerForSale';

const PAGE_SIZE = 10;

class PropertyOffers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: 0, //on page #
            pages: 0, //total pages
        };
    }

    componentDidMount() {
        ctr.listenForEvent(EVENTS.PropertyOffer, 'PropertyOffers', (data) => {
            this.reorderItems(this.state.compare.func);
            this.forceUpdate();
        });
        this.reorderItems(this.state.compare.func);
    }

    componentWillUnmount() {
        this.cancelSort = true;
        ctr.stopListeningForEvent(EVENTS.PropertyOffer, 'PropertyOffers');
    }

    handleInput(key, value) {
        let obj = {};
        obj[key] = value;
        this.setState(obj);
    }

    toggleCanvasProperties(value) {
        this.setState({showPopertiesForSale: value});
        ctr.sendResults(LISTENERS.ShowForSale, {show: value});
    }

    propertySelected(x, y) {
        GFD.setData('x', x);
        GFD.setData('y', y);
    }

    changePage(pageChange) {
        let page = this.state.page + pageChange;
        if (page < 0)
            page = 0;
        if (page > this.state.pages)
            page = this.state.pages;
        this.setState({page});        
    }

    reorderList(value) {
        this.setState({compare: Compares[value.value]});
        this.reorderItems(Compares[value.value].func);
    }

    render() {
        return (
            <div className='uiBase'>
                <div className='header'>
                    Properties For Sale
                    <label className="switch">
                    Show
                    <input 
                        type="checkbox" 
                        checked={this.state.showPopertiesForSale} 
                        onChange={(e) => this.toggleCanvasProperties(e.target.checked)}
                    ></input>
                    <span className="slider"></span>
                </label>
                <div>
                    <Dropdown 
                        className='dropdown'
                        value={this.state.compare}
                        options={Object.keys(Compares).map((i) => {
                            return Compares[i];
                        })} 
                        onChange={value => {this.reorderList(value)}}
                    />
                </div>
                </div>
                <div className='containerParent'>
                    <PanelContainerForSale
                        data={this.state.orderedItems}
                        onClick={(x, y) => this.propertySelected(x, y)}
                        viewStart={this.state.page * PAGE_SIZE}
                        viewEnd={(this.state.page + 1) * PAGE_SIZE}
                    />
                </div>
                <div className='footer'>
                    <div className='bottomNav' onClick={() => this.changePage(-1)}>
                        <img className='icon' src={Assets.ICON_LEFT_ARROW}></img>
                    </div>
                    <div className='bottomNav'>
                        {(this.state.page + 1) + ' / ' + (this.state.pages + 1)}
                    </div>
                    <div className='bottomNav' onClick={() => this.changePage(1)}>
                        <img className='icon' src={Assets.ICON_RIGHT_ARROW}></img>
                        </div>
                </div>
            </div>
        );
    }
}

export default PropertyOffers;