import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";

const source = process.argv[2] || "dist/hlc-logo-transparent.png";
const target = process.argv[3] || "dist/hlc-logo-ui.png";
const size = Number(process.argv[4] || 180);
const input = readFileSync(source);
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
if (!input.subarray(0,8).equals(signature)) throw new Error(`${source} is not a PNG`);

function crc32(buffer){let crc=0xffffffff;for(const byte of buffer){crc^=byte;for(let bit=0;bit<8;bit+=1)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type,"ascii");const out=Buffer.allocUnsafe(12+data.length);out.writeUInt32BE(data.length,0);t.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([t,data])),8+data.length);return out;}
function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}

let width=0,height=0,bitDepth=0,colorType=0,interlace=0,offset=8;const idat=[];
while(offset<input.length){const length=input.readUInt32BE(offset);const type=input.toString("ascii",offset+4,offset+8);const data=input.subarray(offset+8,offset+8+length);if(type==="IHDR"){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9];interlace=data[12];}if(type==="IDAT")idat.push(data);offset+=12+length;if(type==="IEND")break;}
if(bitDepth!==8||colorType!==6||interlace!==0)throw new Error(`Expected non-interlaced 8-bit RGBA PNG, got bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace}`);
if(!Number.isInteger(size)||size<32||size>Math.min(width,height))throw new Error(`Invalid derivative size ${size}`);

const bpp=4,rowBytes=width*bpp,inflated=inflateSync(Buffer.concat(idat));
if(inflated.length!==height*(rowBytes+1))throw new Error("Unexpected PNG payload size");
const pixels=Buffer.allocUnsafe(width*height*4);let previous=Buffer.alloc(rowBytes);
for(let y=0;y<height;y+=1){const start=y*(rowBytes+1),filter=inflated[start],src=inflated.subarray(start+1,start+1+rowBytes),row=pixels.subarray(y*rowBytes,(y+1)*rowBytes);for(let x=0;x<rowBytes;x+=1){const raw=src[x],left=x>=bpp?row[x-bpp]:0,up=previous[x],upLeft=x>=bpp?previous[x-bpp]:0;let value;if(filter===0)value=raw;else if(filter===1)value=(raw+left)&255;else if(filter===2)value=(raw+up)&255;else if(filter===3)value=(raw+Math.floor((left+up)/2))&255;else if(filter===4)value=(raw+paeth(left,up,upLeft))&255;else throw new Error(`Unsupported PNG filter ${filter}`);row[x]=value;}previous=row;}

const small=Buffer.alloc(size*size*4);
for(let dy=0;dy<size;dy+=1){const sy0=Math.floor(dy*height/size),sy1=Math.max(sy0+1,Math.floor((dy+1)*height/size));for(let dx=0;dx<size;dx+=1){const sx0=Math.floor(dx*width/size),sx1=Math.max(sx0+1,Math.floor((dx+1)*width/size));let sumA=0,sumRA=0,sumGA=0,sumBA=0,samples=0;for(let sy=sy0;sy<sy1;sy+=1){for(let sx=sx0;sx<sx1;sx+=1){const i=(sy*width+sx)*4,a=pixels[i+3];sumA+=a;sumRA+=pixels[i]*a;sumGA+=pixels[i+1]*a;sumBA+=pixels[i+2]*a;samples+=1;}}const d=(dy*size+dx)*4;small[d+3]=samples?Math.round(sumA/samples):0;if(sumA){small[d]=Math.round(sumRA/sumA);small[d+1]=Math.round(sumGA/sumA);small[d+2]=Math.round(sumBA/sumA);}}}

const raw=Buffer.alloc(size*(size*4+1));for(let y=0;y<size;y+=1){const start=y*(size*4+1);raw[start]=0;small.copy(raw,start+1,y*size*4,(y+1)*size*4);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
const png=Buffer.concat([signature,chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);
writeFileSync(target,png);
console.log(`Generated responsive logo derivative: ${target} (${size}x${size}, ${png.length} bytes)`);
