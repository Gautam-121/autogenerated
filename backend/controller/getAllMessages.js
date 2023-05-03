const axios = require("axios")


// Convert the email message to a string
function messageToString(message) {
  const headers = {
    To: message.to,
    Subject: message.subject,
  };
  const body = message.body;
  const attachmentParts = (message.attachments || []).map(attachment => {
    return `Content-Type: application/octet-stream\r\nContent-Disposition: attachment; filename="${attachment.filename}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${attachment.content}\r\n`;
  });
  const msg =
    Object.keys(headers)
      .map(key => `${key}: ${headers[key]}`)
      .join('\r\n') +
    '\r\n\r\n' +
    body +
    '\r\n\r\n' +
    attachmentParts.join('');
  return msg;
}

// Base64-URL encode the email message
function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const getAllMessages = async(req , res)=>{

    try{

        const {accessToken} = req.cookies
    
    if(!accessToken){
        return res.status(400).json({
            success : false,
            message : "Plaese Provide access_token"
        })
    }

    const config = {
        method: "get",
        url:
          "https://gmail.googleapis.com/gmail/v1/users/me/messages",
        headers: {
          Authorization: `Bearer ${accessToken} `,
        },
      };

    const accessData = await axios(config)
    let messages = accessData.data.messages

    for(msg of messages){

        const msgResponse = await axios({
            
            method: "get",
            url:
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            headers: {
               Authorization: `Bearer ${accessToken} `,
            },
        })

        const msges = msgResponse.data

        if (msges.labelIds.includes('INBOX') && !msges.labelIds.includes("auto")) {

            // Step 2: Send replies to first-time email threads
            const threadId = msges.threadId;
            const from = msges.payload.headers.find(h => h.name === 'From').value;
            const subject = msges.payload.headers.find(h => h.name === 'Subject').value;


            const reply = `Thank you for your message. We will get back to you as soon as possible.\n\nBest regards,\nYour Company`;

            const messageToSend = {
              to: from,
              subject: subject,
              body: reply,
              attachments: [
                // Buffer to base64-encoded string conversion
                {
                  filename: 'example.txt',
                  content: Buffer.from(reply).toString('base64'),
                  encoding: 'base64',
                },
              ],
            };

            const media = {
              mimeType: 'message/rfc822',
              body: messageToString(messageToSend),
            };

            console.log(typeof media.body)

            await axios({

                method: "post",
                url:`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                   Authorization: `Bearer ${accessToken} `,
                },
                requestBody: {
                  threadId: threadId,
                  raw: base64urlEncode(media.body),
                },
                media: media,
            })
        }

           // Step 3: Add a label to the email and move it to the label
           const labelName = 'auto';
           const response = await axios({
              
            method : "get",
            url : "https://gmail.googleapis.com/gmail/v1/users/me/labels",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
               Authorization: `Bearer ${accessToken} `,
              }
           })

           const labels = response.data.labels || [];
           const label = labels.find(l => l.name === labelName) || {};

           if (!label.id) {

            const res = await axios({

            method : "get",
            url : "https://gmail.googleapis.com/gmail/v1/users/me/labels",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
               Authorization: `Bearer ${accessToken} `,
              },
            requestBody: {
                name: labelName,
                labelListVisibility: 'labelShow',
              }
            })

             label.id = res.data.id;
           }

           await axios({

            method : "post",
            url : `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msges.id}/modify`,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
               Authorization: `Bearer ${accessToken} `,
            },
            requestBody: {
              addLabelIds: [label.id],
              removeLabelIds: ['INBOX'],
            }
           })
    }
    res.status(200).json({
        success : true,
    })
  }catch(err){
    res.status(500).json({
        success : false,
        msg : err
    })
  }
}


module.exports = getAllMessages