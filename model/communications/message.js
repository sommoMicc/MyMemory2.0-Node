module.exports = {
    success : (text) => {
        return {
            status: "success",
            message: text
        }
    },
    error: (text) => {
        return {
            status: "error",
            message: text
        }
    }
};