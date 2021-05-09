import React, { Component } from 'react'
import Canvas from './Canvas.jsx'
import * as EVENTS from '../../const/events';
import { Contract, ctr, LISTENERS } from '../../contract/contract.jsx';
import ErrorBox from '../ErrorBox';
import ZoomCanvas from './ZoomCanvas';
import Axios from '../../network/Axios.jsx';
import { SDM, ServerDataManager } from '../../contract/ServerDataManager.jsx';
import HoverLabel from './HoverLabel';
import { GFD, GlobalState, TUTORIAL_STATE } from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import * as Assets from '../../const/assets';
import ClickLoader from '../ui/ClickLoader';
import PixelDescriptionBox from '../ui/PixelDescriptionBox';
import PropertyChangeLogYou from '../logs/PropertyChangeLogYou';
import PropertyChangeLog from '../logs/PropertyChangeLog';
import PropertySalesLogYou from '../logs/PropertySalesLogYou';
import PropertySalesLog from '../logs/PropertySalesLog';
import PropertySalesLogTopPXL from '../logs/PropertySalesLogTopPXL';
import PropertySalesLogTopETH from '../logs/PropertySalesLogTopETH';
import Info from '../ui/Info';
import {
    Segment, SegmentGroup, Button, Divider, Label,
    LabelDetail, Input, Icon, Item, ItemContent, ItemImage, Message, List,
    ItemGroup, Tab, Header, Grid, Sidebar, MenuItem, TabPane, Menu, Checkbox, Popup, Modal, ModalContent, ModalHeader, GridRow, GridColumn, ButtonGroup
} from 'semantic-ui-react';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import PropertiesOwned from '../ui/PropertiesOwned';
import PropertiesForSale from '../ui/PropertiesForSale';
import PropertyChangeLogTop from '../logs/PropertyChangeLogTop';
import Tutorial from '../Tutorial';
import WelcomeSidebar from '../ui/WelcomeSidebar';
import ChangeLog from '../ui/ChangeLog';
import Chat from '../ui/Chat';
import { FB, FireBase } from '../../const/firebase';
import GetStarted from '../GetStarted';
import * as Func from '../../functions/functions';
import ViewTimelapse from '../forms/ViewTimelapse';
import PXLBalanceItem from '../ui/PXLBalanceItem';
import PixelDescriptionBoxSimple from '../ui/PixelDescriptionBoxSimple';
import ReferralForm from '../forms/ReferralForm';
import AdminPanel from '../forms/AdminPanel';

class CanvasPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pixelDataUpdateVersion: 0,
            pixelData: null,
            loadingPPC: true,
            PPCOwned: 0,
            advancedMode: false,
            showPopertiesForSale: false,
            askForTutorial: false,
            tutorialState: TUTORIAL_STATE.NONE,

            user: {},

            tab1Loading: false,
            tab2Loading: false,
        }
    }

    updateBalance() {
        this.setState({ loadingPPC: true });
        ctr.getBalance((balance) => {
            GFD.setData('balance', balance);
            this.setState({ PPCOwned: balance, loadingPPC: false });
        });
    }

    componentDidMount() {
        GFD.listen('tutorialStateIndex', 'CanvasPage', (newID) => {
            this.setState({ tutorialState: TUTORIAL_STATE[Object.keys(TUTORIAL_STATE)[newID]] })
        });

        GFD.listen('ServerDataManagerInit', 'CanvasPage', (initState) => {
            if (initState > 1) {
                this.updateBalance();
            }
            if (initState >= 2 && GFD.getData('userExists')) {
                this.changeMode(true);
            }
        });

        GFD.listen('user', 'CanvasPage', (user) => {
            this.setState({user});
        });

        let caller = this;
        this.setState({ eventHandleTransfer: ctr.watchEventLogs(EVENTS.Transfer, {}, (_from, _to, _value, event) => {
                if (_from === ctr.account || _to === ctr.account) {
                    caller.updateBalance();
                }
            }),
        });

        ctr.listenForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener', (data) => {
            FB.signIn();
            ctr.updateNetwork();
            this.updateBalance();
        });

        this.setState({ eventHandleBought: ctr.watchEventLogs(EVENTS.PropertyBought, { newOwner: ctr.account }, (property, newOwner, ethAmount, PXLAmount, timestamp, oldOwner, event) => {
                caller.updateBalance();
            }),
        });
        this.setState({ eventHandle:
            ctr.watchEventLogs(EVENTS.PropertyColorUpdate, { lastUpdaterPayee: ctr.account }, (propertyId, colorsArray, lastUpdateTimestamp, lastUpdaterPayeeAddress, becomesPublicTimestamp, rewardedCoinsAmount, event) => {
                caller.updateBalance();
            }),
        });
        GFD.listen('advancedMode', 'CanvasPage', (advancedMode) => {
            this.setState({ advancedMode });
            this.updateBalance();
        });
        this.updateScreen();
        window.onresize = (ev) => this.updateScreen;
        if (localStorage.getItem('startInAdvancedMode')) {
            this.setState({ advancedMode: true });
            localStorage.removeItem('startInAdvancedMode');
            localStorage.removeItem('hideAdvancedModeDialog');
        }
    }

    updateScreen() {
        let width = document.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        GFD.setData('screenWidth', width);
        GFD.setData('screenHeight', document.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
    }

    componentWillUnmount() {
        this.state.eventHandleTransfer.stopWatching();
        this.state.eventHandleBought.stopWatching();
        this.state.eventHandleUpdate.stopWatching();
        GFD.closeAll('CanvasPage');
        ctr.stopListeningForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener');
    }

    visitPortfolio() {
        this.portfolioLink.click();
    }

    visitTelegram() {
        this.telegramLink.click();
    }

    changeMode(newMode = !this.state.advancedMode) {
        if (newMode)
            ctr.getAccount();
        GFD.setData('advancedMode', newMode);
        this.setState({ advancedMode: newMode, askForTutorial: false })
    }

    toggleForSaleProperties(e, data) {
        this.setState({ showPopertiesForSale: data.checked });
        ctr.sendResults(LISTENERS.ShowForSale, { show: data.checked });
    }

    startTutorial() {
        GFD.setData('tutorialStateIndex', 1);
        this.changeMode(true);
    }

    render() {
        let browsePanes = [
            {
                menuItem: 'Owned',
                render: () => <TabPane
                    as='div'
                    className='topPane'
                    loading={this.state.tab1Loading}
                ><PropertiesOwned
                        isLoading={(r) => this.setState({ tab1Loading: r })}
                    /></TabPane>
            },
            {
                menuItem: 'For Sale',
                render: () => <TabPane
                    as='div'
                    className='topPane'
                    loading={this.state.tab2Loading}
                ><PropertiesForSale
                        isLoading={(r) => this.setState({ tab2Loading: r })}
                    /></TabPane>
            }];

            let chatAndLog = [
                {
                    menuItem: 'Chat',
                    render: () => <TabPane
                        as='div'
                        className='topPane'
                    >
                        <Chat style={{height: '434px'}}/>
                    </TabPane>
                },
                {
                    menuItem: 'Change Log',
                    render: () => <TabPane
                        as='div'
                        className='topPane'
                        loading={this.state.tab2Loading}
                    >
                        <ChangeLog/>
                    </TabPane>
                }];

        let payoutPanes = [
            { menuItem: 'Top 10', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLogTop /></TabPane> },
            { menuItem: 'Recent', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLog /></TabPane> },
            { menuItem: 'You', render: () => <TabPane className='middlePane' attached={false}><PropertyChangeLogYou /></TabPane> }
        ];

        let tradePanes = [
            { menuItem: 'Top 10 PXL', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLogTopPXL /></TabPane> },
            { menuItem: 'Top 10 ETH', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLogTopETH /></TabPane> },
            { menuItem: 'Recent', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLog /></TabPane> },
            { menuItem: 'You', render: () => <TabPane className='bottomPane' attached={false}><PropertySalesLogYou /></TabPane> }
        ];

        return (
            <div>
                <SegmentGroup horizontal className='mainSegmentGroup'>
                    <Segment className='leftContainer'>
                        <div id='logo' className='logo'>
                            <img src={Assets.LOGO_BETA} />
                        </div>
                        <Divider />
                        <ZoomCanvas />
                        <Divider />
                        <Grid>
                            <GridRow width={16}>
                                <GridColumn width={8}>
                                    <Button onClick={() => this.visitPortfolio()} fluid>PixelProperty.io</Button>
                                    <a
                                        href='https://pixelproperty.io/'
                                        target='_blank'
                                        className='hideElement'
                                        ref={(portfolioLink) => { this.portfolioLink = portfolioLink; }}
                                    />
                                </GridColumn>
                                <GridColumn width={8}>
                                    <Button style={{width: '100%'}} onClick={() => this.visitTelegram()} content='Telegram' icon='telegram' labelPosition='right' />
                                    <a
                                        href='https://web.telegram.org/#/im?p=@pixelpropertyio'
                                        target='_blank'
                                        className='hideElement'
                                        ref={(telegramLink) => { this.telegramLink = telegramLink; }}
                                    />
                                </GridColumn>
                            </GridRow>
                        </Grid>
                        <Divider />

                        {!this.state.advancedMode &&
                            <Button
                                className='modeButton'
                                primary={!this.state.advancedMode}
                                onClick={() => { this.changeMode() }}
                                fluid
                                size={this.state.advancedMode ? 'medium' : 'massive'}
                            >
                                {this.state.advancedMode ? 'Viewing Mode' : <div>Become a Member</div>}
                            </Button>}
                        {!this.state.advancedMode && <Divider />}
                        {this.state.advancedMode &&
                            <div>
                                <Grid columns='2' divided>
                                    <GridRow>
                                        <GridColumn width={16}>
                                            <PXLBalanceItem showSend/>
                                        </GridColumn>
                                    </GridRow>
                                    <GridRow>
                                        <GridColumn stretched width={8}>
                                            <SetHoverText />
                                        </GridColumn>
                                        <GridColumn stretched width={8}>
                                            <SetLink />
                                        </GridColumn>
                                    </GridRow>
                                </Grid>
                                <Divider />
                                <Checkbox
                                    label={'Show Properties for sale'}
                                    checked={this.state.showPopertiesForSale}
                                    onChange={(e, data) => { this.toggleForSaleProperties(e, data) }}
                                />
                                <Divider />
                                <Grid>
                                    <GridRow width={16}>
                                        <GridColumn width={8}>
                                            <ViewTimelapse/>
                                        </GridColumn>
                                        <GridColumn width={8}>
                                            <ReferralForm/>
                                        </GridColumn>
                                    </GridRow>
                                </Grid>
                            </div>
                        }
                        <GetStarted
                            advancedMode={this.state.advancedMode}
                            changeMode={() => { this.changeMode() }}
                        />
                    </Segment>
                    <Segment id='step1' className={'centerContainer ' + TUTORIAL_STATE.getClassName(this.state.tutorialState.index, 1)}>
                        <HoverLabel showPrices={this.state.showPopertiesForSale} />
                        {this.state.tutorialState.index == 0 && <ClickLoader />}
                        <Canvas />
                    </Segment>
                    <Segment id={(this.state.tutorialState.index == 3 ? 'hiddenForward' : '')} className={'rightContainer ' + TUTORIAL_STATE.getClassName(this.state.tutorialState.index, 2) + (this.state.tutorialState.index == 3 ? ' hiddenForward' : '')}>
                        <WelcomeSidebar />
                        {this.state.advancedMode ?
                            <PixelDescriptionBox />
                            :
                            <PixelDescriptionBoxSimple/>
                        }
                    </Segment>
                </SegmentGroup>
                <Grid 
                    stretched
                    className={(this.state.advancedMode ? 'chatAndBrowseSegment' : 'chatAndBrowseSegment hideElement')}
                >
                    <GridRow
                    style={{ margin: 0}} 
                    >
                        <GridColumn width={6}>
                            <Segment className='chatAndLogs'>
                                <Tab menu={{ secondary: true, pointing: true }} panes={chatAndLog} />
                            </Segment>
                        </GridColumn>
                        <GridColumn width={10} style={{paddingLeft: 0}}>
                            <Segment className='browse'>
                                <Header>Property Browse</Header>
                                <Tab menu={{ secondary: true, pointing: true }} panes={browsePanes} />
                            </Segment>
                        </GridColumn>
                    </GridRow>
                </Grid>
                <Segment className={(this.state.advancedMode ? 'lowerSegment two' : 'lowerSegment two hideElement')}>
                    <div>
                        <Header>Payout History</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={payoutPanes} />
                    </div>
                </Segment>
                <Segment className={(this.state.advancedMode ? 'lowerSegment three' : 'lowerSegment three hideElement')}>
                    <div>
                        <Header>Trade History</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={tradePanes} />
                    </div>
                </Segment>
                <Sidebar id='footer' className='footer' as={Menu} animation='push' direction='bottom' visible inverted>
                    <MenuItem name='file text outline' onClick={() => {
                        window.open("https://www.pixelproperty.io/privacy-policy.html", "_self");
                    }}>
                        <Icon name='file text outline' />
                        Privacy Policy
                    </MenuItem>
                    <MenuItem name='file text outline' onClick={() => {
                        window.open("https://www.pixelproperty.io/terms-of-service.html", "_self");
                    }} >
                        <Icon name='file text outline' />
                        TOS
                    </MenuItem>
                    <MenuItem name='file text outline' onClick={() => {
                        this.startTutorial();
                    }}>
                        <Icon name='help circle' />
                        Tutorial
                    </MenuItem>
                    {this.state.user != null && this.state.user.isAdmin &&
                        <AdminPanel/>
                    }
                </Sidebar>
                <Tutorial />
            </div>
        );
    }
}

export default CanvasPage