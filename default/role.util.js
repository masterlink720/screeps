
const tools = require('./tools');

/**
 * In reverse order, the body components for each level based on a creep role
 */
const roleLevels = {
    generic: [
        [WORK, CARRY, MOVE],
        [WORK, CARRY, MOVE, MOVE],
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
        [WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
    ],
    settler: [
        [CLAIM, MOVE],
        [CLAIM, MOVE, MOVE],
    ]
};

var roleUtil = module.exports = {

    targetCreeps: function(target, role) {
        let total = 0,
            prop = `${role}TargetId`;

        _.each(tools.getCreeps(target.room), function(creep) {
            if( creep.memory[prop] && creep.memory[prop] === target.id ) {
                total++;
            }
        });

        return total;
    },

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

            // 'closest to' specified
            source = (closestTo || creep).pos.findClosestByPath(sources);

            // If full, try finding one with fewer creeps
            if( this.resourceCreeps(source) >= 3 ) {
                let nextSource = _.sortBy(sources, s => this.resourceCreeps(s))[0];
                if( this.resourceCreeps(nextSource) < 5 ) {
                    source = nextSource;
                }
            }

            /*
            // try finding the closest - unless if 5 or more are using or waiting
            source = (closestTo || creep).pos.findClosestByPath(sources);
            if( !source || this.resourceCreeps(source) > 4 ) {
                // Sort by creep count
                source = _.sortBy(sources, _source => this.resourceCreeps(_source))[0];
            }*/
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

            // Try picking it up
            if( harvestResult === ERR_INVALID_TARGET ) {
                harvestResult = creep.pickup(source);
            }
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
     * Calculates the cost to regenerate a creep
     *
     * @param creep
     */
    creepRegenCost: function(creep) {

        let ttlDiff         = creep.memory.ttlCapacity - creep.ticksToLive,
            ticksRequired   = Math.ceil(ttlDiff / creep.memory.renewPerTick);

        return creep.memory.renewPerTick * ticksRequired;

    },

    /**
     * Should be called when the creep is not currently doing anything
     *
     * If the creep's TTL is below a certain threshold, send it to the spawn to
     *  be renewed
     *
     * @param {Creep} creep
     * @param {number} [threshold=ticksToLive]
     *
     * @return {boolean}
     *  true: needs to regenerate, stop further actions
     *  false: no regeneration, continue
     */
    regen: function(creep, threshold = 50) {
        // TODO conditionally enable this if the cost to regenerate is less than it would be to spawn
         // return false;

        // Above minimum - don't regen unless we've already started
        if( creep.ticksToLive > threshold && !creep.memory.regenSpawnId ) {
            return false;
        }

        // Let it die
        if( creep.memory.regenDisabled ) {
            return false;
        }

        // Calculate the cost - unless we've already begun regenerating (aka we're in range)
        if( !creep.memory.regenStarted ) {
            if( this.creepRegenCost(creep) > creep.memory.spawnCost ) {
                /*
                tools.dump('Regen too costly', {
                    name: creep.name,
                    regenCost: this.creepRegenCost(creep),
                    spawnCost: creep.memory.spawnCost
                });
                */

                creep.memory.regenDisabled = true;
                creep.memory.regenSpawnId = null;

                return true;
            }
            /*
            else {
                tools.dump('Regen affordable', {
                    name: creep.name,
                    regenCost: this.creepRegenCost(creep),
                    spawnCost: creep.memory.spawnCost
                });
            }
            */
        }


        let spawns = tools.getStructures(creep.room, STRUCTURE_SPAWN),
            spawn;

        // No spawns nearby, just let it die
        if( !spawns.length ) {
            creep.memory.regenSpawnId = null;
            creep.memory.regenDisabled = true;
            creep.memory.regenStarted = false;
            return false;
        }

        if( creep.memory.regenSpawnId ) {
            spawn = _.find(spawns, s => s.id === creep.memory.regenSpawnId);
        }

        spawn = spawn || creep.pos.findClosestByPath(spawns);
        if( creep.memory.regenSpawnId !== spawn.id ) {
            creep.memory.regenSpawnId = spawn.id;

            tools.dump('Regenerating', {
                creep: creep.name,
                ttl:   creep.ticksToLive,
                memory: creep.memory.regenSpawnId,
                regenCost: this.creepRegenCost(creep),
                spawnCost: creep.memory.spawnCost,
                span: spawn.id
            });
            creep.say('Regenerating');
        }

        // let ttlBefore = creep.ticksToLive;
        let res = spawn.renewCreep(creep);
        if( res === ERR_NOT_IN_RANGE ) {
            creep.moveTo(spawn, {reusePath: 100});
        }

        // No energy - permanently flag this creep as inelligible for regen
        /*
        else if( res === ERR_NOT_ENOUGH_ENERGY ) {
            creep.memory.regenSpawnId = null;
            creep.memory.regenDisabled = true;

            return false;
        }
        */

        else if( res === ERR_FULL ) {
            tools.dump('Regen complete', {
                creep: creep.name,
                ttl: creep.ticksToLive
            });

            creep.memory.regenStarted = false;
            creep.memory.regenSpawnId = null;

            return false;
        }

        else if( res == OK ) {
            creep.memory.regenStarted = true;
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
                let newName     = spawn.createCreep(confs[level], name, {role: role, level: level}),
                    newCreep    = Game.creeps[newName];

                // Save some meta data
                newCreep.memory.spawnCost           = 0;
                newCreep.memory.ttlCapacity         = newCreep.ticksToLive;
                newCreep.memory.renewPerTick        = ~~(600 / newCreep.body.length);
                newCreep.memory.renewCostPerTick    = Math.ceil(600 / 2.5 / newCreep.body.length);

                _.each(confs[level], function(part) {
                    newCreep.memory.spawnCost += BODYPART_COST[part]
                });

                return Game.creeps[newName];
            }
        }

        return false;
    }

}
