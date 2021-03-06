const roleUtil = require('./role.util');
const tools    = require('./tools');


var roleWaller = module.exports = {

    levels: [
        {work: 1, carry: 1, move: 1},
        {work: 1, carry: 2, move: 2},
        {work: 2, carry: 2, move: 3},
        {work: 2, carry: 3, move: 3},
        {work: 2, carry: 3, move: 4},
        {work: 3, carry: 3, move: 4},
        {work: 5, carry: 3, move: 4}
    ],

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if( roleUtil.getResources(creep) ) {
            creep.memory.wallerTargetId = null;

            return;
        }

        let target = null,
            targets = tools.getStructures(creep.room,
                _struct => _struct.hits < _struct.hitsMax && (_struct.structureType === STRUCTURE_WALL || _struct.structureType === STRUCTURE_RAMPART)
            );

        // Derp
        if( !targets.length ) {
            creep.memory.wallerTargetId = null;
            return false;
        }

        // Sort by hits
        targets = _.sortBy(targets, 'hits')

        if( creep.memory.wallerTargetId ) {
            target = _.find(targets, (_target) => _target.id === creep.memory.wallerTargetId);

            // done building - move on
            if ( !target ) {
                creep.memory.wallerTargetId = null;
            }
        }

        // Use the first
        target = target || targets[0];

        // New target
        if (!creep.memory.wallerTargetId || creep.memory.wallerTargetId !== target.id) {
            creep.memory.wallerTargetId = target.id;

            console.log('Walling ' + target);
            creep.say('Walling.' + target);
        }

        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

        // Done or out of energy
        else if( !creep.carry.energy || target.hits >= target.hitsMax ) {
            return this.run(creep)
        }

    },

    /**
     * Only spawn if we have walls to build
     */
    spawn: function(spawn) {
        return tools.getStructures(spawn.room, s => (
            s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)
            && s.hits < s.hitsMax)
        .length > 0;
    }
};
