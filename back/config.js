exports.PORT = process.env.PORT || 3306

exports.CLIENT_ORIGIN = process.env.NODE_ENV === 'production'
  ? 'https://webrtc.bcisummit.com'
  : 'https://localhost:3111'

exports.DB_URL = process.env.NODE_ENV === 'production'
  ? process.env.DB_URL
  : 'mongodb://127.0.0.1:27017/videoconference'

exports.MAIL_USER = process.env.NODE_ENV === 'production'
  ? 'seniordev119@gmail.com'
  : 'seniordev119@gmail.com'
  
exports.MAIL_PASS = process.env.NODE_ENV === 'production'
  ? 'dgs123456789'
  : 'dgs123456789'
  
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;