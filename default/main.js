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
    harvester: 3,
    builder: 1,
    upgrader: 1,
    generic: 6
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
        harvester: _findCreeps('harvester'),
        builder: _findCreeps('builder'),
        upgrader: _findCreeps('upgrader'),
        generic: _findCreeps('generic')
    };

    // Spawn creeps
    // let incrementCreepConfigIndex = true;
    _.each(['harvester', 'builder', 'upgrader', 'generic'], function(role) {
        let creeps = allCreeps[role];

        let newCreep;
        while( creeps.length < creepThresholds[role] && (newCreep = roleUtil.spawn(spawn, role)) ) {
            creeps.push(newCreep);

            console.log(`New ${role} spawned: ${newCreep.name}`);
        }

    });

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
// Game.spawns.Spawn1.room.createConstructionSite( 23, 22, STRUCTURE_TOWER );

// Create upgrader
// Game.spawns.Spawn1.createCreep([WORK, WORK, MOVE], undefined, {role: 'upgrader'})

// Clear all energy dropoff targets:
// _.each(Game.creeps, (creep) => creep.memory.transferTargetId = null)

// Clear all harvester sources
// _.each(Game.creeps, (creep) => creep.memory.sourceId = null)
