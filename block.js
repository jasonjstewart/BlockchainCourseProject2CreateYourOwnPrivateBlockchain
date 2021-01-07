const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');

class Block{
    constructor(data){
        this.hash = null,
        this.height = 0,
        this.body = Buffer.alloc(JSON.stringify(data)).toString('hex'),
        this.time = 0,
        this.previousBlockHash = null
    }

    validate(){
        let self = this
        return new Promise((resolve) => {
            let hashAux = self.hash;
            self.hash = null;
            let calculatedHash = SHA256(JSON.stringify(this)).toString()
            if (calculatedHash !== hashAux){
                resolve(false)
            }
            else{
                resolve(true)
            }
        });
    }

    getBData(body){
        let dataEncoded = this.body;
        let dataJson = hex2ascii(dataEncoded);
        let data = JSON.parse(dataJson);
        if ( data && this.height > 0){
            return data;
        }
    }

    // hex2a(hexx) {
    //     var hex = hexx.toString();//force conversion
    //     var str = '';
    //     for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
    //         str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    //     return str;
    // }
}

module.exports.Block = Block;