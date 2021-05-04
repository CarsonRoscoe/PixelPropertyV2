const contractHistoryUtils = require('./utils/contractHistoryUtils');
const DApp = require('./typedef/DApp');
const {  } = require('./utils/dbUtils');


console.info('Begin');
contractHistoryUtils.ensureEventHistoryIsUpToDate(DApp.VirtualRealEstate, () => {
    contractHistoryUtils.ensureEventHistoryIsUpToDate(DApp.PXLProperty);
});