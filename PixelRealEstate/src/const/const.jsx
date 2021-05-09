export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 1000;
export const PROPERTIES_WIDTH = 100;
export const PROPERTIES_HEIGHT = 100;
export const PROPERTY_LENGTH = 10;
export const PROPERTY_SIZE = 100;
export const WEI_IN_ETH = 1000000000000000000;

export const VirtualRealEstate = ['0x89695d5b003eb6a546c1b6d3b272c36e423e9477'];//['0xd0aa0403418f8533c9e4b41c2c31b626bf78cbe7'];//, '0xcbfb3d5139e526fbd1afd592a039c421864e01be', '0xbc512650375fc2560addf36a74adb3a0f88cc6b5','0x0b91f37c52c3c71f097409e03bc4171eb7b50615', '0x1fb6ce46917543cad5f61cd995fa26d889716e5b'];
export const PXLProperty = ['0x9bc0b36cdedadb9ae906f53bdea6debe20b81b8e', '0xf07d979303c50a8632848cb154c6b30980218c07'];//['0xe7f9c16e124fff6f5c6c2f9ecb5ca8314d2e0192'];//, '0x72a192d7d07f876c0edb6fce79798d5b569dde60', '0x4be75a8a3b769fdea12a00a7cc99a039163ba352'];

export const TOS_VERSION = 17; //8 bit decimal of version TOS then Privacy Policy in order: [0001][0001]

export const FORM_STATE = {
    IDLE: {
        name: 'IDLE',
        color: 'green',
        message: '',
    }, 
    PENDING: {
        name: 'PENDING',
        color: 'green',
        message: 'Transaction sent...',
    }, 
    COMPLETE: {
        name: 'COMPLETE',
        color: 'green',
        message: 'Transaction complete!',
    },
    FAILED: {
        name: 'FAILED',
        color: 'red',
        message: 'Transaction failed!',
    },
};

export const NETWORK_DEV = -1;
export const NETWORK_MAIN = 1;
export const NETWORK_ROPSTEN = 3;
export const NETWORK_RINKEBY = 4;
export const NETWORK_KOVAN = 42;