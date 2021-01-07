const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {
    constructor() {
        console.log('Constructor')
        this.height = 0
        this.chain = [];
        this.initializeChain(() => {
            let block = new BlockClass.Block({data: 'Genesis Block'});
            this._addBlock(block);
        });
    }

    // async initializeChain(){
    //     console.log('Initializing')
    //     if(this.height === -1){
    //         console.log('Intialized Block')
    //         let block = new BlockClass.Block({data: 'Genesis Block'});
    //         await this._addBlock(block);
    //     }
    // }

    getChainHeight(){
        return new Promise((resolve, reject) => {
            resolve(this.height);
        })
    }

    _addBlock(block){
        let self = this;
        console.log('BLOCK ADDED')
        return new Promise(function(resolve, reject){
            let blockObj = block;
            let height = await self.getChainHeight();
            blockObj.time = new Date().getTime().toString().slice(0,-3);
            if (height>=0){
                blockObj.height = height+1;
                let previousBlock = self.chain[self.height];
                blockObj.previousBlockHash = previousBlock.hash;

                blockObj.hash = SHA256(JSON.stringify(this)).toString();
                self.chain.push(blockObj);
                self.height = self.chain.length-1;
                resolve(blockObj);
            }
            else{
                blockObj.height = height + 1;
                blockObj.hash = SHA256(JSON.stringify(this)).toString();
                self.chain.push(blockObj);
                self.height = self.chain.length - 1;
                resolve(blockObj);
            }
        });
    }

    requestMessageOwnershipVerification(address){
        return new Promise((resolve) =>{
            let message = `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`;
            resolve(message);
        });
    }

    submitStar(address, message, signature, star){
        let self = this;
        return new Promise((resolve, reject) =>{
            let time = parseInt(message.split(':')[1]);
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
            if((time +(5*60*1000)) > currentTime){
                let isValid = bitcoinMessage.verify(message, address, signature);
                if (isValid){
                    let block = new BlockClass.Block({owner: address, star: star});
                    let addedBlock = await self._addBlock(block);
                    resolve(addBlock);
                }
                else{
                    reject('You should submit the star before 5 minutes');
                }
            }
        });
    }

    getBlockByHash(hash){
        let self = this;
        return new Promise((resolve,reject)=>{
            let block = this.chain.filter(x=>x.hash==hash)[0];
            if(block){
                resolve(block);
            }
            else{
                resolve(null);
            }
        });
    }

    getStarsByWalletAddress(address){
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) =>{
            self.chain((b) => {
                let data = b.getBData();
                if(data){
                    if (data.owner === address){
                        stars.push(data);
                    }
                }
            });
            resolve(stars);
        });
    }

    validateChain(){
        let self = this;
        let errorLog = [];
        return new Promise((resolve, reject)=>{
            let promises = [];
            let chainIndex = 0;
            self.chain.forEach(block => {
                promises.push(block.validate());
                if(block.height > 0) {
                    let previousBlockHash = block.previousBlockHash;
                    let blockHash = chain[chainIndex-1].hash;
                    if(blockHash != previousBlockHash){
                        errorLog.push(`Error - Block Height: ${block.height} - Previous Hash does not match.`);
                    }
                }
                chainIndex++;
            });
            Promise.all(promises).then((results) =>{
                chainIndex = 0;
                results.forEach(valid => {
                    if (!valid){
                        errorLog.push(`Error - Block Height: ${self.chain[chainIndex].height} - Blockchain has been tampered.`);
                    }
                });
                resolve(errorLog);
            }).catch((err)=> {console.log(err); reject(err)});
        });
    }
}

module.exports.Blockchain = Blockchain;   