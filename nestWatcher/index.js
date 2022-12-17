const axios = require('axios')
const https = require('https')
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch-retry')
const xml2js = require('xml-js')
const { XMLParser } = require('fast-xml-parser')

const app = express()
app.use(express.static('build'))
app.use(cors())

//returns distance from origin
const getDistance = (x, y) => {
    return (
        Math.floor(Math.sqrt(Math.abs((Number(x)-250000)** 2) + Math.abs((Number(y)-250000)** 2)))
    )
}

//checks if coordinates are in NDZ, returns boolean
const checkDistance = (x, y) => {
    const distance = getDistance(x, y)
    return (
        distance <= 100000
    )
}

const API_INTERVAL = 2; // in second
const TIME_INTERVAL = 10; // in minute

const MAX_STORE_DRONE = TIME_INTERVAL*60 / API_INTERVAL;

const parser = new XMLParser()

const httpsAgent = new https.Agent({ keepAlive: true, timeout: 2000, method: 'GET' })

const getAllDrones = () => {
    const networkPromise = axios.get('https://assignments.reaktor.com/birdnest/drones', { httpsAgent })
    const timeOutPromise = new Promise((resolve, reject) => {
        setTimeout(resolve, 2000, 'Timeout Done')
    })

    Promise.all([networkPromise, timeOutPromise])
        .then(values => {
            const result = parser.parse(values[0].data)
            const allDrones = result.report.capture.drone
            getViolations(allDrones)

            getAllDrones()
        })
}


const getViolations = (drones) => {
    let allViolators = []
    drones.map((drone) => {
        const x = Number(drone.positionX)
        const y = Number(drone.positionY)
        if (checkDistance(x, y)) {
            allViolators = allViolators.concat(drone)
        }
    })
    getPilotInfo(allViolators)
}

let pilotInfo = []

const getPilotInfo = (drones) => {
    drones.map(async (drone) => {
        const infoData = await axios.get(`https://assignments.reaktor.com/birdnest/pilots/${drone.serialNumber}`, { httpsAgent })
        const info = infoData.data
        if (info) {
            const pilotIds = pilotInfo.map(p => p.id)
            if (!pilotIds.includes(info.pilotId)) {
                const pilot = {
                    id: info.pilotId,
                    name: `${info.firstName} ${info.lastName}`,
                    phoneNumber: info.phoneNumber,
                    email: info.email,
                    distance: getDistance(drone.positionX, drone.positionY),
                    time: Date.now()
                }
                pilotInfo = [pilot].concat(pilotInfo)
            } else {
                const updateInfo = pilotInfo.find(p => p.id === info.pilotId)
                updateInfo.distance = getDistance(drone.positionX, drone.positionY)
                updateInfo.time = Date.now()
            }
        }
    })
    pilotInfo = pilotInfo.filter(pilot => Number(pilot.time) + 600000 >= Number(Date.now()))
}

getAllDrones()

app.get('/violations', (request, response) => {
    response.end(JSON.stringify(pilotInfo))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})