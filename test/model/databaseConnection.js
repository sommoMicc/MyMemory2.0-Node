const test = require("unit.js");
const DatabaseConnection = require("../../model/databaseConnection");

describe("Database Connection class test",() => {
    it("Should connect to database ", (done) => {
        const connection = new DatabaseConnection();
        connection.connect().then((result) => {
            result.must.be.true();
            done();
        }).catch(()=>{
            test.fail("Connessione rigettata");
            done();
        });
    });
});