
export const NOBODY = '0x0000000000000000000000000000000000000000';

export const PropertyData = (x = 0, y = 0, owner = NOBODY, isInPrivate = false, lastUpdate = 0, isForSale = false, ETHPrice = 0, PPCPrice = 0, becomePublic = 0, latestBid = 0) => {
    return {x, y, owner, isInPrivate, lastUpdate, isForSale, ETHPrice, PPCPrice, becomePublic, latestBid};
};

export const CondensedColorUpdate = (x = 0, y = 0, colors = []) => {
    return {x, y, colors};
}