const roles = {
    builder:    require('./role.builder'),
    upgrader:   require('./role.upgrader'),
    harvester:  require('./role.harvester'),
    repairer:   require('./role.repairer'),
};

const rolesOrder = ['builder', 'repairer', 'harvester', 'waller', 'upgrader'];

const roleUtil = require('role.util');

var roleGeneric = module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // Ensure at least one creep is upgrading
        if( !_.find(Game.creeps, (_creep) => _creep.memory.upgrading) ) {
            if( roles.upgrader.run(creep) ) {
                return;
            }
        }

        // Try in order
        let res = _.find(rolesOrder, function(role) {

            // Don't re-try
            if( creep.memory.role === role ) {
                return false;
            }

            return roles[role].run(creep) !== false;
        });

        if( !res ) {
            creep.say('Nothing to do.....');
            creep.moveTo(0, 0);
        }
    }
};
