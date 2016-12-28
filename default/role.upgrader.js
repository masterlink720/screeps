const roleUtil = require('./role.util');

var roleUpgrader = module.exports = {

    levels: [
        {WORK: 1, CARRY: 1, MOVE: 1},
        {WORK: 1, CARRY: 2, MOVE: 1},
        {WORK: 2, CARRY: 2, MOVE: 1},
        {WORK: 2, CARRY: 3, MOVE: 1},
        {WORK: 3, CARRY: 3, MOVE: 1},
        {WORK: 3, CARRY: 3, MOVE: 3},
        {WORK: 4, CARRY: 3, MOVE: 3}
    ],

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

        // Out of energy, run again
        else if( !creep.carry.energy ) {
            return this.run(creep);
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
