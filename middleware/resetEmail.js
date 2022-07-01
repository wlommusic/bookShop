var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

require('dotenv').config()

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
    process.env.EMAILAPI;

exports.sendResetMail = (email,token) => {
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email
    sendSmtpEmail = {
        sender: { email: process.env.SENDER },
        to: [
            {
                email: email
            },
        ],
        subject: "Password reset",
        htmlContent:
         `<p>You requested a password reset</p>
          <p>click <a href='http://localhost:3000/reset/${token}'>here</a></p>

        `,
    };
    apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
            console.log("API called successfully");
        },
        function (error) {
            console.error(error);
        }
    );
}  