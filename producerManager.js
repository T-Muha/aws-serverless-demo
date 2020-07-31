'use strict'

//get SES module from the aws library
const AWS = require('aws-sdk');
const ses = new AWS.SES({
    region: process.env.region
});

//environment variables
const PRODUCER_EMAIL = process.env.producerEmail;
const ORDERING_SYSTEM_EMAIL = process.env.orderingSystemEmail;

//handles the SES promises
module.exports.handlePlacedOrders = ordersPlaced => {
    var ordersPlacedPromises = [];

    for (let order of ordersPlaced) {
        const tempPromise = notifyProducerByEmail(order);
        ordersPlacedPromises.push(tempPromise);
    }
    return Promise.all(ordersPlacedPromises);
}

//send orders to SES
function notifyProducerByEmail(order) {
    const params = {
        Destination: {
            ToAddresses: [PRODUCER_EMAIL]
        },
        Message: {
            Body: {
                Text: {
                    Data: JSON.stringify(order)
                }
            },
            Subject: {
                Data: 'New Order Placed'
            }
        },
        Source: ORDERING_SYSTEM_EMAIL
    };

    return ses.sendEmail(params).promise().then((data) => {
        return data;
    });
}