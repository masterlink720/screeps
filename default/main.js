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

const tools     = require('./tools');
const roleUtil  = require('./role.util');

const creepThresholds = {
    harvester:  6,
    builder:    5,
    repairer:   3,
    waller:     2,
    upgrader:   5,
    generic:    0
};

/* @type TowerConfig[] */
/*const towers = [{
    coords: [32, 37]
}];*/

function _findCreeps(role) {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role);
}

module.exports.loop = function() {
    let spawn               = Game.spawns[Object.keys(Game.spawns)[0]],
        totalEnergyCapacity = spawn.energyCapacity;

    tools.cleanup();

    // Figure out the absolute total energy capacity
    _.each(spawn.room.find(FIND_MY_STRUCTURES, {filter: (struct) => struct.structureType === STRUCTURE_EXTENSION}), function(ext) {
        totalEnergyCapacity += ext.energyCapacity;
    });

    let allCreeps = {
        harvester:  _findCreeps('harvester'),
        builder:    _findCreeps('builder'),
        upgrader:   _findCreeps('upgrader'),
        repairer:   _findCreeps('repairer'),
        waller:     _findCreeps('waller'),
        generic:    _findCreeps('generic')
    };

    // Spawn creeps - skip if already spawning obviously
    if( !spawn.spawning ) {
        let minLevel = 4; // ~~((totalEnergyCapacity - 300) / 100);
        
        // No Harvesters and no builders - reduce minLevel to 1
        if( !allCreeps.harvester.length || !allCreeps.upgrader.length ) {
            minLevel = 0;
        }

        _.find(['harvester', 'upgrader', 'repairer', 'builder', 'waller', 'generic'], function(role) {
            if( allCreeps[role].length < creepThresholds[role] ) {

                let newCreep = roleUtil.spawn(spawn, role, null, minLevel);
                if( newCreep ) {
                    console.log(`Spawning new ${role}: ${newCreep.name}`);

                    allCreeps[role].push(newCreep);
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
    let towers = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: (struct) => struct.structureType === STRUCTURE_TOWER
    });

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
