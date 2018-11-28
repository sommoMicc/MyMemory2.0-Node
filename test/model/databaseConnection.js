require("unit.js");
const connection = require("../../model/databaseConnection");

describe("Database Connection class test",() => {
    it("Should connect to database ", (done) => {
        connection.connect((result) => {
            result.must.be.true();
            done();
        })
    });
});