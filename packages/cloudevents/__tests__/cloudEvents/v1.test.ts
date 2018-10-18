

describe("#SNSEvents:", () => {
    describe("Given an SNS Event", () => {
        describe("And it contains a TypedCloudEvent", () => {
            describe("When the cloud event is extracted", () => {
                it("Then it should return an array of TypedCloudEvent", () => {
                    fail("Test not implemented");
                })
            })
        })

        describe("And it does not contain a TypedCloudEvent", () => {
            describe("When the cloud event is extracted", () => {
                it("Then it should throw an error", () => {
                    fail("Test not implemented");
                })
            })
        })

        describe("And the SNS event is actually a literal TypeCloudEvent", () => {
            describe("When the cloud event is extracted", () => {
                it("then it should return an array with one TypedCloudEvent", () => {
                    fail("Test not implemented");
                })
            })
        })
    })
})