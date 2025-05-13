const fetch = require("node-fetch");

exports.handler = async function(event) {
  console.log("Function triggered");
  try {
    const { identity } = JSON.parse(event.body);
    const otp = "OTP_" + Math.floor(100000 + Math.random() * 900000);
    console.log("Generated OTP:", otp);

    const response = await fetch("https://api.clevertap.com/1/send/externaltrigger.json", {
      method: "POST",
      headers: {
        "X-CleverTap-Account-Id": "R9Z-4RW-855Z",
        "X-CleverTap-Passcode": "ERK-ASE-CPKL",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: { identity: [identity] },
        campaign_id: "1747039170",
        ExternalTrigger: { OTP: otp }
      })
    });

    const data = await response.json();
    console.log("CleverTap Response:", data);

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
