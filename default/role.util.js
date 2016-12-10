var nextResourceId = null;

/**
 * In reverse order, the body components for each level based on a creep role
 */
const roleLevels = {
    generic: [
        [WORK, CARRY, MOVE],
        [WORK, CARRY, CARRY, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, TOUGH]
    ]
};

var roleUtil = module.exports = {

    /**
     * Returns the number of creeps currently mining a resource
     *
     * @return {number}
     */
    resourceCreeps: function(source) {
        let total = 0;

        _.each(Game.creeps, function(creep) {
            if( creep && creep.memory && creep.memory.sourceId && creep.memory.sourceId === source.id ) {
                ++total;
            }
        });

        return total;
    },

    /**
     * Gather resources if necessary
     *
     * @param {Creep} creep
     * @param {*} closestTo
     *
     * @return {boolean} true: needs to gather, false: done gathering
     */
    getResources: function(creep, closestTo = null) {

        // Already carrying.. continue ONLY if not mining anymore
        if( creep.carry && creep.carry.energy ) {

            // Done mining
            if( ! creep.memory.sourceId || creep.carry.energy >= creep.carryCapacity ) {
                // Just finished
                if( creep.memory.sourceId ) {
                    creep.say('Gather.done');
                    creep.memory.sourceId = null;
                }
                return false;
            }
        }

        let sources     = creep.room.find(FIND_SOURCES),
            source      = null;

        // Fail
        if( !sources.length ) {
            creep.memory.sourceId = null;

            console.log('[ERROR] Could not find any sources to gather');
            creep.say(':(_hungry');
            this.moveOutOfTheWay(creep);

            return true;
        }

        // Already mining
        if( creep.memory.sourceId ) {
            source = _.find(sources, (_source) => _source.id === creep.memory.sourceId);
        }

        if( !source ) {
            // try finding the closest - unless if 5 or more are using or waiting
            source = (closestTo || creep).pos.findClosestByPath(FIND_SOURCES);
            if( !source || this.resourceCreeps(source) > 5 ) {
                // Sort by creep count
                source = _.sortBy(sources, (_source) => this.resourceCreeps(_source))[0];
            }
        }

        if( !creep.memory.sourceId || creep.memory.sourceId !== source.id ) {
            creep.say('Gathering');
            creep.memory.sourceId = source.id;
        }

        if( source && creep.harvest(source) === ERR_NOT_IN_RANGE ) {
            creep.moveTo(source);
        }

        return true;
    },

    moveOutOfTheWay: function(creep) {
        creep.moveTo(10, 10);
    },

    spawn: function(spawn, role, name = null, minLevel = 0) {
        let confs = roleLevels.generic;

        if( roleLevels.hasOwnProperty(role) ) {
            confs = roleLevels[role];
        }

        for(let level = confs.length - 1; level >= minLevel; level--) {
            if( spawn.canCreateCreep(confs[level]) === 0 ) {
                let newName = spawn.createCreep(confs[level], name, {role: role, level: level});
                return Game.creeps[newName];
            }
        }

        return false;
    }

}
