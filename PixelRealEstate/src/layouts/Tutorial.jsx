import React, { Component } from 'react'
import {Contract, ctr, LISTENERS} from '../contract/contract.jsx';
import {Modal, Button, Header, ModalContent, ModalActions, Icon} from 'semantic-ui-react';
import * as Strings from '../const/strings';
import * as Func from '../functions/functions';
import {GFD, GlobalState, TUTORIAL_STATE} from '../functions/GlobalState';
import Info from './ui/Info';

class Tutorial extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tutorialState: TUTORIAL_STATE.NONE,
        };
    }

    componentDidMount() {
        GFD.listen('tutorialStateIndex', 'tutorial', (newID) => {
            let newState = TUTORIAL_STATE[Object.keys(TUTORIAL_STATE)[newID]];
            this.setState({tutorialState: newState})
            Func.ScrollTo(Func.PAGES.TOP);
        });
    }

    tutorialGoBack() {
        GFD.setData('tutorialStateIndex', -1);
    }

    tutorialGoNext() {
        GFD.setData('tutorialStateIndex', 1);
    }

    render() {
        return (
            <div className='tutorialContainer'>
                <Modal id='tutorialDimmer' className={'tutorialDimmer' + this.state.tutorialState.className} open={this.state.tutorialState.index != 0} basic size='small'>
                    <Header icon='help circle' content='Tutorial' />
                    <ModalContent>
                        {Strings.TUTORIAL[this.state.tutorialState.index].map((str, i) => (
                            <div key={i}>{str}</div>
                        ))}
                    </ModalContent>
                    <ModalActions>
                        <Button basic inverted onClick={() => this.tutorialGoBack()}>
                        <Icon name='arrow left' /> {this.state.tutorialState.index == 1 ? 'Quit Tutorial' : 'Back'}
                        </Button>
                        {this.state.tutorialState.showNext && 
                            <Button color='green' inverted onClick={() => this.tutorialGoNext()}>
                                <Icon name='arrow right' /> Next
                            </Button>
                        }
                    </ModalActions>
                </Modal>
            </div>
        );
    }
}

export default Tutorial