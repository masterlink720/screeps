const roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
};

function printRoomEnergy() {
    console.log(`Room [${name}] has ${Game.rooms[name].energyAvailable} energy`);
}

function _harvesters() {
    return _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
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

    let harvesters = _harvesters();
    console.log(`Harvester count: ${harvesters.length}`);

    // Need at least 2 harvesters
    if (harvesters.length < 2) {
        let newName = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], undefined, { role: 'harvester' });
        console.log(`Spawning new harvester (${newName})`);
    }

    _.each(Game.creeps, function(creep) {
        if (roles.hasOwnProperty(creep.memory.role)) {
            roles[creep.memory.role].run(creep);
        }
    });

}



// Create turret
// Game.spawns.Spawn1.room.createConstructionSite( 23, 22, STRUCTURE_TOWER );