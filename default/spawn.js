/** @var {lodash|_} _ */


const roles = {
    harvester:  require('./role.harvester'),
    upgrader:   require('./role.upgrader'),
    builder:    require('./role.builder'),
    repairer:   require('./role.repairer'),
    waller:     require('./role.waller'),
    generic:    require('./role.generic'),
    settler:    require('./role.settler'),
    tower:      require('./tower')
};

const tools     = global.tools = require('./tools');
const roleUtil  = global.roleUtil = require('./role.util');

const creepThresholds = {
    harvester:  6,
    builder:    2,
    repairer:   2,
    waller:     2,
    upgrader:   8,
    settler:    0,
    generic:    0
};


/**
 *
 * @param {StructureSpawn} spawn
 */
function Spawn(spawn) {

    let allCreeps = {
            harvester:  tools.getCreeps(spawn.room, 'harvester'),
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
    if( !spawn.spawning ) {
        let minLevel = 5; // ~~((totalEnergyCapacity - 300) / 100);
        let minSettlerLevel = 0;

        // No Harvesters and no builders - reduce minLevel to 1
        if( !allCreeps.harvester.length || !allCreeps.upgrader.length ) {
            minLevel = 1;
        }

        _.find(['harvester', 'upgrader', 'repairer', 'builder', 'waller', 'generic', 'settler'], function(role) {
            // Skip if we don't need this type of creep or if we've reached the spawn limit
            if( allCreeps[role].length < creepThresholds[role] && roles[role].spawn(spawn) ) {
                if( role === 'settler' ){
                    tools.dump('here');
                }

                let nextId = spawn.memory.nextCreepId || 0,
                    name = role[0].toUpperCase() + role.slice(1) + ' - ' + nextId;

                let newCreep = roleUtil.spawn(spawn, role, name, role === 'settler' ? minSettlerLevel : minLevel);
                if( newCreep ) {
                    console.log(`<p><span style="font-weight: 600; color: #069;">Spawning</span></p>`
                        + `<p style="padding-left: 15px">`
                        + `<strong>Role: </strong>${role}, <strong>Name: </strong>${newCreep.name}</p>`
                     );

                    allCreeps[role].push(newCreep);

                    // Reset at 999
                    if( (spawn.memory.nextCreepId = nextId + 1) >= 9999 ) {
                        spawn.memory.nextCreepId = 0;
                    }
                    return newCreep;
                }
                else {
                    tools.dump('spawn fail', {role: role});
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
    _.each(tools.getCreeps(spawn.room), function(creep) {
        let role = creep.memory.role;

        if (roles[role].run(creep) === false && role !== 'generic') {
            roles.generic.run(creep);
        }
    });

    // Towers
    tools.getStructures(spawn.room, STRUCTURE_TOWER).forEach(function(tower) {
        roles.tower.run(tower);
    });
}


module.exports = Spawn;
