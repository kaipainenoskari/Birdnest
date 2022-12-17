import axios from 'axios'
const url = '/violations'

const getAll = () => {
    const request = axios.get(url)
    const response = request.then(response => response.data)
        .catch((error) => {
            console.log(error)
        })
    return response
}

const exports = { getAll }

export default exports