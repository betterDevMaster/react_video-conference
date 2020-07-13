// export const API_URL = process.env.NODE_ENV === 'production'
//   ? 'http://ec2-18-222-23-198.us-east-2.compute.amazonaws.com:3113/'
  // : 'http://localhost:3113'
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://webrtc.bcisummit.com'
  : 'https://webrtc.bcisummit.com'
  // : 'localhost:3011' //tesing port