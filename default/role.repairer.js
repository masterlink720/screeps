
const targetsOrder = [
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_ROAD,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
    STRUCTURE_EXTENSION,
    // STRUCTURE_WALL,
];

const roleUtil = require('./role.util');
const tools    = require('./tools');

var roleRepairer = module.exports = {
    levels: [
        {work: 1, carry: 1, move: 1},
        {work: 1, carry: 1, move: 2},
        {work: 1, carry: 1, move: 3},
        {work: 2, carry: 1, move: 3},
        {work: 2, carry: 2, move: 3},
        {work: 2, carry: 3, move: 4},
        {work: 2, carry: 3, move: 5}
    ],

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            creep.memory.repairerTargetId = null;

            return;
        }

        let target       = null,
            targets      = tools.getStructures(creep.room, struct => struct.hits < struct.hitsMax);

        // Derp
        if( !targets.length ) {
            creep.memory.repairerTargetId = null;
            return false;
        }

        // Only one target - pretty simple
        if( targets.length === 1 ) {
            target = targets[0];
            creep.memory.repairerTargetId = target.id;
        }

        else if( creep.memory.repairerTargetId ) {
            // tools.dump('Repairing from target', {creep_id: creep.name, target_id: creep.memory.repairerTargetId});
            target = _.find(targets, _target => _target.id === creep.memory.repairerTargetId);

            // done building - move on
            if ( !target ) {
                creep.memory.repairerTargetId = null;
            }
        }

        if (!target) {

            _.find(targetsOrder, function(targetType) {
                if( target ) return true;

                let typeTargets = _.filter(targets, {structureType: targetType});

                // None for thistype
                if( typeTargets.length === 0 ) {
                    return false;
                }

                // First sort by hits needed to repair, then by how many creeps are targeting it
                // Sort by the number of creeps currently repairing this, then by number of hit
                return target = _.sortBy(_.sortBy(typeTargets, t => t.hitsMax - t.hits),
                    t => roleUtil.targetCreeps(t, 'repairer'), 'hits')[0];

                /*
                let creepCounts = _.map(typeTargets, t => roleUtil.targetCreeps(t, 'repairer'));

                // If all the same, sort by hits
                if( creepCounts[0] === creepCounts.slice(-1) ) {
                    target = _.sortBy(typeTargets, 'hits')[0];
                }
                else {
                    target =
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

                    // Find targets that aren't currently being targeted by another repairer
                    target = _.sortBy(typeTargets, t => roleUtil.targetCreeps(t, 'repairer'))[0];


                    // target = target || _.find(targets, (_target) => _target.structureType === targetType);
                }
                */
            });
        }

        // Could not find one in our list of priorities - use whatever else we can find
        target = target || targets[0];

        // New target
        if (creep.memory.repairerTargetId !== target.id) {
            creep.memory.repairerTargetId = this.lastTargetId = target.id;

            console.log('Repairing ' + target);
            creep.say('Repairing.' + target.name);
        }

        let res = creep.repair(target);
        if (res === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

        // Out of energy
        else if(res === ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.repairerTargetId = null;

            return this.run(creep);
        }

        // Done or out of energy, run again
        else if( !creep.carry.energy || target.hits >= target.hitsMax ) {
            creep.memory.repairerTargetId = null;

            return this.run(creep);
        }
    },

    /**
     * Only if we have roads or containers to maintain
     * @param spawn
     */
    spawn: function(spawn) {

        return tools.getStructures(spawn.room, struct =>
            struct.structureType === STRUCTURE_ROAD || struct.structureType === STRUCTURE_CONTAINER)
            .length > 0;
    }
};
