/** @var {lodash|_} _ */


const tools     = global.tools = require('./tools');

const Spawn = require('./spawn');

module.exports.loop = function() {
    tools.cleanup();
    tools.reset();

    _.each(Game.spawns, function(spawn) {
        Spawn(spawn);
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
