import React, { Component } from 'react'
import {Panel, PanelItem, PanelPropertyCanvas, PanelDivider} from './Panel';
import PanelContainer from './PanelContainer';
import Timestamp from 'react-timestamp';
import * as Func from '../../functions/functions';
import Hours from '../ui/Hours';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager.jsx';
import {SegmentGroup, Segment, Label, LabelDetail, Divider, Grid, GridRow, GridColumn, List, ListItem, ListContent, ListHeader, Button } from 'semantic-ui-react';

class PanelContainerOwned extends PanelContainer {
    constructor(props) {
        super(props);
        this.state = {
            dataView: [],
            placeholder: [],
        }
    }

    cancelSale(e) {
        e.stopPropagation();
        window.alert("hellode")
    }

    render() {
        return (
            <Grid divided stretched >
                <GridRow columns='equal' stretched>
                    {this.state.dataView.map((child, i) => (
                        <GridColumn key={i}>
                            <Segment className='segmentButton' compact raised onClick={() => {this.props.onClick(child.x + 1, child.y + 1)}}>
                                    <List relaxed celled divided selection={false} size='small'>
                                        <ListItem>
                                            <PanelPropertyCanvas x={child.x} y={child.y} width={50}/>
                                        </ListItem>
                                        <ListItem className='xLabel'>
                                            <ListHeader>X</ListHeader>
                                            <ListContent>{child.x + 1}</ListContent>
                                        </ListItem>
                                        <ListItem className='yLabel'>
                                            <ListHeader>Y</ListHeader>
                                            <ListContent>{child.y + 1}</ListContent>
                                        </ListItem>
                                        <ListItem>
                                            <ListHeader>For Sale</ListHeader>
                                            <ListContent>{!child.isForSale ? 'No' : 
                                                <div>
                                                    {child.PPCPrice ? Func.NumberWithCommas(child.PPCPrice) : null}
                                                </div>
                                        }</ListContent>
                                        </ListItem>
                                        <ListItem>
                                            <ListHeader>Private</ListHeader>
                                            <ListContent>{child.isInPrivate ? 'Yes' : 'No'}</ListContent>
                                        </ListItem>
                                        <ListItem>
                                            <ListHeader>Last Update</ListHeader>
                                            <ListContent>{child.lastUpdate != null && child.lastUpdate > 0 ? <Hours time={child.lastUpdate} /> : 'Never'}</ListContent>
                                        </ListItem>
                                    </List>
                                    {child.isForSale ? 
                                        <Button className='delistButton' fluid size='mini' onClick={(e) => this.cancelSale(e)}>Delist</Button>
                                    : null}
                            </Segment>
                        </GridColumn>
                    ))}
                    {this.state.placeholder.map((child, i) => (
                        <GridColumn key={1000 + i}>
                        </GridColumn>
                    ))}
                </GridRow>
            </Grid>           
        );
    }
}
export default PanelContainerOwned


{/* <div className='panelContainer'>
{this.state.dataView.map((child, i) => (
    <Panel onClick={() => {this.props.onClick(child.x + 1, child.y + 1)}} key={i}>
        <PanelPropertyCanvas x={child.x} y={child.y} width={20} imageData={child.imageData}/>
        <PanelItem width='10%'/>
        <PanelItem width='10%' title data='X:'/>
        <PanelItem width='35%' data={child.x + 1}/>
        <PanelItem width='10%' title data='Y:'/>
        <PanelItem width='15%' data={child.y + 1}/>
        <PanelDivider/>
        <PanelItem width='30%' title data='For Sale'/>
        <PanelItem width='20%' data={child.isForSale ? 'Yes' : 'No'}/>
        {child.isForSale ? <PanelButton width='50%' onClick={() => this.cancelSale()} data='Cancel Sale'/> :null}
        {child.isForSale ? <PanelItem width='40%' title data='PPT Price:'/> :null}
        {child.isForSale ? <PanelItem width='60%' data={child.PPCPrice}/> :null}
        <PanelItem width='30%' title data='Private'/>
        <PanelItem width={child.isForSale ? '20%' : '70%'} data={child.isInPrivate ? 'Yes' : 'No'}/>
        <PanelItem width='50%' title data='Last Update'/>
        <PanelItem width='50%' data={child.lastUpdate != null && child.lastUpdate > 0 ? <Hours time={child.lastUpdate} /> : 'Never'}/>
    </Panel>
))}
</div> */}