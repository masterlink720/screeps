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
    STRUCTURE_LAB
];

var roleBuilder = module.exports = {

    levels: [
        {work: 1, carry: 1, move: 1},
        {work: 1, carry: 2, move: 1},
        {work: 2, carry: 2, move: 1},
        {work: 2, carry: 3, move: 4},
        {work: 3, carry: 3, move: 4},
        {work: 4, carry: 3, move: 5},
        {work: 4, carry: 4, move: 5}
    ],

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            creep.memory.buildTargetId = null;

            return;
        }

        let target = null,
            targets = tools.getConstructionSites(creep.room);

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

        // Done or out of energy move on
        else if( !creep.carry.energy || target.progress >= target.progressTotal ) {
            return this.run(creep);
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
        return tools.getConstructionSites(spawn.room).length > 0;
    }
};
