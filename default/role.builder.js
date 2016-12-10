const roleUtil = require('role.util');

const targetsOrder = [
    STRUCTURE_TOWER,
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_STORAGE
];

var roleBuilder = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            // Had previous build targets
            if( creep.memory.buildTargetId ) {
                creep.memory.buildTargetId = null;
            }

            return;
        }

        let target = null,
            targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);

        // Derp
        if( !targets.length ) {
            creep.memory.buildTargetId = null;
            return false;
        }

        if( creep.memory.buildTargetId ) {
            target = _.find(targets, (_target) => _target.id === creep.memory.buildTargetId);

            // done building - move on
            if ( !target ) {
                creep.memory.buildTargetId = null;
            }
        }

        if (!target) {
            _.each(targetsOrder, function(targetType) {
                target = target || _.find(targets, (_target) => _target.structureType === targetType);
            });
        }

        // Could not find one in our list of priorities - use whatever else we can find
        target = target || target;

        // New target
        if (!creep.memory.buildTargetId || creep.memory.buildTargetId !== target.id) {
            creep.memory.buildTargetId = target.id;

            console.log('Building ' + target);
            creep.say('Building.' + target.name);
        }

        if (creep.build(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

    }
};
