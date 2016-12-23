const roleUtil = require('./role.util');
const tools    = require('./tools');


var roleBuilder = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            creep.memory.wallTargetId = null;

            return;
        }

        let target = null,
            targets = tools.getStructures(creep.room,
                _struct => _struct.hits < _struct.hitsMax && (_struct.structureType === STRUCTURE_WALL || _struct.structureType === STRUCTURE_RAMPART)
            );

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

    },

    /**
     * Only spawn if we have walls to build
     */
    spawn: function(spawn) {
        return spawn.room.find(FIND_STRUCTURES, {
            filter: struct => struct.structureType === STRUCTURE_WALL
        }).length > 0;
    }
};
