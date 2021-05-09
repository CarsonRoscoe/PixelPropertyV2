import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import * as Strings from '../../const/strings';
import { Segment, Header, Image , Button, Message, Form, List, Divider, Statistic} from 'semantic-ui-react';
import * as Assets from '../../const/assets';
import SignUpForm from '../forms/SignUpForm';
import browser from 'browser-detect';
import PixelDescriptionBoxSimple from './PixelDescriptionBoxSimple';

const _rel = 1525194000000;
const RELEASE_DATE = new Date(_rel);
const FREE_SET_PERIOD = new Date(_rel + (3*24*60*60*1000));

const stats = {
    margin: '15px auto', 
    width: '100%'
};

class WelcomeSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timerUpdater: null,
            releaseCounter: 0,
            freeSetCounter: new Date(_rel),
            days: 0,
            hours: 0,
            minutes: 0,
            browser: {name: ''},
            useLocalData: false,
            advancedMode: false,
        };
    }

    componentWillMount() {
        this.timerUpdate();
        this.timerUpdater = setInterval(() => this.timerUpdate(), 1000);
        this.setState({
            browser: browser(),
        });
        GFD.listen('useLocalData', 'welcomeSidebar', (useLocalData) => {
            if (this.state.useLocalData && !useLocalData)
                location.reload();
            this.setState({useLocalData});
        })
        GFD.listen('advancedMode', 'welcomeSidebar', (advancedMode) => {
            this.setState({advancedMode});
        })
    }

    componentWillUnmount() {
        if (this.timerUpdater != null)
            clearInterval(this.timerUpdater);
        GFD.closeAll('welcomeSidebar');
    }

    timerUpdate() {
        let timeLeft = _rel - new Date().getTime();
        let days = Math.floor(timeLeft / (24*60*60*1000));
        timeLeft = timeLeft % (24*60*60*1000);
        let hours = Math.floor(timeLeft / (60*60*1000));
        timeLeft = timeLeft % (60*60*1000);
        let minutes = Math.floor(timeLeft / (60*1000));
        timeLeft = timeLeft % (60*1000);
        let seconds = Math.floor(timeLeft / 1000);
        this.setState({
            releaseCounter: Func.TimeSince(RELEASE_DATE, true),
            freeSetCounter: Func.TimeSince(FREE_SET_PERIOD, true),
            days, hours, minutes, seconds
        })
    }

    render() {
        return (
            <div>
                {(this.state.browser.name !== 'chrome') && !this.state.advancedMode &&
                    <Message color='red'>
                        It is recommended to use Chrome while PixelProperty is in Beta. We apologize for the inconvenience.
                    </Message>
                }
                {this.state.useLocalData && 
                    <Message color='red'>
                        Sorry! We're currently doing maintenance, some features of the canvas will not be useable.
                    </Message>
                }
            </div>
        );
    }
}

export default WelcomeSidebar
/*
 <Statistic style={stats}>
                        <Statistic.Value>{this.state.freeSetCounter}</Statistic.Value>
                        <Statistic.Label>Bonus PXL Period</Statistic.Label>
                    </Statistic>
                    <Statistic style={stats}>
                        <Statistic.Value>22</Statistic.Value>
                        <Statistic.Label>Tasks</Statistic.Label>
                    </Statistic>
*/

/*

<Message className='message' id='message'>
    <Message.Header size='large'>
        Change Log
    </Message.Header>
    <Divider/>
    <Message.Content>
        <List divided relaxed>
        {Strings.CHANGELOG.map((log, i) => {
            return (
                <List.Item key={i} as='li' value='*'>{log.title + ' - ' + log.date.toDateString()}
                    <List.Item as='ol'>
                    {log.messages.map((msg, ii) => {
                        return (<List.Item key={ii} as='li' value='-'>{msg}</List.Item>);
                    })}
                    </List.Item>
                </List.Item>
            );
        })}
        </List>
    </Message.Content>
</Message>

*/