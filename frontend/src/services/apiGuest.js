import axios from 'axios';

const apiGuest = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api/`,
    withCredentials: true,
});

export default apiGuest;