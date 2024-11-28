const {isMainThread, parentPort, workerData} = require('worker_threads')
const async = require('async')
const parseCSV = require('./parseCSV')
const processBatch = require('./processBatch')

const uploadPatientData = async (req, res) => {
  try {
    const file = req.files.file

    const buffer = file.data

    const batchSize = 50 // Set your desired batch size here
    const parsedData = await parseCSV(buffer)

    const totalRows = parsedData.length
    let insertedRows = 0
    let failedRows = []

    if (isMainThread) {
      // Create a queue for batch processing
      const queue = async.queue(async (batch, callback) => {
        try {
          const result = await processBatch(batch)
          insertedRows += result.insertedCount
          failedRows = failedRows.concat(result.failedRows)
          callback()
        } catch (error) {
          console.error(error)
          callback(error)
        }
      }, 10) // Number of concurrent workers (adjust as needed)

      // Push batches into the queue
      let startIdx = 0
      while (startIdx < totalRows) {
        const endIdx = Math.min(startIdx + batchSize, totalRows)
        const batch = parsedData.slice(startIdx, endIdx)
        startIdx = endIdx

        // Use JSON.parse and JSON.stringify to create a deep copy of the batch
        // to avoid any reference issues
        const batchCopy = JSON.parse(JSON.stringify(batch))
        queue.push(batchCopy)
      }

      // Listen for the completion of all tasks in the queue
      queue.drain(() => {
        res.status(200).json({
          success: true,
          totalRows,
          insertedRows,
          failedRows,
        })
      })
    } else {
      // Inside the worker thread, process the batch
      const {batch} = workerData
      const result = await processBatch(batch)
      parentPort.postMessage(result)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error:
        'An error occurred while processing and uploading the CSV data to MongoDB.',
    })
  }
}

module.exports = uploadPatientData
