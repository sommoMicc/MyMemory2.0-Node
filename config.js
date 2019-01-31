var config = {
    database: {
        host: "localhost",
        user: "memory",
        password: "letsMemory",
        database: "LetsMemory"
    },
    SERVER_PROTOCOL: "https",
    SERVER_URL: "tagliabuemichele.homepc.it:8080",

    getBaseURL: function() {return this.SERVER_PROTOCOL+"://"+this.SERVER_URL},

    mail: {
        SMTP_HOST: "smtp.gmail.com",
        SMTP_USER: "mikitg.michele@gmail.com",
        SMTP_PASS: "itsqxfupgqqwjjuj",
        FROM: "Michele Tagliabue"
    }
};

module.exports = config;