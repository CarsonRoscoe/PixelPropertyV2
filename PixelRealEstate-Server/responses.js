module.exports.IMAGE_NOT_LOADED = (loadingValue) => {
    return ({
        message: "Image not loaded",
        success: false,
        data: {
            loading: loadingValue
        }
    });
};