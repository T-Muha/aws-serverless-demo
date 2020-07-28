//Supporting methods for user orders

'use strict'

//libraries
const {"v1": uuidv1} = require('uuid'); //creates unique ids
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient(); //module to work with DynamoDB
const kinesis = new AWS.Kinesis(); //module to work with kinesis stream

//environment variables
const TABLE_NAME = process.env.orderTableName;
const STREAM_NAME = process.env.orderStreamName;

module.exports.createOrder = body => {
    const order = {
        orderID: uuidv1(),
        name: body.name,
        address: body.address,
        productID: body.productID,
        quantity: body.quantity,
        orderDate: Date.now(),
        eventType: 'order_place'
    }
    return order;
}

module.exports.placeNewOrder = order => {
    //save order in DynamoDB table and put it in a Kinesis stream
    return saveOrder(order).then(() => {
        return placeOrderStream(order);
    })
}

module.exports.fulfillOrder = (orderID, fulfillmentID) => {
    //fulfill order in the db and send to the stream
    return getOrder(orderID).then(savedOrder => {
        const order = createFulfilledOrder(savedOrder, fulfillmentID);
        return saveOrder(order).then(() => {
            return placeOrderStream(order)
        });
    });
}

//puts the order in the DB OR updates existing order
function saveOrder(order) {
    console.log(order);
    const params = {
        TableName: TABLE_NAME,
        Item: order
    }
    return dynamo.put(params).promise();
}

//puts the order in the stream
function placeOrderStream(order) {
    const params = {
        Data: JSON.stringify(order),
        PartitionKey: order.orderID,
        StreamName: STREAM_NAME
    }
    return kinesis.putRecord(params).promise();
}

function getOrder(orderID) {
    //format that Dynamo uses to retrieve data
    const params = {
        Key: {
            orderID: orderID
        },
        TableName: TABLE_NAME
    };
    return dynamo.get(params).promise().then(result => {
        return result.Item;
    })
}

function createFulfilledOrder(savedOrder, fulfillmentID) {
    savedOrder.fulfillmentID = fulfillmentID;
    savedOrder.fulfillmentDate = Date.now();
    savedOrder.eventType = 'order_fulfilled';

    return savedOrder;
}