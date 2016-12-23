const targetsOrder = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_LAB,
    STRUCTURE_CONTAINER,
    STRUCTURE_STORAGE,
];

const roleUtil = require('./role.util');
const tools    = require('./tools');

var roleHarvester = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if (roleUtil.getResources(creep) ) {

            // Previous had a dropoff target
            if (creep.memory.transferTargetId) {
                creep.memory.transferTargetId = null;
            }

            return;
        }

        let target = null,

            // Filter out those with full energy
            targets = tools.getStructures(creep.room,
                struct => _.includes(targetsOrder, struct.structureType) && struct.energy < struct.energyCapacity
            );

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
        target = target || creep.pos.findClosestByPath(targets) || targets[0];

        // New target
        if (!creep.memory.transferTargetId || creep.memory.transferTargetId !== target.id) {
            creep.memory.transferTargetId = target.id;

            console.log('Sending energy to ' + target);
            creep.say('Transfer.' + target);
        }

        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

    },

    /**
     * We always need harvesters
     * @returns {boolean}
     */
    spawn: function() {
        return true;
    }
};
