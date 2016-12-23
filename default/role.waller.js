const roleUtil = require('./role.util');


var roleBuilder = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            creep.memory.wallTargetId = null;

            return;
        }

        let target = null,
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (_struct) => _struct.hits < _struct.hitsMax && (_struct.structureType === STRUCTURE_WALL || _struct.structureType === STRUCTURE_RAMPART)
            });

        // Derp
        if( !targets.length ) {
            creep.memory.wallTargetId = null;
            return false;
        }

        // Sort by hits
        targets = _.sortBy(targets, 'hits')

        if( creep.memory.wallTargetId ) {
            target = _.find(targets, (_target) => _target.id === creep.memory.wallTargetId);

            // done building - move on
            if ( !target ) {
                creep.memory.wallTargetId = null;
            }
        }

        // Use the first
        target = target || targets[0];

        // New target
        if (!creep.memory.wallTargetId || creep.memory.wallTargetId !== target.id) {
            creep.memory.wallTargetId = target.id;

            console.log('Walling ' + target);
            creep.say('Walling.' + target);
        }

        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

    }
};
