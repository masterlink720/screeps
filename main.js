const roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
};

const spawn = Game.spawns.s1;

function printRoomEnergy() {
    console.log(`Room [${name}] has ${Game.rooms[name].energyAvailable} energy`);
}

function _harvesters() {
    return _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
}


function _builders() {
    return _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
}

function _upgraders() {
    return _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
}

/**
 * Clean up memory - remove dead workers
 */
function _cleanup() {
    _.each(Object.keys(Memory.creeps), function(name) {
        let cleanCount = 0;

        if (!Game.creeps[name]) {
            console.log(`Clearing non-existing creep memory: ${name}`);

            delete Memory.creeps[name];
            ++cleanCount;
        }

        if (cleanCount) {
            console.log(`Cleaned up ${cleanCount} dead creep(s) from memory`);
        }
    })
}

module.exports.loop = function() {
    _cleanup();

    let harvesters = _harvesters(),
        builders = _builders(),
        upgraders = _upgraders();

    console.log(`Harvester count: ${harvesters.length}`);

    // Need at least 2 harvesters, builders, and upgrades
    if (harvesters.length < 2) {
        let newName = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'harvester' });
        if (!(newName < 0)) {
            console.log(`Spawning new harvester (${newName})`);
        }
    }
    if (builders.length < 2) {
        let newName = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'builder' });
        if (!(newName < 0)) {
            console.log(`Spawning new harvester (${newName})`);
        }
    }
    if (builders.length < 2) {
        let newName = spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], undefined, { role: 'upgrader' });
        if (!(newName < 0)) {
            console.log(`Spawning new harvester (${newName})`);
        }
    }

    _.each(Game.creeps, function(creep) {
        if (roles.hasOwnProperty(creep.memory.role)) {
            roles[creep.memory.role].run(creep);
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