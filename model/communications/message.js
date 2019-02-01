module.exports = {
    success : (text,data=null) => {
        return {
            status: "success",
            message: text,
            data: data
        }
    },
    error: (text,data=null) => {
        return {
            status: "error",
            message: text,
            data: data
        }
    }
};