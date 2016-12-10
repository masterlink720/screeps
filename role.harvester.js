const targetsOrder = [
    STRUCTURE_SPAWN,
    STRUCTURE_TOWER,
    STRUCTURE_EXTENSION,
    STRUCTURE_CONTROLLER
];

const roleUtil = require('role.util');

var roleHarvester = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if (roleUtil.getResources(creep) === true) {

            // Previous had a dropoff target
            if (creep.memory.transferTarget) {
                creep.memory.transferTarget = null;
            }

            return;
        }

        let target = null,
            targets = creep.room.find(FIND_STRUCTURES);

        // Already has a transfer target
        if (creep.memory.transferTarget) {
            target = _.find(targets, (_target) => _target.id === creep.memory.transferTargetId);

            // We filled it up, move on
            if (target && target.energy >= (target.energyCapacity || target.energyCapacityAvailable)) {
                creep.memory.transferTargetIs = null;
                target = null;
            }
        }


        if (!target) {
            let targetTypes = {};
            _.each(targets, function(_target) {
                if (!_.includes(targetsOrder, _target.structureType)) {
                    return;
                }

                if (!targetTypes.hasOwnProperty(_target.structureType)) {
                    targetTypes[_target.structureType] = [_target];
                } else {
                    targetTypes[_target.structureType].push(_target);
                }
            });

            _.each(targetsOrder, function(targetType) {
                // Already found
                if (target) {
                    return;
                }

                if (targetTypes.hasOwnProperty(targetType) && targetTypes[targetType].length) {

                    // TODO rotate through all, round-robin like
                    target = _.find(targetTypes[targetType], function(_target) {
                        return _target.energy < (_target.energyCapacity || _target.energyCapacityAvailable);
                    });
                }
            });

        }

        // No targets
        if (!target) {
            creep.say('no target');
            console.log('* no targets');
            return false;
        }

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