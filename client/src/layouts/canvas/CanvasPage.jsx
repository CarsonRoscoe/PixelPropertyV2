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
    LabelDetail, Input, Icon, Item, ItemContent, ItemImage,
    ItemGroup, Tab, Header, Grid, Sidebar, MenuItem, TabPane, Menu, Checkbox, Popup, Modal, ModalContent, ModalHeader, GridRow, GridColumn
} from 'semantic-ui-react';
import SetHoverText from '../forms/SetHoverText';
import SetLink from '../forms/SetLink';
import PropertiesOwned from '../ui/PropertiesOwned';
import PropertiesForSale from '../ui/PropertiesForSale';
import PropertyChangeLogTop from '../logs/PropertyChangeLogTop';
import Tutorial from '../Tutorial';
import WelcomeSidebar from '../ui/WelcomeSidebar';
import { FB, FireBase } from '../../const/firebase';
import GetStarted from '../GetStarted';
import * as Func from '../../functions/functions';
import ViewTimelapse from '../forms/ViewTimelapse';
import PXLBalanceItem from '../ui/PXLBalanceItem';

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
        });

        ctr.watchEventLogs(EVENTS.Transfer, {}, (handle) => {
            let eventHandleTransfer = handle;
            this.setState({ eventHandleTransfer });
            eventHandleTransfer.watch((error, log) => {
                if (log.args._from === ctr.account || log.args._to === ctr.account) {
                    this.updateBalance();
                }
            });
        });

        ctr.listenForEvent(EVENTS.AccountChange, 'CanvasPagePPCListener', (data) => {
            FB.signIn();
            ctr.updateNetwork();
            this.updateBalance();
        });

        ctr.watchEventLogs(EVENTS.PropertyBought, { newOwner: ctr.account }, (handle) => {
            let eventHandleBought = handle;
            this.setState({ eventHandleBought });
            eventHandleBought.watch((error, log) => {
                this.updateBalance();
            });
        });

        ctr.watchEventLogs(EVENTS.PropertyColorUpdate, { lastUpdaterPayee: ctr.account }, (handle) => {
            let eventHandleUpdate = handle;
            this.setState({ eventHandleUpdate });
            eventHandleUpdate.watch((error, log) => {
                this.updateBalance();
            });
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
        }
    }

    getLogs() {
        console.info('getting logs')
        let allPayees = {};
        ctr.getEventLogs(EVENTS.PropertyColorUpdate, {}, (error, logs) => {
            let i = 0;
            let recall = () => {
                console.info('log', i, ' of ', logs.length)
                if (++i < logs.length)
                    this.getLogs2(allPayees, logs[i]).then(recall);
                else
                    this.getLogs3(allPayees)
            }
            this.getLogs2(allPayees, logs[i]).then(recall);
        },0, 10000000);
    }

    getLogs2(allPayees, log) {
        return new Promise((res, rej) => {
            let payee = log.args.lastUpdaterPayee;
            ctr.getBalanceOf(payee, (bal) => {
                allPayees[payee] = {
                    balance: bal, 
                    owned: [],
                };
            })
            res();
        })
    }

    getLogs3(allPayees) {
        let y = 0;

        console.info('getting props')

        let recall = () => {
            y++;
            console.info('Properties (y): ', y)
            if (y >= 99)
                console.info(allPayees);
            else
                getProp().then(recall);
        }

        let getProp = () => {
            return new Promise((res, rej) => {
                let count = 0;
                for (let x = 0; x < 100; x++) {
                    ctr.getPropertyData(x, y, (data) => {
                        let owner = data[0];
                        if (owner !== '0x0000000000000000000000000000000000000000') {
                            let lastUpdate = Func.BigNumberToNumber(data[3]);
                            let reserved = Func.BigNumberToNumber(data[5]);
                            let maxEarnings = ((reserved - lastUpdate) / 30) * 5;
                            let earnings = Func.calculateEarnings(lastUpdate, maxEarnings);
                            if (allPayees[owner] == null)
                                allPayees[owner] = {balance: 0, owned: []};
                                allPayees[owner].owned.push({x, y});
                        }
                        count++;
                        if (count >= 100)
                            res();
                    });
                }
            });
        }

        getProp().then(recall);
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

    changeMode(newMode = !this.state.advancedMode) {
        if (newMode)
            ctr.getAccounts();
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

    showAskForTutorial() {
        if (this.state.advancedMode || FB.userLoggedIn) {
            this.changeMode();
            return;
        }
        this.setState({ askForTutorial: true });
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
                        <Button onClick={() => this.visitPortfolio()} fluid>Visit PixelProperty.io</Button>
                        <a
                            href='https://pixelproperty.io/'
                            target='_blank'
                            className='hideElement'
                            ref={(portfolioLink) => { this.portfolioLink = portfolioLink; }}
                        />
                        <Divider />

                        {!this.state.advancedMode &&
                            <Button
                                className='modeButton'
                                primary={!this.state.advancedMode}
                                onClick={() => { this.changeMode() }}
                                fluid
                                size={this.state.advancedMode ? 'medium' : 'massive'}
                            >
                                {this.state.advancedMode ? 'Viewing Mode' : 'Get Started'}
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
                                <ViewTimelapse/>
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
                        {this.state.advancedMode ?
                            <PixelDescriptionBox />
                            :
                            <WelcomeSidebar />
                        }
                    </Segment>
                </SegmentGroup>
                <Segment className={(this.state.advancedMode ? 'lowerSegment one' : 'lowerSegment one hideElement')}>
                    <div>
                        <Header>Property Browse</Header>
                        <Tab menu={{ secondary: true, pointing: true }} panes={browsePanes} />
                    </div>
                </Segment>
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
                    <MenuItem position='right' name='settings' onClick={() => { ctr.setupContracts() }}>
                        <Icon name='settings'></Icon>
                    </MenuItem>
                </Sidebar>
                <Tutorial />
            </div>
        );
    }
}

export default CanvasPage