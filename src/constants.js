const Helpers = require('./helpers');

module.exports = {
    USER_AGENT: 'CueSheetConnector/1.0 (Cue Manager; Bitfocus Companion Module)',
    SESSION_TOKEN: Helpers.generateUniqueId()
}