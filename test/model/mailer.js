const test = require("unit.js");
const Mailer = require("../../model/communications/mailer");

describe("Email configuration test",() => {
    it("Should connect to database ", (done) => {
        let letsMemoryMailer = new Mailer();
        letsMemoryMailer.sendMail(
            "mikitg.michele@gmail.com",
            "Test",
            "<p>Test</p>",
            () => {
                done();
            }
        )
    });
});