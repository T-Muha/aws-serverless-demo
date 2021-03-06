'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper');
const producerManager = require('./producerManager');
const delivererManager = require('./delivererManager');

//constructs http responses
function createResponse(statusCode, message) {

  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  return response
}

//lambda to place a new order
//triggered when customer makes an order
module.exports.createOrder = async (event) => {
  //create order object
  const body = JSON.parse(event.body);
  const order = orderManager.createOrder(body);

  return orderManager.placeNewOrder(order).then(() => {
    return createResponse(200, order);
  }).catch(error => {
    return createResponse(400, error);
  })

};

//lambda to fulfill an order
//triggered when supplier completes order
module.exports.fulfillOrder = async (event) => {
  const body = JSON.parse(event.body);
  const orderID = body.orderID;
  const fulfullmentID = body.fulfullmentID;

  return orderManager.fulfillOrder(orderID, fulfullmentID).then(() => {
    return createResponse(200, 'Order ' + orderID + ' was sent to delivery');
  }).catch(error => {
    return createResponse(400, error);
  })
}

//lambda to confirm order delivered
//triggered when the user confirms their order is delivered
module.exports.deliveredOrder = async (event) => {
  const body = JSON.parse(event.body);
  const orderID = body.orderID;
  const deliveryCompanyID = body.deliveryCompanyID;
  const orderReview = body.orderReview;

  return delivererManager.deliveredOrder(orderID, deliveryCompanyID, orderReview).then(() => {
    return createResponse(200, 'Order ' + orderID + ' has been delivered');
  }).catch(error => {
    return createResponse(400, error);
  })
}

//lambda to notify about order statuses
//triggered during stream events
module.exports.notifyExternalParty = async (event) => {
  const records = kinesisHelper.getRecords(event);
  const producerPromises = getProducerPromises(records);
  const delivererPromises = getDelivererPromises(records);
  
  return Promise.all([producerPromises, delivererPromises]).then(() => {
    return 'all clear';
  }).catch(error => {
    console.log(error);
    return error;
  })
}

//lambda to notify delivery company that an order is fulfilled
//triggered when order message is placed in delivery company sqs queue
module.exports.notifyDeliveryCompany = async (event) => {
  console.log('HTTP call to nonexistant delivery company endpoint');

  return 'done';
}

module.exports.notifyCustomerService = async (event) => {
  console.log('HTTP call to nonexistant customer service endpoint');

  return 'done'
}

//filters and carries out notifications for the producer
function getProducerPromises(records) {
  const ordersPlaced = records.filter(r => r.eventType === 'order_place');
  if (ordersPlaced.length > 0) {
    return producerManager.handlePlacedOrders(ordersPlaced);
  } else {
    return null;
  }
}

//filters and carries out notifications for the deliverer
function getDelivererPromises(records) {
  const ordersFulfilled = records.filter(r => r.eventType === 'order_fulfilled');
  if (ordersFulfilled.length > 0) {
    return delivererManager.deliveryOrder(ordersFulfilled);
  } else {
    return null;
  }
}