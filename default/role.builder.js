const roleUtil = require('role.util');

var roleBuilder = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            return;
        }

        if( creep.memory.building ) {
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if( targets.length ) {
                if( creep.build(targets[0]) === ERR_NOT_IN_RANGE ) {
                    creep.moveTo(targets[0]);
                }

                return true;
            }
        }

        // Nothing to build
        return false;

    }
};