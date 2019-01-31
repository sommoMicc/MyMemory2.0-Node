var nodemailer = require("nodemailer");
var config = require("../../config");

class LetsMemoryMailer {

    /**
     * Class constructor
     */
    constructor() {
        this.poolConfig = {
            pool: true,
            host: config.mail.SMTP_HOST, //Example: smtp.gmail.com
            port: 587,
            secure: false, // use TLS
            auth: {
                user: config.mail.SMTP_USER, //Example: commandlineteam@gmail.com
                pass: config.mail.SMTP_PASS //Example: password
            }
        };

        this.from = config.mail.FROM; //Configure with user mail

        //Example:
        //this.from = "CommandLine Team <commandlineteam@gmail.com>";

        this.smtpTransport = nodemailer.createTransport(this.poolConfig);

    }

    /**
     * Function that sends an email using TuTourSelf account
     * @param {String} to - receiver of email
     * @param {String} subject - subject of email
     * @param {String} text - plain text of the email
     * @param {String} html - formatted body of the email
     * @param {Function} callback - callback
     * @returns {void}
     */
    sendMail(to,subject,text,html, callback) {
        let mailOptions = {
            from: this.from,
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html // html body
        };
        // send mail with defined transport object
        this.smtpTransport.sendMail(mailOptions, function(error, response){
            if(callback != null)
                callback(error,response);
        });
    }

    sendSignupMail(to,token,callback) {
        const link = config.getBaseURL()+"/login/"+token;

        const subject = "Registrazione in LetsMemory";
        const text = "Completa la registrazione in LetsMemory aprendo questo link: \n" +
            link;
        const html =  "<p>Effettua il login in LetsMemory aprendo questo link: " +
            "<br><a href='"+link+"'>"+link+"</a></p>";

        this.sendMail(to,subject,text,html,callback);
    }

    sendLoginMail(to,token,callback) {
        const link = config.getBaseURL()+"/login/"+token;

        const subject = "Login in LetsMemory";
        const text = "Effettua il login in LetsMemory aprendo questo link: \n" +
            link;
        const html =  "<p>Effettua il login in LetsMemory aprendo questo link: " +
            "<br><a href='"+link+"'>"+link+"</a></p>";

        this.sendMail(to,subject,text,html,callback);
    }
}


module.exports = LetsMemoryMailer;
