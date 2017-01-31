'use strict';

function HackTool(connection){
    this.conn = connection;
    this.leversStates = [false, false, false, false];
    this.prevLever = null;
    this.currentStateId = null;

    this.conn.on('message', this.onMessage.bind(this));
}

HackTool.prototype.onMessage = function(json) {
    var self = this,
        data = JSON.parse(json.utf8Data);

    if (data.action === 'check') {
        self.checkResult(data);
    } else if(data.newState){
        if(data.newState === 'poweredOn'){
            console.log('\n.......................................');
            console.log('So close.... Need more time...');
            console.log('.......................................\n');
            this.leversStates = [false, false, false, false];
        } else {
            console.log('\n.......................................');
            console.log(`System was hacked!!! \nState ID - ${self.currentStateId}. \nToken - ${data.token}.`);
            console.log('.......................................\n');
            self.conn.close();
        }
    } else {
        self.stateWasChanged(data);
    }
};

HackTool.prototype.stateWasChanged = function(data){
    var self = this,
        lever = data.pulled,
        stateId = data.stateId;

    self.leversStates[lever] = !self.leversStates[lever];
    self.currentStateId = stateId;

    console.log(`lever ${lever} was turned ${self.leversStates[lever] ? 'on' : 'off'}`);

    if(Number.isInteger(self.prevLever) && self.prevLever !== lever){
        self.checkLeverPositions(lever);
    }

    self.prevLever = lever;
};

HackTool.prototype.checkResult = function(data){
    var self = this,
        lever1 = data.lever1,
        lever2 = data.lever2,
        same = data.same;

    if(same){
        self.leversStates[lever1] = self.leversStates[lever2];
        var result = self.leversStates.every(lever => {
            return lever;
        });

        if(result){
            self.killProcess(data.stateId)
        }
    } else {
        self.leversStates[lever1] = !self.leversStates[lever2];
    }
};

HackTool.prototype.checkLeverPositions = function(leverNum) {
    var self = this,
        testRequest = {
        action: "check",
        lever1: leverNum,
        lever2: self.prevLever,
        stateId: self.currentStateId
    };

    self.conn.send(JSON.stringify(testRequest));
};

HackTool.prototype.killProcess = function(stateId){
    var self = this,
        request = {
            action: "powerOff",
            stateId: stateId
        };

    self.conn.send(JSON.stringify(request));
};

module.exports = HackTool;