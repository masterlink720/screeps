/** @var {lodash|_} _ */


const roles = {
    harvester:  require('./role.harvester'),
    upgrader:   require('./role.upgrader'),
    builder:    require('./role.builder'),
    repairer:   require('./role.repairer'),
    waller:     require('./role.waller'),
    generic:    require('./role.generic'),
    tower:      require('./tower')
};

const tools     = global.tools = require('./tools');
const roleUtil  = global.roleUtil = require('./role.util');

const creepThresholds = {
    harvester:  6,
    builder:    5,
    repairer:   3,
    waller:     2,
    upgrader:   6,
    generic:    0
};


function _findCreeps(role) {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role);
}

module.exports.loop = function() {
    let spawn               = Game.spawns[Object.keys(Game.spawns)[0]],
        totalEnergyCapacity = spawn.energyCapacity;

    tools.cleanup();

    let allCreeps = {
            harvester:  tools.getCreeps(spawn.room, 'harvester', true),
            builder:    tools.getCreeps(spawn.room, 'builder'),
            upgrader:   tools.getCreeps(spawn.room, 'upgrader'),
            repairer:   tools.getCreeps(spawn.room, 'repairer'),
            waller:     tools.getCreeps(spawn.room, 'waller'),
            generic:    tools.getCreeps(spawn.room, 'generic'),
        },
        allStructs = tools.getStructures(spawn.room, null, true);


    // Figure out the absolute total energy capacity
    _.each( _.filter(allStructs, (struct) => struct.structureType === STRUCTURE_EXTENSION), function(ext) {
        totalEnergyCapacity += ext.energyCapacity;
    });

    // Spawn creeps - skip if already spawning obviously
    if( !spawn.spawning ) {
        let minLevel = 1; // ~~((totalEnergyCapacity - 300) / 100);

        // No Harvesters and no builders - reduce minLevel to 1
        if( !allCreeps.harvester.length || !allCreeps.upgrader.length ) {
            minLevel = 0;
        }

        _.find(['harvester', 'upgrader', 'repairer', 'builder', 'waller', 'generic'], function(role) {
            // Skip if we don't need this type of creep or if we've reached the spawn limit
            if( allCreeps[role].length < creepThresholds[role] && roles[role].spawn(spawn) ) {

                let nextId = spawn.memory.nextCreepId || 0,
                    name = role[0].toUpperCase() + role.slice(1) + ' - ' + nextId;

                let newCreep = roleUtil.spawn(spawn, role, name, minLevel);
                if( newCreep ) {
                    console.log(`Spawning new ${role}: ${newCreep.name}`);

                    allCreeps[role].push(newCreep);

                    // Reset at 999
                    if( (spawn.memory.nextCreepId = nextId + 1) >= 9999 ) {
                        spawn.memory.nextCreepId = 0;
                    }
                    return newCreep;
                }
            }

            return false;
        });
    }

    /*
     if( false && incrementCreepConfigIndex && creepConfigIndex < creepConfigs.length ) {
     creepConfigIndex++;
     }
     */

    // TODO upgrade creeps

    // Put the creeps to work
    _.each(Game.creeps, function(creep) {
        let role = creep.memory.role;

        if (roles[role].run(creep) === false && role !== 'generic') {
            roles.generic.run(creep);
        }
    });

    // Towers
    let towers = _.filter(allStructs, (struct) => struct.stuctureType === STRUCTURE_TOWER);
    _.each(towers, function(tower) {
        roles.tower.run(tower);
    });

};



// Create turret
// Game.spawns.s1.room.createConstructionSite( 23, 22, STRUCTURE_TOWER );

// Create upgrader
// Game.spawns.s1.createCreep([WORK, WORK, MOVE], undefined, {role: 'upgrader'})

// Clear all energy dropoff targets:
// _.each(Game.creeps, (creep) => creep.memory.transferTargetId = null)

// Clear all harvester sources
// _.each(Game.creeps, (creep) => creep.memory.sourceId = null)

// Build extension
// Game.spawns.s1.room.createConstructionSite( 25, 31, STRUCTURE_EXTENSION );
