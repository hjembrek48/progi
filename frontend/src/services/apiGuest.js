import axios from 'axios';

const apiGuest = axios.create({
    baseURL: 'http://localhost:8000/api/',
    withCredentials: true,
});

export default apiGuest;