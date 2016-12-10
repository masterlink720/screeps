const roleUtil = require('./role.util');

var roleUpgrader = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            return;
        }

        if( creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE ) {
            creep.moveTo(creep.room.controller);
        }

	}
};
