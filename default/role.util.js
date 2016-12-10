var nextResourceId = null;


var roleUtil = module.exports = {

    /**
     * Returns the number of creeps currently mining a resource
     * 
     * @return {number}
     */
    resourceCreeps: function(source) {
        let total = 0;

        _.each(Game.creeps, function(creep) {
            if( creep && creep.memory && creep.memory.sourceId && creep.memory.sourceId == source.id ) {
                total++;
            }
        });

        return total;
    },

    /**
     * Gather resources if necessary
     * 
     * @param {Creep} creep 
     * 
     * @return {boolean} true: needs to gather, false: done gathering
     */
    getResources: function(creep) {

        // Already carrying.. continue ONLY if not mining anymore
        if( creep.carry && creep.carry.energy ) {

            // Done mining
            if( ! creep.memory.sourceId || creep.carry.energy >= creep.carryCapacity ) {
                // Just finished
                if( creep.memory.sourceId ) {
                    creep.say('Gather.done');
                    creep.memory.sourceId = null;
                }
                return false;
            }
        }

        let sources     = creep.room.find(FIND_SOURCES),
            source      = null;
            
        // Fail
        if( !sources.length ) {
            if( creep.memory.sourceId ) {
                creep.memory.sourceId = null;
            }

            console.log('[ERROR] Could not find any sources to gather');
            creep.say(':(_hungry');
            this.moveOutOfTheWay(creep);

            return true;
        }

        // Already mining
        if( creep.memory.sourceId ) {
            source = _.find(sources, (_source) => _source.id === creep.memory.sourceId);
        }

        // Only one option
        if( !source ) {
            if( sources.length === 1 ) {
                source = sources[0];
            }
            else {
    
                // First
                if( !nextResourceId ) {
                    source = sources[0];
                    nextResourceId = sources[1].id;
                }
    
                else {
                    source = _.find(sources, function(_source, i) {
                        if( _source.id === nextResourceId ) {
                            
                            // Next id
                            if( i >= sources.length - 1 ) {
                                nextResourceId = null;
                            }
                            else {
                                nextResourceId = sources[i + 1].id
                                console.log(`Next source id: ${nextResourceId}`);
                            }
    
                            return true;
                        }
                    });
                }
            }
        }

        if( !creep.memory.sourceId || creep.memory.sourceId !== source.id ) {
            creep.say('Gathering');
            creep.memory.sourceId = source.id;
        }

        if( source && creep.harvest(source) === ERR_NOT_IN_RANGE ) {
            creep.moveTo(source);
        }

        return true;
    },

    moveOutOfTheWay(creep) {
        creep.moveTo(10, 10);
    }

}