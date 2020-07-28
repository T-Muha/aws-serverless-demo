'use strict';

const orderManager = require('./orderManager')

//constructs http responses
function createResponse(statusCode, message) {

  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  return response
}

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