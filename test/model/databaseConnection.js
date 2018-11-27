var test = require("unit.js");
var DatabaseConnection = require("../../model/databaseConnection");

describe("Database Connection class test",() => {
    it("Should connect to database ", (done) => {
        let connection = new DatabaseConnection("localhost","memory","myMemory","MyMemory");
        connection.connect((result) => {
            result.must.be.true();
            done();
        })
    });
});