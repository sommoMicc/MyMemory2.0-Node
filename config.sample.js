var config = {
    database: {
        host: "localhost",
        user: "memory",
        password: "letsMemory",
        database: "LetsMemory"
    },
    SERVER_PROTOCOL: "https",
    SERVER_URL: "",
    SHA256_ANDRID_CERT: "",

    getBaseURL: function() {return this.SERVER_PROTOCOL+"://"+this.SERVER_URL},
    getIOSURL: function() {return "letsmemory://com.micheletagliabue.letsmemory"},

    mail: {
        SMTP_HOST: "",
        SMTP_USER: "",
        SMTP_PASS: "",
        FROM: ""
    }
};

module.exports = config;