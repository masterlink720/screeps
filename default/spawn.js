/** @var {lodash|_} _ */


const roles = {
    harvester:  require('./role.harvester'),
    miner:      require('./role.miner'),
    upgrader:   require('./role.upgrader'),
    builder:    require('./role.builder'),
    repairer:   require('./role.repairer'),
    waller:     require('./role.waller'),
    generic:    require('./role.generic'),
    settler:    require('./role.settler'),
    tower:      require('./tower')
};

const tools = global.tools = require('./tools');
const roleUtil = global.roleUtil = require('./role.util');

const creepThresholds = {
    harvester:  5,
    miner:      2,
    builder:    5,
    repairer:   3,
    waller:     1,
    upgrader:   6,
    settler:    0,
    generic:    0
};


/**
 *
 * @param {StructureSpawn} spawn
 */
let Spawn = module.exports =  {
    /** @param {StructureSpawn} spawn */
    run: function(spawn) {

        let allCreeps = {
            harvester:  tools.getCreeps(spawn.room, 'harvester'),
            miner:      tools.getCreeps(spawn.room, 'miner'),
            builder:    tools.getCreeps(spawn.room, 'builder'),
            upgrader:   tools.getCreeps(spawn.room, 'upgrader'),
            repairer:   tools.getCreeps(spawn.room, 'repairer'),
            waller:     tools.getCreeps(spawn.room, 'waller'),
            generic:    tools.getCreeps(spawn.room, 'generic'),
            settler:    tools.getCreeps(spawn.room, 'settler')
        };
        // allStructs = tools.getStructures(spawn.room, null, true);

        // console.log('All creeps' + JSON.stringify(allCreeps, null, 2));
        //] util.log('all creeps: ' + util.inspect(allCreeps, {color: true}));

        // Figure out the absolute total energy capacity
        //_.each( _.filter(allStructs, (struct) => struct.structureType === STRUCTURE_EXTENSION), function(ext) {
        //    totalEnergyCapacity += ext.energyCapacity;
        //});

        // Spawn creeps - skip if already spawning obviously
        // Also skip if there are creeps trying to regenerate

        if (!spawn.spawning && !tools.getCreeps(spawn.room, c => c.memory.regenSpawnId).length) {
            let minLevel = 5; // ~~((totalEnergyCapacity - 300) / 100);
            let minSettlerLevel = 0;

            // No Harvesters and no builders - reduce minLevel to 1
            if (!allCreeps.harvester.length || !allCreeps.upgrader.length) {
                minLevel = 1;
            }

            _.find(['harvester', 'upgrader', 'repairer', 'builder', 'waller', 'miner', 'settler', 'generic'], function(role) {
                // Skip if we don't need this type of creep or if we've reached the spawn limit
                if (allCreeps[role].length < creepThresholds[role] && roles[role].spawn(spawn)) {

                    let nextId = spawn.memory.nextCreepId || 0,
                        name = role[0].toUpperCase() + role.slice(1) + ' - ' + nextId;

                    let newCreep = roleUtil.spawn(spawn, role, name, role === 'settler' ? minSettlerLevel : minLevel);
                    if (newCreep) {
                        tools.dump('Spawning Creep', {
                            role: role,
                            name: newCreep.name
                        });

                        allCreeps[role].push(newCreep);

                        // Reset at 999
                        if ((spawn.memory.nextCreepId = nextId + 1) >= 999) {
                            spawn.memory.nextCreepId = 0;
                        }
                        return newCreep;
                    }
                }

                return false;
            });
        }

        // TODO upgrade creeps

        // Put the creeps to work
        _.each(allCreeps, function(creeps, role) {
            _.each(creeps, function (creep) {
                if (roles[role].run(creep) === false && role !== 'generic') {
                    roles.generic.run(creep);
                }

                // Update tools running creep memory
                else {
                    tools.updateCreep(creep);
                }
            });
        });

        /*
         if( false && incrementCreepConfigIndex && creepConfigIndex < creepConfigs.length ) {
         creepConfigIndex++;
         }
         */

        // Towers
        tools.getStructures(spawn.room, STRUCTURE_TOWER).forEach(function(tower) {
            roles.tower.run(tower);
        });
    },

    getStats: function(spawn) {
        // if( ! )
    }
};
