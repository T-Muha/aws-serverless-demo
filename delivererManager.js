'use strict'

const orderManager = require('./orderManager');
const customerServiceManager = require('./customerServiceManager');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: process.env.region
});

const DELIVERY_COMPANY_QUEUE = process.env.deliveryCompanyQueue;

//Sends message to the delivery queue
module.exports.deliveryOrder = ordersFulfilled => {

    var ordersFulfilledPromises = [];
    for (let order of ordersFulfilled) {
        const tempOrder = orderManager.updateOrderForDelivery(order.orderID).then(updatedOrder => {
            return orderManager.saveOrder(updatedOrder).then(() => {
                return notifyDeliveryCompany(updatedOrder);
            })
        })
        ordersFulfilledPromises.push(tempOrder);
    }
    
    return Promise.all(ordersFulfilledPromises);
}

function notifyDeliveryCompany(order) {
    const params = {
        MessageBody: JSON.stringify(order),
        QueueUrl: DELIVERY_COMPANY_QUEUE
    };
    return sqs.sendMessage(params).promise();
}

module.exports.deliveredOrder = (orderID, deliveryCompanyID, orderReview) => {
    //confirm delivery in db and send to queue
    return orderManager.updateDeliveredOrder(orderID, deliveryCompanyID, orderReview).then(updatedOrder => {
        return orderManager.saveOrder(updatedOrder).then(() => {
            return customerServiceManager.notifyCustomerServiceForReview(orderID, orderReview);
        })
    })
}