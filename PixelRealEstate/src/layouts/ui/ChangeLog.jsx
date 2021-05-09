import React, { Component } from 'react'
import { Message, List, Divider } from 'semantic-ui-react';
import * as Strings from '../../const/strings';

export default class ChangeLog extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <List celled className='changeLogList'>
                {Strings.CHANGELOG.map((log, i) => {
                    return (
                        <List.Item key={i}>{log.title + ' - ' + log.date.toDateString()}
                            <List.List>
                            {log.messages.map((msg, ii) => {
                                return (<List.Item key={ii}> - {msg}</List.Item>);
                            })}
                            </List.List>
                        </List.Item>
                    );
                })}
            </List>
        );
    }
}




