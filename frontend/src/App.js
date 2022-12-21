import { useState } from "react"
import pilotService from './services/pilots'
import PilotInfo from './components/PilotInfo'
import './style.css'

const App = () => {
  //Stores the pilots and the closest pilot
  const [pilots, setPilots] = useState([])
  const [closestPilot, setClosestPilot] = useState(null)

  const updatePilots = async () => {
    const allPilots = await pilotService.getAll()
      .catch((error) => {
        console.log(error)
      })
    if (allPilots !== undefined) {
      allPilots.forEach(p => {
        if (closestPilot === null || (p.distance < closestPilot.distance)) {
          //Update the closest pilot
          setClosestPilot(p)
        }
      })
      setPilots(allPilots)
    }
  }

  window.onload = updatePilots()

  return (
    <div className="App">
      <PilotInfo pilots={pilots} closestPilot={closestPilot}/>
    </div>
  )
}

export default App
