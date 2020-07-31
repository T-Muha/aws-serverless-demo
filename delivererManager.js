'use strict'

module.exports.deliveryOrder = ordersFulfilled => {
    console.log('nonexistant party notified');

    return new Promise(resolve => {
        setTimeout(() => {
            resolve('fooooo');
        }, 100);
    })
}