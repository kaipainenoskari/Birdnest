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
        (Math.sqrt((x-250000)** 2 + (y-250000)** 2)/1000).toFixed(2)
    )
}

//checks if coordinates are in NDZ, returns boolean
const checkDistance = (x, y) => {
    const distance = getDistance(x, y)
    return (
        distance <= 100
    )
}

const parser = new XMLParser()

const httpsAgent = new https.Agent({ keepAlive: true, timeout: 2000, method: 'GET' })

//Every two seconds gets information about drones flying nearby
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
getAllDrones()

//Checks if violations happen
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

//Gets the information of the pilots who violated the NDZ
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
                    time: Date.now(),
                    drone: drone
                }
                pilotInfo = [pilot].concat(pilotInfo)
            } else {
                const updateInfo = pilotInfo.find(p => p.id === info.pilotId)
                updateInfo.distance = getDistance(drone.positionX, drone.positionY)
                updateInfo.time = Date.now()
            }
        }
    })
    //Filters the pilots out after 10min
    pilotInfo = pilotInfo.filter(pilot => Number(pilot.time) + 600000 >= Number(Date.now()))
}

//Posts the violators
app.get('/violations', (request, response) => {
    response.end(JSON.stringify(pilotInfo))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})