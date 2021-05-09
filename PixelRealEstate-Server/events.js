module.exports.PropertyColorUpdate = 'PropertyColorUpdate'; //(uint24 indexed property; uint256[10] colors; uint256 lastUpdate; address lastUpdaterPayee);
module.exports.SetUserHoverText = 'SetUserHoverText'; //(address indexed user; bytes32[2] newHoverText);
module.exports.SetUserSetLink = 'SetUserSetLink'; //(address indexed user; bytes32[2] newLink);
module.exports.PropertyBought = 'PropertyBought'; //(uint24 indexed property;  address newOwner);
module.exports.PropertySetForSale = 'PropertySetForSale'; //(uint24 indexed property; uint256 forSalePrice);
module.exports.DelistProperty = 'DelistProperty'; //(uint24 indexed property);
module.exports.SetPropertyPublic = 'SetPropertyPublic'; //(uint24 indexed property);
module.exports.SetPropertyPrivate = 'SetPropertyPrivate'; //(uint24 indexed property; uint32 numHoursPrivate);
module.exports.Bid = 'Bid'; //(uint24 indexed property; uint256 bid);
module.exports.AccountChange = 'AccountChange'; //(newaccount)  -  not a contract event.

//token events
module.exports.Transfer = 'Transfer'; //(address indexed _from; address indexed _to; uint256 _value);
module.exports.Approval = 'Approval'; //(address indexed _owner; address indexed _spender; uint256 _value);