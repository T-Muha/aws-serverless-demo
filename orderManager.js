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
    return saveNewOrder(order).then(() => {
        return placeOrderStream(order);

    })
}

//puts the order in the DB
function saveNewOrder(order) {
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