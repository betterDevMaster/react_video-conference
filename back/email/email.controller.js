const User = require('../user.model')
const sendEmail = require('./email.send')
const msgs = require('./email.msgs')
const templates = require('./email.templates')

// The callback that is invoked when the user submits the form on the client.
exports.collectEmail = (req, res) => {
  const { email, space } = req.body
  console.log('---- email: ', email)
  console.log('---- space: ', space)
  sendEmail(email, templates.confirm(space))
  res.json({ status: 0, msg: msgs.confirm })
  // User.findOne({ email, space })
  //   .then(user => {
  //     // We have a new user! Send them a confirmation email.
  //     if (user==null) {
  //       console.log('----- user: ', user)
  //       User.create({ email, space })
  //         .then(newUser => sendEmail(newUser.email, templates.confirm(newUser.space)))
  //         .then(() => res.json({ status: 0, msg: msgs.confirm }))
  //         .catch(err => console.log(err))
  //     }
  //     // We have already seen this email address. But the space address has not registered
  //     else if (user && user.space == space) {
  //       console.log('---------------already registered:', user.space, '=======space:', space)
  //       res.json({ status: 1, msg: msgs.alreadyRegistered })
  //     } else {
  //       console.log('---------------unconfirmed user.space:', user.space, '=======space:', space)
  //       res.json({ status: 2, msg: msgs.confirm })
  //       sendEmail(user.email, templates.confirm(user.space))
  //         .then(() => res.json({ msg: msgs.confirm }))
  //     }
  //   })
  //   .catch(err => console.log(err))
}

// The callback that is invoked when the user visits the confirmation
// url on the client and a fetch request is sent in componentDidMount.
// exports.confirmEmail = (req, res) => {
//   const { id } = req.params

//   User.findById(id)
//     .then(user => {

//       // A user with that id does not exist in the DB. Perhaps some tricky
//       // user tried to go to a different url than the one provided in the
//       // confirmation email.
//       if (!user) {
//         res.json({ msg: msgs.couldNotFind })
//       }

//       // The user exists but has not been confirmed. We need to confirm this
//       // user and let them know their email address has been confirmed.
//       else if (user && !user.confirmed) {
//         User.findByIdAndUpdate(id, { confirmed: true })
//           .then(() => res.json({ msg: msgs.confirmed }))
//           .catch(err => console.log(err))
//       }

//       // The user has already confirmed this email address.
//       else  {
//         res.json({ msg: msgs.alreadyConfirmed })
//       }

//     })
//     .catch(err => console.log(err))
// }