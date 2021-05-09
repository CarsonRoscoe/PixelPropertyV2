
export const PropertyColorUpdate = {
    id: 'PropertyColorUpdate',
    eventAbi: 'PropertyColorUpdate(uint24, uint256[10], uint256, address)',
};                     //;
export const SetUserHoverText = {
    id: 'SetUserHoverText',
    eventAbi:'SetUserHoverText(address, bytes32[2])',
};
export const SetUserSetLink = {
    id: 'SetUserSetLink',
    eventAbi: 'SetUserSetLink(address, bytes32[2])',
};
export const PropertyBought = {
    id: 'PropertyBought',
    eventAbi: 'PropertyBought(uint24, address)',
};
export const PropertySetForSale = {
    id: 'PropertySetForSale',
    eventAbi: 'PropertySetForSale(uint24, uint256)',
};
export const DelistProperty = {
    id: 'DelistProperty',
    eventAbi: 'DelistProperty(uint24)',
};
export const SetPropertyPublic = {
    id: 'SetPropertyPublic',
    eventAbi: 'SetPropertyPublic(uint24)',
};
export const SetPropertyPrivate = {
    id: 'SetPropertyPrivate',
    eventAbi: 'SetPropertyPrivate(uint24, uint32)',
};
export const Bid = {
    id: 'Bid',
    eventAbi: 'Bid(uint24, uint256)',
};
export const AccountChange = 'AccountChange';                                 //(newaccount)  -  not a contract event.

//token events
export const Transfer = {
    id: 'Transfer',
    eventAbi: 'Transfer(address, address, uint256)',
};
export const Approval = {
    id: 'Approval',
    eventAbi: 'Approval(address, address, uint256)',
};