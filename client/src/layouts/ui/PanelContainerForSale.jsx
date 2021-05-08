import React, { Component } from 'react'
import {Panel, PanelItem, PanelPropertyCanvas, PanelDivider} from './Panel';
import PanelContainer from './PanelContainer';
import Timestamp from 'react-timestamp';
import Hours from '../ui/Hours';
import {SegmentGroup, Segment, Label, LabelDetail, Divider, Grid, GridRow, GridColumn, List, ListItem, ListContent, ListHeader, Button } from 'semantic-ui-react';
import * as Func from '../../functions/functions';

class PanelContainerForSale extends PanelContainer {
    constructor(props) {
        super(props);
        this.state = {
            dataView: [],
            placeholder: [],
        }
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
                                        <PanelPropertyCanvas x={child.x} y={child.y} width={50} imageData={child.imageData}/>
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
                                        <ListHeader>PXL</ListHeader>
                                        <ListContent>{Func.NumberWithCommas(child.PPCPrice)}</ListContent>
                                    </ListItem>
                                    {child.ETHPrice != 0 && 
                                        <ListItem>
                                        <ListHeader>ETH</ListHeader>
                                        <ListContent>{Func.WeiToEth(child.ETHPrice)}</ListContent>
                                        </ListItem>
                                    }
                                </List>
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
export default PanelContainerForSale