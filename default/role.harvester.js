const targetsOrder = [
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,
    STRUCTURE_CONTAINER,
    STRUCTURE_SPAWN,
    STRUCTURE_LAB,
    STRUCTURE_STORAGE,
];

const roleUtil = require('./role.util');
const tools    = require('./tools');

var roleHarvester = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Gathering
        if (roleUtil.getResources(creep)) {
            // Previous had a dropoff target
            creep.memory.transferTargetId = null;

            // If we can, despoit energy directly into nearby container
            // TODO conditionally allow this, but don't allow it to prevent
            // spawns and extensions from getting energy
            /*
            if( creep.carry.energy ) {
                let target = this.findAdjacentTarget(creep);
                if( target ) {
                    creep.transfer(target, RESOURCE_ENERGY);
                }
            }*/

            return;
        }

        let target = null,

            // Filter out those with full energy
            targets = tools.getStructures(creep.room, function(struct) {
                if (!_.includes(targetsOrder, struct.structureType)) {
                    return false;
                }

                return struct.store < struct.storeCapacity || struct.energy < struct.energyCapacity;
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
        target = target || creep.pos.findClosestByPath(targets) || targets[0];

        // New target
        if (!creep.memory.transferTargetId || creep.memory.transferTargetId !== target.id) {
            creep.memory.transferTargetId = target.id;

            console.log('Depositing energy to ' + target);
            creep.say('Transfer.' + target);
        }

        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }

        // Start moving immediately to the next target
        else if (!creep.carry.energy) {
            return this.run(creep);
        }

        // Target is full, start the next target immediately
        else if (target.energy >= target.energyCapacity || target.store >= target.storeCapacity) {
            return this.run(creep);
        }
    },

    /**
     * Attempts to find any container or storage targets that are immediately adjacent
     *  to the given creep
     */
    findAdjacentTarget: function(creep) {
        let targets = tools.getStructures(creep.room, STRUCTURE_CONTAINER);

        return _.find(targets, function(target) {
            return target.energy < target.energyCapacity &&
                creep.pos.isNearTo(target);
        });
    },

    /**
     * We always need harvesters
     * @returns {boolean}
     */
    spawn: function() {
        return true;
    }
};
