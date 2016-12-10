const targetsOrder = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION
];

const roleUtil = require('./role.util');

var roleHarvester = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if (roleUtil.getResources(creep) === true) {

            // Previous had a dropoff target
            if (creep.memory.transferTargetId) {
                creep.memory.transferTargetId = null;
            }

            return;
        }

        let target = null,

            // Filter out those with full energy
            targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (struct) => struct.hasOwnProperty('energy') && struct.energy < struct.energyCapacity
            });

        // Fail
        if( !targets.length ) {
            creep.memory.transferTargetId = null;
            return false;
        }

        // Already has a transfer target
        if (creep.memory.transferTargetId) {
            target = _.find(targets, (_target) => _target.id === creep.memory.transferTargetId);
        }

        if (!target) {
            // Try finding the closest structure, in order of priority
            _.each(targetsOrder, function(targetType) {
                target = target || creep.pos.findClosestByPath(
                    _.filter(targets, (_target) => _target.structureType === targetType)
                );
            });
        }

        // Blah just find the closest one period
        target = target || creep.pos.findClosestByPath(targets);

        // New target
        if (!creep.memory.transferTargetId || creep.memory.transferTargetId !== target.id) {
            creep.memory.transferTargetId = target.id;

            console.log('Sending energy to ' + target);
            creep.say('Transfer.' + target.name);
        }

        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

    }
};
