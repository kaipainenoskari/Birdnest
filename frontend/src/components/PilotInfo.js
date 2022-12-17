import Popup from "./Popup"

const PilotInfo = ({pilots, closestPilot}) => {
    const hideWhenNull = { display: closestPilot === null ? 'none' : '' }
    const showWhenNull = { display: closestPilot === null ? '' : 'none' }

    const showClosest = (pilot) => {
        if (pilot !== null) {
            return (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Distance</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody key="closestViolator">
                        <tr>
                            <td>
                                {pilot.name}
                            </td>
                            <td>
                                {pilot.phoneNumber}
                            </td>
                            <td>
                                {pilot.email}
                            </td>
                            <td>
                                {pilot.distance}
                            </td>
                            <td>
                                {new Date(pilot.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric'})}
                            </td>
                        </tr>
                    </tbody>
                </table>
            )
        } else {
            return (
                <h2>No pilots spotted, please let the </h2>
            )
        }
    }

    return (
    <div>
        <div style={hideWhenNull}>
            <h1>CLOSEST PILOT TO  THE NEST</h1>
            {showClosest(closestPilot)}
            <h1>ALL PILOTS THAT HAVE VIOLATED THE NO-FLY ZONE IN THE LAST 10 MINUTES</h1>
            <table>
                <thead className="headers">
                    <tr>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Email</th>
                        <th>Distance</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody key="violations">
                    {pilots.map(p => 
                        <tr key={p.id} onClick={() => Popup(p)}>
                            <td>{p.name}</td>
                            <td>{p.phoneNumber}</td>
                            <td>{p.email}</td>
                            <td>{p.distance}</td>
                            <td>{new Date(p.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric'})}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div style={showWhenNull}>
            <h2>No pilots spotted, please let the server run</h2>
        </div>
    </div>
)}

export default PilotInfo