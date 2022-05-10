import axios from 'axios'
import CsvWriter from './csvWriter.cjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Api config
const base = 'http://127.0.0.1'
const lbryPort = 5279
const lbryUrl = `${base}:${lbryPort}`
const PAGE_SIZE = 10

function apiCall(params) {

    return new Promise((resolve, reject) => {
        axios
            .post(lbryUrl, params)
            .then(res => {
                //console.log(res.data)
                resolve(res.data)
            })
            .catch(error => {
                //console.error(error)
                reject(error)
            })
    })
}

function parseLbryTags(res, path, query) {
    let result = res.result
    let items = result.items
    for (let item of items) {
        let value = item.value
        if (value && value.tags) {

            let tags = value.tags

            if (!CsvWriter.isHeaderWritten) {
                CsvWriter.writeHeader(path)
                .then(() => {
                    CsvWriter.isHeaderWritten = true
                })
                .then(() => {
                    CsvWriter.writeData(path, [{
                        tags: tags.join(' '),
                        topic: query
                    }])
                })
            }

            CsvWriter.writeData(path, [{
                tags: tags.join(' '),
                topic: query
            }])
        }
    }
}

function crawlLbryTags(topic, pageNum) {

    let params = {
        method: 'claim_search',
        params: {
            fee_amount: '<=0',   // only serve free content
            page: Number(pageNum),
            page_size: PAGE_SIZE,
            order_by: 'release_time',
            no_totals: true
        }
    }

    // support both string and array
    if (typeof topic == "string") {
        params["params"]["any_tags"] = [topic]
    } else {
        params["params"]["any_tags"] = topic
    }

    apiCall(params)
        .then((daemonRes) => {

            if (daemonRes.result) {
                //console.log(daemonRes)
                parseLbryTags(daemonRes, 'data.csv', topic)
            } else {
                console.error('Something is wrong with lbrynet. Please try to switch the spv server and reconnect.')
            }
        
        })
}

import util from 'util'
const question = util.promisify(rl.question).bind(rl);

// Entry
let topics
let rows

topics = await question('What topics do u want to get ? ')
rows = await question('How many rows of data do u want to get for each topic ? ')
rl.close()

let topicsList = topics.split(' ')
let numOfPage = Number(rows / 10) 

for (let topic of topicsList) {
    if (numOfPage != NaN) {
        for (let i = 0; i <= numOfPage; i++) {
            crawlLbryTags(topic, i)
        }
    }
}

