var config = {
    database: {
        host: "localhost",
        user: "memory",
        password: "letsMemory",
        database: "LetsMemory"
    },
    SERVER_PROTOCOL: "https",
    SERVER_URL: "",

    getBaseURL: function() {return this.SERVER_PROTOCOL+"://"+this.SERVER_URL},

    mail: {
        SMTP_HOST: "",
        SMTP_USER: "",
        SMTP_PASS: "",
        FROM: ""
    }
};

module.exports = config;