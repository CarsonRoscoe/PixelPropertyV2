import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../../contract/contract.jsx';
import * as Func from '../../functions/functions';
import {GFD, GlobalState} from '../../functions/GlobalState';
import { Slider } from 'react-semantic-ui-range';
import * as Strings from '../../const/strings';
import * as Assets from '../../const/assets';
import Info from '../ui/Info';
import {TUTORIAL_STATE} from '../../functions/GlobalState';
import { Form, Button, Message, ModalActions, Modal, Grid, Image, ModalContent, Statistic, Icon, ModalHeader, Checkbox, Label, Input, FormInput, GridRow, GridColumn } from 'semantic-ui-react';
import {FB, FireBase} from '../../const/firebase';
import * as EVENTS from '../../const/events';
import * as Const from '../../const/const';
import ErrorBox from '../ErrorBox';
import {SDM, ServerDataManager} from '../../contract/ServerDataManager';

const REFERRAL_BASE_URL = 'https://canvas.pixelproperty.io/?referral=';

class ReferralForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            copied: false,
            referralLink: '',
            wallet: '',
            earnedPXL: 0,
            exampleReferrees: 100,
            exampleTotalPXLEarned: 0,
            examplePXLEarnedEach: 0,

            PXLPending: 0,
            referredUsers: 0,
        };

        //referral link input ref
        this.referralInput = null;
    }

    componentWillReceiveProps(newProps) {
        this.setState({referralAddress: newProps.referralAddress});
    }

    componentDidMount() {
        ctr.getAccount((acc) => {
            if (!GFD.getData('noAccount') && acc != null)   {
                let accAddress = acc.address;
                this.setState({
                    wallet: accAddress,
                    referralLink: REFERRAL_BASE_URL + accAddress,
                });
                this.listenForReferrals(accAddress);
            }
            ctr.listenForEvent(EVENTS.AccountChange, 'SignUpForm', (data) => {
                this.setState({
                    wallet: data,
                    referralLink: REFERRAL_BASE_URL + data,
                });
                this.listenForReferrals(data);
            });
            this.updateExampleSlider(this.state.exampleReferrees);
        })
    }

    componentWillUnmount() {
        this.stopListeningForReferrals();
    }

    copyReferralLink() {
        let refElement = document.getElementById('referralInput');
        refElement.select();
        document.execCommand("copy");
        this.setState({copied: true});
    }

    updateExampleSlider(exampleReferrees) {
        let exampleTotalPXLEarned = 0;
        for (let i = 0; i < exampleReferrees; i++) {
            exampleTotalPXLEarned += Math.ceil(10 + (i / 25));
        }
        let examplePXLEarnedEach = exampleTotalPXLEarned / exampleReferrees;
        this.setState({
            exampleReferrees,
            exampleTotalPXLEarned,
            examplePXLEarnedEach: (isNaN(examplePXLEarnedEach) ? 0 : examplePXLEarnedEach),
        });
    }

    listenForReferrals(wallet = this.state.wallet) {
        FB.watchReferrals(wallet, (refers) => {
            this.setState({referredUsers: refers.exists() ? refers.val() : 0});
        }, (earned) => {
            this.setState({PXLPending: earned.exists() ? earned.val() : 0});
        });
    }

    stopListeningForReferrals() {
        FB.stopListeningForReferrals();
    }

    render() {
        return ( 
            <Modal size='tiny' 
                closeIcon 
                trigger={<Button fluid>Referral Rewards</Button>}
            >
                <ModalContent>  
                    <Grid>
                        <GridRow width={16}>
                            <GridColumn width={3}>
                                <Image src={Assets.TOKEN}/>
                            </GridColumn>
                            <GridColumn width={13} style={{margin: 'auto', textAlign: 'center'}}>
                                <h1 style={{margin: 'auto'}}>Referral Rewards</h1>
                            </GridColumn>
                        </GridRow>
                    </Grid>
                    <Message>
                        The PixelProperty Referral system rewards you for inviting new users to the canvas.  
                        Referring users increases your rewards multiplier.  
                        Users must register in order for a referral to be valid.
                        Pending PXL is sent to your account every 24 hours.
                        <br/>
                        <br/>
                        Referral rewards after {Func.NumberWithCommas(this.state.exampleReferrees)} users referred: {Func.NumberWithCommas(this.state.exampleTotalPXLEarned)} PXL.
                        <br/>
                        ({Func.NumberWithCommas(this.state.examplePXLEarnedEach.toFixed(2))} PXL per referred user)
                    </Message>
                    <FormInput
                        fluid
                        min={0}
                        max={10000}
                        type='range'
                        step={10}
                        value={this.state.exampleReferrees}
                        onChange={(e) => this.updateExampleSlider(e.target.value)}
                    />
                    <Statistic.Group style={{margin: '1em -1.5em 1em'}}>
                        <Statistic style={{margin: '1em 0px', width: '50%'}}>
                        <Statistic.Value>
                            <Image src={Assets.TOKEN} style={{margin: '0px 8px', display: 'inline-block'}}/>
                            {Func.NumberWithCommas(this.state.PXLPending)}
                        </Statistic.Value>
                        <Statistic.Label>Pending Rewards</Statistic.Label>
                        </Statistic>
                        <Statistic style={{margin: '1em 0px', width: '50%'}}>
                        <Statistic.Value>
                            <Icon name='user plus'/>
                            {Func.NumberWithCommas(this.state.referredUsers)}
                        </Statistic.Value>
                        <Statistic.Label>Users Referred</Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                    <Form>
                        <Form.Field>
                            <Label pointing='below'>Your referral link. {this.state.copied ? ' Copied!' : ''}</Label>
                            <Input 
                                id='referralInput'
                                fluid
                                value={this.state.referralLink}
                                action={<Button onClick={() => this.copyReferralLink()}>Copy</Button>}
                            />
                        </Form.Field>
                    </Form>
                </ModalContent>
            </Modal>
        );
    }
}

export default ReferralForm