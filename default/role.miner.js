
const roleUtil = require('./role.util');
const tools    = require('./tools');

var roleMiner = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Attempt regen
        if( !creep.memory.minerTargetId ) {
            if( this.regen(creep) ) {
                return true;
            }
        }

        let target = null,

            // Filter out those with full energy
            targets = tools.getStructures(creep.room, STRUCTURE_EXTRACTOR);

        // Fail
        if( !targets.length ) {
            creep.memory.minerTargetId = null;
            return false;
       }

        // Already has a transfer target
        if (creep.memory.minerTargetId) {
            target = _.find(targets, _target => _target.id === creep.memory.minerTargetId);
        }

        target = target || targets[0];

        // New target
        if (!creep.memory.minerTargetId || creep.memory.minerTargetId !== target.id) {
            creep.memory.minerTargetId = target.id;

            console.log('Depositing energy to ' + target);
            creep.say('Transfer.' + target);
        }

        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

        // Start moving immediately to the next target
        else if (!creep.carry.energy) {
            return this.run(creep);
        }

        // Target is full, start the next target immediately
        else if (target.energy >= target.energyCapacity || target.store >= target.storeCapacity) {
            return this.run(creep);
        }
    },

    /**
     * Attempts to find any container or storage targets that are immediately adjacent
     *  to the given creep
     */
    findAdjacentTarget: function(creep) {
        let targets = tools.getStructures(creep.room, STRUCTURE_CONTAINER);

        return _.find(targets, function(target) {
            return target.energy < target.energyCapacity &&
                creep.pos.isNearTo(target);
        });
    },

    /**
     * @todo build this
     * @returns {boolean}
     */
    spawn: function() {
        return false;
    }
};
