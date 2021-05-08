import React, { Component } from 'react';

export const ADVANCED_MODE_INTRO_RIGHT = "Welcome to PixelProperty! This is some text for you advanced users.";
export const SIMPLE_MODE_INTRO_RIGHT = "Welcome to PixelProperty!";

export const FORM_BUY = ["Purchase Properties currently for sale.", 
    "Initial Properties can be purchased with ETH or PXL, while user Properties may be purchased with only PXL."];
export const FORM_SELL = ["Sell a property for PXL here.", 
    "A property stays on the market until you take it off, or it is purchased."];
export const FORM_CANCEL_SELL = ["Delist this property from the market.", 
    "The property may be reoffered on the market afterwards."];
export const FORM_SET_PRIVATE = ["Set this property to private use for 1 PXL per minute.", 
    "Only you will be able to change the artwork of this Property. You will not earn any PXL while this property is private. Setting a Property back to public will refund the rest of the PXL despoitied for private use."];
export const FORM_SET_PUBLIC = ["Set this Property to public and refund the rest of the desposited PXL.", 
    "Anyone will be able to change the artwork, and you may earn PXL when changed. A property cannot be set public if another user has temporarily resered it by changing the artwork."];
export const FORM_SET_LINK = ["Sets a visitable link for all your owned Properties.", 
    "Users can click on your properties to visit this website. The maximum length is 64 characters."];
export const FORM_SET_TEXT = ["Sets a phrase for all your owned Properties.", 
    "Users will see this phrase when inspecting one of your Properties. The maximum length is 64 characters."];
export const FORM_SET_IMAGE = ["Updates the artwork of this property and earns you PXL.", 
    "If the Property has an owner, the owner will be paid an equal amount of PXL as the user. Spending additional PXL will increase the maximum payout and reserve time of this Property."];
export const FORM_TRANSFER = ['Send PXL from your address to another address.'];
export const FORM_TRANSFER_PROPERTY = ["Transfer this Property to another address.", 
    "Make sure the recipient address is correct, or the Property is unclaimable."];
export const FORM_BID = ["Place a bid offer on this Property.", 
    "Bids cost 1 PXL, but does not offer any PXL to the Property owner. Bids only notify the owner of your potential offer, trades must still be done through the market."];
export const TUTORIAL_START_DIALOG = ["Pixel Property is easy to use. Just in case, we've prepared a quick tutorial on how to get started.", 
    "If you'd like to skip it now, the tutorial can be accessed again from the bottom of the page."];

export const CHANGELOG = [
    {
        date: new Date('2018-5-16'),
        title: 'PXL Token Update',
        messages: 
        ['Token contract updates to be compliant with other MyEtherDelta and other Ethereum services.',
        <div style={{display: 'inline'}}><span style={{color: 'red'}}>IMPORTANT! </span>Old artwork on the canvas previous to this update will not trigger PXL payouts until the art is changed.</div>],
    },
    {
        date: new Date('2018-5-8'),
        title: 'Bugfixes',
        messages: 
        ['Hotfix for users who do not have MetaMask sometimes freezing.'],
    },
    {
        date: new Date('2018-5-7'),
        title: 'Send PXL & GIF Generator',
        messages: 
        ['Send PXL to another Ethereum address easily.',
        'Anyone can now generate a GIF of PixelProperty in any location over any timespan!'],
    },
    {
        date: new Date('2018-5-3'),
        title: 'Beta Updates #1',
        messages: 
        ['Transactions taking a longer time do not report errors.',
        'Estimated gas is better calculated.'],
    },
    {
        date: new Date('2018-5-1'),
        title: 'Beta Release!',
        messages: 
        ['PixelProperty is released to the Ethereum network.',
        'Event and log server storage and other client improvements.',
        'Refresh button on PXL balance.'],
    },
    {
        date: new Date('2018-4-25'),
        title: 'General Fixes & Updates',
        messages: 
        ['Loading property log data correctly. Minor speed improvements.'],
    },
    {
        date: new Date('2018-4-24'),
        title: 'Ease of Use Updates #2',
        messages: 
        ['Multi property uploading! Up to a max of 5x5 properties (50 pixels x 50 pixels).', 
        'Interface simplified.',
        'Support for smaller monitors.'],
    },
    {
        date: new Date('2018-4-13'),
        title: 'Ease of Use Updates',
        messages: 
        ['Explenation on how to setup to use PixelProperty in the Get Started section.', 
        'Major speed optimizations'],
    },
    {
        date: new Date('2018-4-10'),
        title: 'Pre-Release Testing',
        messages: 
        ['Live on the Rinkeby test network!', 
        'Change your MetaMask network from "Main" to "Rinkeby" to begin testing.', 
        <p style={{display: 'inline'}}>You'll need funds from the Rinkeby faucet at: <a href="https://www.rinkeby.io/#faucet" target='_blank'>Rinkeby.io</a></p>],
    }
];

export const ADDRESSES = [
    
];

export const TUTORIAL = [
    [''],
    ['Welcome to pixel property!', 'This is the Pixel Canvas, live from Ethereum! Clicking on a Property will display its details.'],
    ['You selected a Property!', 'When clicking the canvas, the inspector will display all details about the Property. These include who owns it, if it’s for sale & how much, if it’s currently editable, and the expected PXLs earned by the last artist.'],
    ['Use these inspector buttons to interact with the currently inspected property. Some Properties have different actions depending on their current state.', 'Click on “Update Image” to learn how to upload artwork.'],
    ['Updating the artwork of a Property will temporarily lock it in place as private. After the private mode is up, the artwork will stay until a user changes it again. Longer lasting artwork is awarded more PXL.'],
    ['PXL allows you to purchase Properties on the canvas.', 'Properties you own can be used to earn passive PXL, or kept private for only your artwork. Owners are also able to advertise a website and phrase of their choosing on all their Properties.'],
    ['Looks like you’re ready to start!', 'If looking for more info, each inspector action explains what they do in more detail.', <div>Additional details are on our <a target='_blank' href="https://pixelproperty.io/faq.html">Frequently Asked Questions</a> page.</div>],
    [<div>Looks like you’re almost ready! In order to begin, you must have the <a target='_blank' href="https://metamask.io/">MetaMask Browser Extension</a> setup.</div>, 'MetaMask secures your PixelProperty data by storing your sensitive info in an encrypted storage.', 'If looking for more info, each inspector action explains what they do in more detail. Additional details are on our <a href="https://pixelproperty.io/faq.html">Frequently Asked Questions</a> page.']
];

