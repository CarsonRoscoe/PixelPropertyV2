
export const PropertyColorUpdate = 'PropertyColorUpdate';                     //(uint24 indexed property; uint256[10] colors; uint256 lastUpdate; address lastUpdaterPayee);
export const SetUserHoverText = 'SetUserHoverText';                           //(address indexed user; bytes32[2] newHoverText);
export const SetUserSetLink = 'SetUserSetLink';                               //(address indexed user; bytes32[2] newLink);
export const PropertyBought = 'PropertyBought';                               //(uint24 indexed property;  address newOwner);
export const PropertySetForSale = 'PropertySetForSale';                       //(uint24 indexed property; uint256 forSalePrice);
export const DelistProperty = 'DelistProperty';                               //(uint24 indexed property);
export const SetPropertyPublic = 'SetPropertyPublic';                         //(uint24 indexed property);
export const SetPropertyPrivate = 'SetPropertyPrivate';                       //(uint24 indexed property; uint32 numHoursPrivate);
export const Bid = 'Bid';                                                     //(uint24 indexed property; uint256 bid);
export const AccountChange = 'AccountChange';                                 //(newaccount)  -  not a contract event.

//token events
export const Transfer = 'Transfer';                                           //(address indexed _from; address indexed _to; uint256 _value);
export const Approval = 'Approval';                                           //(address indexed _owner; address indexed _spender; uint256 _value);