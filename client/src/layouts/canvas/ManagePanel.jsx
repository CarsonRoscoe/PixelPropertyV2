import React, { Component } from 'react'
import PixelDescriptionBox from '../ui/PixelDescriptionBox.jsx';
import PropertiesOwned from '../ui/PropertiesOwned.jsx';
import Pullout from '../ui/Pullout';
import PulloutTab from '../ui/PulloutTab';
import * as Assets from '../../const/assets.jsx';
import PropertiesForSale from '../ui/PropertiesForSale';
import PropertyBids from '../ui/PropertyBids';

class ManagePanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className='contractAction'>
                    <Pullout side='left' >
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Inspect'>
                            <PixelDescriptionBox/>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Owned'>
                            <PropertiesOwned/>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Property Market'>
                            <PropertiesForSale/>
                        </PulloutTab>
                        <PulloutTab icon={Assets.ICON_MONEY} tabName='Property Bids'>
                            <PropertyBids/>
                        </PulloutTab>
                    </Pullout>
                </div>
            </div>
        );
    }
}

export default ManagePanel



/*

<div className='contractAction'>
                    <PixelsOwned/>
                </div>
                <div className='contractAction'>
                    <PixelsRented/>
                </div>
                <div className='contractAction'>
                    <PixelsForSale/>
                </div>
                <div className='contractAction'>
                    <PixelsForRent/>
                </div>
                */