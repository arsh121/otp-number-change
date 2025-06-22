
const fetch = require("node-fetch");

exports.handler = async function(event) {
  try {
    const data = JSON.parse(event.body);
    const { agentName, agentId, kbId, oldPhone, newPhone, otp, channel, messageType } = data;
    let apiResponse = '';

    // Send message to appropriate channel
    if (messageType === "OTP") {
      if (channel === "Push") {
        const pushPayload = {
          to: { identity: [kbId] },
          campaign_id: "1750575722",
          ExternalTrigger: { OTP: otp }
        };

        const res = await fetch("https://api.clevertap.com/1/send/externaltrigger.json", {
          method: "POST",
          headers: {
            "X-CleverTap-Account-Id": "R9Z-4RW-855Z",
            "X-CleverTap-Passcode": "ERK-ASE-CPKL",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(pushPayload)
        });

        apiResponse = await res.text();

      } else if (channel === "SMS") {
        const smsUrl = `https://enterprise.smsgupshup.com/GatewayAPI/rest?userid=2000193891&password=x394F4ge&send_to=91${oldPhone}&msg=Your%20Khatabook%20verification%20OTP%20is%20${otp}&method=SendMessage&format=JSON&v=1.1&auth_scheme=Plain&msg_type=Text&principalEntityId=1601100000000000654&dltTemplateId=1007194642344586649`;
        const res = await fetch(smsUrl);
        apiResponse = await res.text();

      } else if (channel === "WA") {
        const waUrl = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?userid=2000186106&password=F4EUan&send_to=${oldPhone}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=${otp}+is+your+verification+code.&isTemplate=true&footer=This+code+expires+in+10+minute.`;
        const res = await fetch(waUrl);
        apiResponse = await res.text();
      }

    } else if (messageType === "Form") {
      const waFormUrl = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?userid=2000186106&password=F4EUan&send_to=${newPhone}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=We+have+recieved+your+request+to+change+your+registered+Khatabook+Phone+Number%0A%0APlease+click+on+the+link+below+to+proceed+with+the+process&isTemplate=true`;
      const res = await fetch(waFormUrl);
      apiResponse = await res.text();
    }

    // Log to Google Sheets
    const sheetRes = await fetch("https://script.google.com/macros/s/AKfycbwl9Mt0bSqkfr6HvCb568C-p20Q-jugYXWoRR9mM4j3Ay6uOKnFgvNXpA9SE_nLKsgdew/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentName,
        agentId,
        kbId,
        oldPhone,
        newPhone,
        otp,
        channel,
        status: "Success",
        messageType
      })
    });

    const sheetStatus = await sheetRes.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Message sent via ${channel}. API: ${apiResponse}, Sheet: ${sheetStatus}` })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error: " + error.message })
    };
  }
};
