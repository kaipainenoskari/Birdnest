import axios from 'axios'
const baseUrl = '/violations'

const getAll = () => {
    const request = axios.get(baseUrl)
    const response = request.then(response => response.data)
        .catch((error) => {
            console.log(error)
        })
    return response
}

const exports = { getAll }

export default exports