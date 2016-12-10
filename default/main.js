/** @var {lodash|_} _ */


const roles = {
    harvester: require('./role.harvester'),
    upgrader: require('./role.upgrader'),
    builder: require('./role.builder'),
    generic: require('./role.generic')
};

const tools = require('./tools');
const roleUtil = require('./role.util');

const creepThresholds = {
    harvester:  5,
    builder:    10,
    upgrader:   12,
    generic:    2
};

/* @type TowerConfig[] */
const towers = [{
    coords: [32, 37]
}];

const spawn = Game.spawns[Object.keys(Game.spawns)[0]];

function _findCreeps(role) {
    return _.filter(Game.creeps, (creep) => creep.memory.role === role);
}

module.exports.loop = function() {
    tools.cleanup();

    let allCreeps = {
        harvester:  _findCreeps('harvester'),
        builder:    _findCreeps('builder'),
        upgrader:   _findCreeps('upgrader'),
        generic:    _findCreeps('generic')
    };

    // Spawn creeps - skip if already spawning obviously
    if( !spawn.spawning ) {
        let minLevel = spawn.room.controller.level - 2; // _.size(Game.creeps) >= 3 ? 1 : 0;

        _.find(['harvester', 'upgrader', 'builder', 'generic'], function(role) {
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

    /*
     let tower = Game.getObjectById('f9c4e0babc76c9ed0244b94a');
     if(tower) {
     let foe     = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS),
     friend  = tower.pos.findClosestByRange(FIND_STRUCTURES, {
     filter: (structure) => structure.hits < structure.hitsMax
     });

     if( friend ) {
     tower.repair(friend);
     }

     if( foe ) {
     tower.attack(foe);
     }
     }*/
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
