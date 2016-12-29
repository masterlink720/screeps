
const tools = require('./tools');

/**
 * In reverse order, the body components for each level based on a creep role
 */
const roleLevels = {
    generic: [
        [WORK, CARRY, MOVE],
        [WORK, CARRY, CARRY, MOVE],
        [WORK, CARRY, CARRY, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    ],
    upgrader: [
        [WORK, CARRY, MOVE],
        [WORK, CARRY, CARRY, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]
    ],
    repairer: [
        [WORK, CARRY, MOVE],
        [WORK, CARRY, MOVE, MOVE],
        [WORK, CARRY, MOVE, MOVE, MOVE],
        [WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
    ],
    settler: [
        [CLAIM, MOVE],
        [CLAIM, MOVE, MOVE],
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

        _.each(tools.getCreeps(source.room, function(creep) {
            if( creep && creep.memory && creep.memory.sourceId && creep.memory.sourceId === source.id ) {
                ++total;
            }
        }));

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
                creep.memory.sourceId = null;
                return false;
            }
        }

        // Regen if appropriate
        if( !creep.memory.sourceId ) {
            if( this.regen(creep) ) {
                return true;
            }
        }

        let sources     = tools.getEnergy(creep.room, creep.memory.role === 'harvester', creep.memory.role !== 'harvester'),
            source      = null;

        // Fail
        if( !sources.length ) {
            // Included sources
            if( creep.memory.role !== 'harvester' ) {
                sources = tools.getEnergy(creep.room);
            }
            if( !sources.length ) {
                creep.memory.sourceId = null;

                console.log('[ERROR] Could not find any sources to gather');
                creep.say(':(_hungry');
                this.moveOutOfTheWay(creep);

                return true;
            }
        }

        // Already mining
        if( creep.memory.sourceId ) {
            source = _.find(sources, _source => _source.id === creep.memory.sourceId);
        }

        if( !source ) {
            // try finding the closest - unless if 5 or more are using or waiting
            source = (closestTo || creep).pos.findClosestByPath(sources);
            if( !source || this.resourceCreeps(source) > 4 ) {
                // Sort by creep count
                source = _.sortBy(sources, _source => this.resourceCreeps(_source))[0];
            }
        }

        if( !creep.memory.sourceId || creep.memory.sourceId !== source.id ) {
            creep.say('Gathering');
            console.log(`${creep.memory.role} gathering from ${source}`);
            creep.memory.sourceId = source.id;
        }

        let harvestResult;

        // Structure - withdraw
        if( source.structureType ) {
            harvestResult = creep.withdraw(source, RESOURCE_ENERGY);
        }
        else {
            harvestResult = creep.harvest(source)
        }

        if( harvestResult === ERR_NOT_IN_RANGE || harvestResult === ERR_NOT_ENOUGH_RESOURCES ) {
            creep.moveTo(source);
        }

        // If we're done gathering, return false to allow the next task
        else if( creep.carry.energy >= creep.carryCapcity ) {
            creep.memory.sourceId = null;
            return false;
        }

        return true;
    },

    /**
     * Should be called when the creep is not currently doing anything
     *
     * If the creep's TTL is below a certain threshold, send it to the spawn to
     *  be renewed
     *
     * @param {Creep} creep
     * @param {number} minLevel - creep must be at least this level for us to care
     * @param {number} [threshold=ticksToLive]
     *
     * @return {boolean}
     *  true: needs to regenerate, stop further actions
     *  false: no regeneration, continue
     */
    regen: function(creep, maxDistance = 6, minLevel = 5, threshold = 50, targetThreshold = 1000) {
        // TODO disble this
        return false;

        // Leet the weak die
        if( creep.memory.level < minLevel || creep.memory.regenDisabled ) {
            return false;
        }

        // If above the threshold, continue going if we've already begun
        if( creep.ticksToLive > threshold && !creep.memory.regenSpawnId ) {
            return false;
        }

        let spawns = tools.getStructures(creep.room, function(s) {
                return s.structureType === STRUCTURE_SPAWN &&
                    creep.pos.distanceTo(s) <= maxDistance
            }),
            spawn;

        // No spawns nearby, just let it die
        if( !spawns.length ) {
            creep.memory.regenSpawnId = null;
            creep.memory.regenDisabled = true;
            return false;
        }

        if( creep.memory.regenSpawnId ) {
            spawn = _.find(spawns, s => s.id === creep.memory.regenSpawnId);
        }

        spawn = spawn || spawns[0];
        if( creep.memory.regenSpawnId !== spawn.id ) {
            creep.memory.regenSpawnId = spawn.id;

            tools.dump('Regenerating', {
                creep: creep.name,
                ttl:   creep.ticksToLive,
                memory: creep.memory.regenSpawnId,
                spaw_id: spawn.id
            });
            creep.say('Regenerating');
        }

        let ttlBefore = creep.ticksToLive;
        let res = spawn.renewCreep(creep);
        if( res === ERR_NOT_IN_RANGE ) {
            creep.moveTo(spawn, {reusePath: 100});
        }

        // No energy - permanently flag this creep as inelligible for regen
        else if( res === ERR_NOT_ENOUGH_ENERGY ) {
            creep.memory.regenSpawnId = null;
            creep.memory.regenDisabled = true;

            return false;
        }

        else if( res === ERR_FULL || creep.ticksToLive >= targetThreshold ) {
            tools.dump('Regen complete', {
                creep: creep.name
            });

            creep.memory.regenSpawnId = null;
            return false;
        }

        return true;
    },

    /**
     * Attempts to withdraw resources from the nearest container or storage
     *
     * Returns false if unable
     */
    withdrawResources: function(creep) {
        // Harvester - don't even try
        if( creep.memory.role === 'harvester' ) {
            return false;
        }
    },

    moveOutOfTheWay: function(creep) {
        creep.moveTo(10, 10);
    },

    /**
     * Returns an array of body components for
     *  the level of a given creep role
     *
     * @param role
     * @param level
     */
    levelComponents: function(role, level) {

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
