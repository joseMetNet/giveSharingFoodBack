export const sendEmailNotification = async (subject: string,name: string, emails: string[], emailBody: string) => {
    const emailHost = "https://api.masiv.masivian.com/email/v1/delivery";
    const requestBody = {
        Subject: subject,
        From: "info@givesharingfood.com",
        Template: {
            Type: "text/html",
            Value: emailBody
        },
        Recipients: emails.map(email => ({ To: email }))  
    };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Basic YXBpLmphZ3h0OktZQFowTHV5ZFZvd2RMUlpVWVJDN3hvX1F5WlVJZQ=="
        },
        body: JSON.stringify(requestBody)
    };

    console.log("Sending email to:", emails);

    try {
        const response = await fetch(emailHost, options);

        if (!response.ok) {
            const data = await response.json();
            console.log(`Error sending the verification email: ${JSON.stringify(data)}`);
            throw new Error(`Error sending email: ${JSON.stringify(data)}`);
        }
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error occurred while sending email:", error);
    }
};