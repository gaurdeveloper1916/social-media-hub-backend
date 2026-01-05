const axios = require("axios");
const {
  EXOTEL_SID,
  EXOTEL_API_KEY,
  EXOTEL_TOKEN,
  EXOTEL_BASE_URL,
} = process.env;

console.log(process.env.EXOTEL_SID,process.env.EXOTEL_API_KEY,"as")

const exotelClient = axios.create({
  baseURL: `https://api.exotel.com/v1/Accounts/gaurtechai1`,
  auth: {
    username: '13310ff8dac9b627591b824be380c2846143fedc8e4b9434',
    password: 'dc61ae6ced4987b3adc86e252f417e70cba086fad5daf051',
  },
});

module.exports = { exotelClient };
