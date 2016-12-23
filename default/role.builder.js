const roleUtil = require('./role.util');
const tools    = require('./tools');

const targetsOrder = [
    STRUCTURE_TOWER,
    STRUCTURE_EXTENSION,
    STRUCTURE_RAMPART,
    STRUCTURE_ROAD,
    STRUCTURE_CONTAINER,
    STRUCTURE_WALL,
    STRUCTURE_STORAGE,
    STRUCTURE_LAB,
];

var roleBuilder = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            creep.memory.buildTargetId = null;

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
        target = target || targets[0];

        // New target
        if (!creep.memory.buildTargetId || creep.memory.buildTargetId !== target.id) {
            creep.memory.buildTargetId = target.id;

            console.log('Building ' + target);
            creep.say('Building.' + target.name);
        }

        if (creep.build(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

    },

    /**
     * Spawns a new builder if needed
     *
     * Just returns true/false, indicating whether or not spawns are needed
     *
     * @return {boolean}
     */
    spawn: function(spawn) {

        // Spawn only if there are construction sites to be worked on
        return spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0;
    }
};
