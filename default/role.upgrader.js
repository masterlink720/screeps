const roleUtil = require('./role.util');

var roleUpgrader = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep, creep.room.controller) ) {
            creep.memory.upgrading = null;
            return;
        }

        if( !creep.memory.upgrading ) {
            creep.memory.upgrading = true;
            creep.say('Upgrading');
        }

        if( creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE ) {
            creep.moveTo(creep.room.controller);
        }

	},

    /**
     * We always need upgraders
     * @returns {boolean}
     */
    spawn: function() {
        return true;
    }
};
