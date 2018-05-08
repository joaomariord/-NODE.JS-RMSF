let buf = new Buffer([1,2,3,12,222,255,0,21]);

console.log(buf);

let a = buf.readUInt8(0);
let b = buf.readUInt8(1);
let c = buf.readUInt8(5);

console.log(`a: ${a}, b: ${b}, c: ${c}`);