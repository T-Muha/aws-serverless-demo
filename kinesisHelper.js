'use strict'

//decodes a kinesis record
function parsePayload(record) {
    const json = new Buffer.from(record.kinesis.data, 'base64').toString('utf8');
    return JSON.parse(json);
}

//returns records from a stream event
module.exports.getRecords = event => {
    return event.Records.map(parsePayload);
}