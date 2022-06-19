//cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js
!function(f,a,c){var s,l=256,p="random",d=c.pow(l,6),g=c.pow(2,52),y=2*g,h=l-1;function n(n,t,r){function e(){for(var n=u.g(6),t=d,r=0;n<g;)n=(n+r)*l,t*=l,r=u.g(1);for(;y<=n;)n/=2,t/=2,r>>>=1;return(n+r)/t}var o=[],i=j(function n(t,r){var e,o=[],i=typeof t;if(r&&"object"==i)for(e in t)try{o.push(n(t[e],r-1))}catch(n){}return o.length?o:"string"==i?t:t+"\0"}((t=1==t?{entropy:!0}:t||{}).entropy?[n,S(a)]:null==n?function(){try{var n;return s&&(n=s.randomBytes)?n=n(l):(n=new Uint8Array(l),(f.crypto||f.msCrypto).getRandomValues(n)),S(n)}catch(n){var t=f.navigator,r=t&&t.plugins;return[+new Date,f,r,f.screen,S(a)]}}():n,3),o),u=new m(o);return e.int32=function(){return 0|u.g(4)},e.quick=function(){return u.g(4)/4294967296},e.double=e,j(S(u.S),a),(t.pass||r||function(n,t,r,e){return e&&(e.S&&v(e,u),n.state=function(){return v(u,{})}),r?(c[p]=n,t):n})(e,i,"global"in t?t.global:this==c,t.state)}function m(n){var t,r=n.length,u=this,e=0,o=u.i=u.j=0,i=u.S=[];for(r||(n=[r++]);e<l;)i[e]=e++;for(e=0;e<l;e++)i[e]=i[o=h&o+n[e%r]+(t=i[e])],i[o]=t;(u.g=function(n){for(var t,r=0,e=u.i,o=u.j,i=u.S;n--;)t=i[e=h&e+1],r=r*l+i[h&(i[e]=i[o=h&o+t])+(i[o]=t)];return u.i=e,u.j=o,r})(l)}function v(n,t){return t.i=n.i,t.j=n.j,t.S=n.S.slice(),t}function j(n,t){for(var r,e=n+"",o=0;o<e.length;)t[h&o]=h&(r^=19*t[h&o])+e.charCodeAt(o++);return S(t)}function S(n){return String.fromCharCode.apply(0,n)}if(j(c.random(),a),"object"==typeof module&&module.exports){module.exports=n;try{s=require("crypto")}catch(n){}}else"function"==typeof define&&define.amd?define(function(){return n}):c["seed"+p]=n}("undefined"!=typeof self?self:this,[],Math);



function mod(a, b) {
   return ((a % b) + b) % b;
};

function intDiv(a, b) {
    return Math.floor(a / b);
}

// https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
function round(x, precision) {
    var scale = 10**precision;
    return Math.round((x + Number.EPSILON) * scale) / scale;
}

function within(x, min, max) {
    if(x < min) {
        return false;
    } else if(x > max) {
        return false;
    } else {
        return true;
    }
}

function constrain(x, min, max) {
    if(x < min) {
        return min;
    } else if(x > max) {
        return max;
    } else {
        return x;
    }
}

function randRange(min, max, rng) {
    if(rng) {
        return rng() * (max - min) + min;
    } else {
        return Math.random() * (max - min) + min;
    }
}

function randInt(min, max, rng) {
    // // inclusive min, exclusive max
    // if(rng) {
    //     return Math.floor(rng() * (max - min)) + min;
    // } else {
    //     return Math.floor(Math.random() * (max - min)) + min;
    // }
    return Math.floor(randRange(min, max, rng));
}

function popAtIndex(array, index) {
    var item = array[index];
    array.splice(index, 1);
    return item;
}

function popAtRandom(array, rng) {
    return popAtIndex(array, randInt(0, array.length, rng));
}



class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(v) {
        if(v instanceof Vector) {
            this.x = v.x;
            this.y = v.y;
        } else {
            [this.x, this.y] = v;
        }
    }
    
    str(x=3) {
        return `<${this.x.toFixed(x)}, ${this.y.toFixed(x)}>`;
    }
    arr() {
        return [this.x, this.y];
    }

    add(o) {
        if(o instanceof Vector) {
            return new Vector(this.x+o.x, this.y+o.y);
        } else {
            return new Vector(this.x+o, this.y+o);
        }
    }
    sub(o) {
        if(o instanceof Vector) {
            return new Vector(this.x-o.x, this.y-o.y);
        } else {
            return new Vector(this.x-o, this.y-o);
        }
    }
    mul(o) {
        if(o instanceof Vector) {
            return new Vector(this.x*o.x, this.y*o.y);
        } else {
            return new Vector(this.x*o, this.y*o);
        }
    }
    div(o) {
        if(o instanceof Vector) {
            return new Vector(this.x/o.x, this.y/o.y);
        } else {
            return new Vector(this.x/o, this.y/o);
        }
    }
    mod(o) {
        if(o instanceof Vector) {
            return new Vector(
                mod(this.x, o.x),
                mod(this.y, o.y)
            );
        } else {
            return new Vector(
                mod(this.x, o),
                mod(this.y, o)
            );
        }
    }

    get neg() {
        return new Vector(-this.x, -this.y);
    }
    get mag() {
        return Math.sqrt(this.x**2 + this.y**2);
    }
    get norm() {
        var mag = this.mag;
        if(mag) {
            return this.div(this.mag);
        } else {
            return new Vector(0, 0);
        }
    }
    
    addSet(o) {this.set(this.add(o));}
    subSet(o) {this.set(this.sub(o));}
    mulSet(o) {this.set(this.mul(o));}
    divSet(o) {this.set(this.div(o));}
    modSet(o) {this.set(this.mod(o));}
    
    negSet(o) {this.set(this.neg(o));}
    normSet(o) {this.set(this.norm(o));}
}

function angleToVector(theta) {
    return new Vector(Math.cos(theta), Math.sin(theta));
}


class Matrix {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }

    set(m) {
        if(m instanceof Matrix) {
            this.i = m.i;
            this.j = m.j;
        } else {
            // [this.x, this.y] = v;
        }
    }
    
    str(x=3) {
        return `⎡${this.i.x.toFixed(x)} ${this.j.x.toFixed(x)}⎤
⎣${this.i.y.toFixed(x)} ${this.j.y.toFixed(x)}⎦`;
    }
    arr() {
        return [this.i.x, this.j.x, this.i.y, this.j.y];
    }

    add(o) {
        if(o instanceof Matrix) {
            return new Matrix(this.i+o.i, this.j+o.j);
        } else {
            return new Matrix(this.x+o, this.y+o);
        }
    }
}
