const createCsvWriter = require('csv-writer')
    .createObjectCsvWriter;

const LbryHeader = [
    { id: 'tags', title: 'Tags' },
    { id: 'topic', title: 'Topic' }
]

exports.isHeaderWritten = false

exports.writeHeader = 
async function (path) {
    const csvWriter = createCsvWriter({
        path: path,
        header: LbryHeader
    });
    await csvWriter
    .writeRecords('')
}

exports.writeData = 
async function(path, data) {
    const csvWriter = createCsvWriter({
        path: path,
        header: LbryHeader,
        append: true
    });
    await csvWriter
    .writeRecords(data)
}