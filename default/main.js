/** @var {lodash|_} _ */



/** Nodes from Adam

Turns out the game is annoyingly player driven
I did a bit of reverse engineering by watching the top players
So here's how they do it
You plant a flag on the thing you want to mine
Of a specific colour
Then you make the FLAG the smart thing
The flag knows how to find the nearest base
And plot a path to the nearest storage whatever
And it caches that path
For some time

Then it requests a bot from the spawn
Once the bot exists, the flag locks ownership of it
And the bot now only needs to know how to do two things
Move to it's owner's position
Move to it's drop off
The mine also calculates how big the creep needs to be
How many parts, how many legs and arms and such
So it's the most efficient possible design
And the drone will mine out the mine in pretty much exactly the recharge cycle time
And has the right number of legs and arms to get back to base full and back in time
Oh wait, the top ones don't even both with couriering actually
They just have the miner drop the energy on the floor
Then they make a second dedicated courier for each mine
With exactly the right number of legs and arms
So it's exactly full each time and never ends up needing an empty run
The flag requests the new tailored creeps as needed
Usually when their existing creeps are close to dead but not quite dead
So the new ones can take over from the old ones
Then there's some kind of couriers which keep the spawn containers full and fill up the towers
etc
That's not how most people do it
But it's the way that's the most suitable for being optimized for as little CPU as possible



*/



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
