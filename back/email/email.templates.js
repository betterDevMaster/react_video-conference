const { CLIENT_ORIGIN } = require('../config')

// This file is exporting an Object with a single key/value pair.
// However, because this is not a part of the logic of the application
// it makes sense to abstract it to another file. Plus, it is now easily
// extensible if the application needs to send different email templates
// (eg. unsubscribe) in the future.
module.exports = {

  confirm: _id => ({
    subject: `Your space "${_id}" has been created`,
    html: `
      <br/>
      Hey!
      <br/><br/>
      Your SpatialChat space is now up and running:
      <br/>
      Use the following link to enter your space and share it to invite your friends:
      <br/>
      <a href='${CLIENT_ORIGIN}/room?space=${_id}'>
        ${CLIENT_ORIGIN}/room?space=${_id}
      </a>
      <br/><br/>
      See you!
      <br/><br/>
      --
      <br/>
      The SpatialChat Team
    `,
    text: `Copy and paste this link: ${CLIENT_ORIGIN}/room?space=${_id}`
  })

}