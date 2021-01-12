const { api, conf, editToken } = require('./mw')

module.exports = ({ title, text, summary }) => {
  return $.post(api, {
    format: 'json',
    action: 'edit',
    token: editToken,
    title,
    text,
    summary,
  })
}
