const roleUtil = require('role.util');

const targetsOrder = [
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_ROAD,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
    STRUCTURE_EXTENSION,
    STRUCTURE_WALL,
];

var roleBuilder = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            // Had previous build targets
            if( creep.memory.repairTargetId ) {
                creep.memory.repairTargetId = null;
            }

            return;
        }

        let target = null,
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (_struct) => _struct.hits < _struct.hitsMax
            });

        // console.log(`repair targets: ${targets}`);

        // Derp
        if( !targets.length ) {
            creep.memory.repairTargetId = null;
            return false;
        }

        if( creep.memory.repairTargetId ) {
            target = _.find(targets, (_target) => _target.id === creep.memory.repairTargetId);

            // done building - move on
            if ( !target ) {
                creep.memory.repairTargetId = null;
            }
        }

        if (!target) {
            _.each(targetsOrder, function(targetType) {
                if( target ) {
                    return;
                }

                // For walls, find the wall with the fewest hits
                if( targetType === STRUCTURE_WALL ) {
                    target = _.sortBy(_.filter(targets, (_target) => _target.structureType === targetType), 'hits');
                    if( target.length ) {
                        target = target[0];
                    }
                    else {
                        target = null;
                    }
                }

                else {
                    target = target || _.find(targets, (_target) => _target.structureType === targetType);
                }
            });
        }

        // Could not find one in our list of priorities - use whatever else we can find
        target = target || targets[0];

        // New target
        if (!creep.memory.repairTargetId || creep.memory.repairTargetId !== target.id) {
            creep.memory.repairTargetId = target.id;

            console.log('Repairing ' + target);
            creep.say('Repairing.' + target.name);
        }

        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

    }
};
