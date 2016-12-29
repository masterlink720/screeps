const roleUtil = require('./role.util');

var roleUpgrader = module.exports = {

    levels: [
        {work: 1, carry: 1, move: 1},
        {work: 1, carry: 2, move: 1},
        {work: 2, carry: 2, move: 1},
        {work: 2, carry: 3, move: 1},
        {work: 3, carry: 3, move: 1},
        {work: 3, carry: 3, move: 3},
        {work: 4, carry: 3, move: 3}
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
