// MessagePack 编码器/解码器实现
class MessagePackCodec {
    // 编码 JavaScript 值为 MessagePack 格式
    encode(value) {
        const buffer = [];
        this._encodeValue(value, buffer);
        return buffer;
    }

    _encodeValue(value, buffer) {
        if (value === null) {
            buffer.push(0xc0); // nil
        } else if (value === false) {
            buffer.push(0xc2); // false
        } else if (value === true) {
            buffer.push(0xc3); // true
        } else if (typeof value === 'number') {
            this._encodeNumber(value, buffer);
        } else if (typeof value === 'string') {
            this._encodeString(value, buffer);
        } else if (Array.isArray(value)) {
            this._encodeArray(value, buffer);
        } else if (typeof value === 'object') {
            this._encodeObject(value, buffer);
        } else {
            throw new Error('不支持的数据类型: ' + typeof value);
        }
    }

    _encodeNumber(value, buffer) {
        if (Number.isInteger(value)) {
            if (value >= 0) {
                if (value < 128) {
                    buffer.push(value); // positive fixint
                } else if (value < 256) {
                    buffer.push(0xcc, value); // uint8
                } else if (value < 65536) {
                    buffer.push(0xcd, value >> 8, value & 0xff); // uint16
                } else if (value < 4294967296) {
                    buffer.push(0xce, value >> 24, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff); // uint32
                } else {
                    this._encodeFloat64(value, buffer);
                }
            } else {
                if (value >= -32) {
                    buffer.push(value & 0xff); // negative fixint
                } else if (value >= -128) {
                    buffer.push(0xd0, value & 0xff); // int8
                } else if (value >= -32768) {
                    buffer.push(0xd1, (value >> 8) & 0xff, value & 0xff); // int16
                } else if (value >= -2147483648) {
                    buffer.push(0xd2, (value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff); // int32
                } else {
                    this._encodeFloat64(value, buffer);
                }
            }
        } else {
            this._encodeFloat64(value, buffer);
        }
    }

    _encodeFloat64(value, buffer) {
        buffer.push(0xcb); // float64
        const view = new DataView(new ArrayBuffer(8));
        view.setFloat64(0, value, false);
        for (let i = 0; i < 8; i++) {
            buffer.push(view.getUint8(i));
        }
    }

    _encodeString(value, buffer) {
        const utf8 = this._stringToUtf8(value);
        const len = utf8.length;

        if (len < 32) {
            buffer.push(0xa0 | len); // fixstr
        } else if (len < 256) {
            buffer.push(0xd9, len); // str8
        } else if (len < 65536) {
            buffer.push(0xda, len >> 8, len & 0xff); // str16
        } else {
            buffer.push(0xdb, len >> 24, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff); // str32
        }

        buffer.push(...utf8);
    }

    _encodeArray(value, buffer) {
        const len = value.length;

        if (len < 16) {
            buffer.push(0x90 | len); // fixarray
        } else if (len < 65536) {
            buffer.push(0xdc, len >> 8, len & 0xff); // array16
        } else {
            buffer.push(0xdd, len >> 24, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff); // array32
        }

        for (const item of value) {
            this._encodeValue(item, buffer);
        }
    }

    _encodeObject(value, buffer) {
        const keys = Object.keys(value);
        const len = keys.length;

        if (len < 16) {
            buffer.push(0x80 | len); // fixmap
        } else if (len < 65536) {
            buffer.push(0xde, len >> 8, len & 0xff); // map16
        } else {
            buffer.push(0xdf, len >> 24, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff); // map32
        }

        for (const key of keys) {
            this._encodeString(key, buffer);
            this._encodeValue(value[key], buffer);
        }
    }

    _stringToUtf8(str) {
        const utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) {
                utf8.push(charcode);
            } else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
            } else {
                i++;
                charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
                utf8.push(
                    0xf0 | (charcode >> 18),
                    0x80 | ((charcode >> 12) & 0x3f),
                    0x80 | ((charcode >> 6) & 0x3f),
                    0x80 | (charcode & 0x3f)
                );
            }
        }
        return utf8;
    }

    // 解码 MessagePack 格式为 JavaScript 值
    decode(bytes) {
        this.offset = 0;
        this.bytes = bytes;
        return this._decodeValue();
    }

    _decodeValue() {
        const byte = this.bytes[this.offset++];

        // positive fixint
        if (byte < 0x80) return byte;

        // fixmap
        if (byte >= 0x80 && byte < 0x90) return this._decodeMap(byte & 0x0f);

        // fixarray
        if (byte >= 0x90 && byte < 0xa0) return this._decodeArray(byte & 0x0f);

        // fixstr
        if (byte >= 0xa0 && byte < 0xc0) return this._decodeString(byte & 0x1f);

        // negative fixint
        if (byte >= 0xe0) return byte - 256;

        switch (byte) {
            case 0xc0: return null;
            case 0xc2: return false;
            case 0xc3: return true;
            case 0xcc: return this.bytes[this.offset++]; // uint8
            case 0xcd: return this._readUint16(); // uint16
            case 0xce: return this._readUint32(); // uint32
            case 0xcf: return this._readUint64(); // uint64
            case 0xd0: return this._readInt8(); // int8
            case 0xd1: return this._readInt16(); // int16
            case 0xd2: return this._readInt32(); // int32
            case 0xd3: return this._readInt64(); // int64
            case 0xca: return this._readFloat32(); // float32
            case 0xcb: return this._readFloat64(); // float64
            case 0xd9: return this._decodeString(this.bytes[this.offset++]); // str8
            case 0xda: return this._decodeString(this._readUint16()); // str16
            case 0xdb: return this._decodeString(this._readUint32()); // str32
            case 0xdc: return this._decodeArray(this._readUint16()); // array16
            case 0xdd: return this._decodeArray(this._readUint32()); // array32
            case 0xde: return this._decodeMap(this._readUint16()); // map16
            case 0xdf: return this._decodeMap(this._readUint32()); // map32
            default:
                throw new Error('不支持的 MessagePack 类型: 0x' + byte.toString(16));
        }
    }

    _readUint16() {
        const value = (this.bytes[this.offset] << 8) | this.bytes[this.offset + 1];
        this.offset += 2;
        return value;
    }

    _readUint32() {
        const value = (this.bytes[this.offset] << 24) | (this.bytes[this.offset + 1] << 16) |
                     (this.bytes[this.offset + 2] << 8) | this.bytes[this.offset + 3];
        this.offset += 4;
        return value >>> 0;
    }

    _readInt8() {
        const value = this.bytes[this.offset++];
        return value > 127 ? value - 256 : value;
    }

    _readInt16() {
        const value = (this.bytes[this.offset] << 8) | this.bytes[this.offset + 1];
        this.offset += 2;
        return value > 32767 ? value - 65536 : value;
    }

    _readInt32() {
        const value = (this.bytes[this.offset] << 24) | (this.bytes[this.offset + 1] << 16) |
                     (this.bytes[this.offset + 2] << 8) | this.bytes[this.offset + 3];
        this.offset += 4;
        return value;
    }

    _readUint64() {
        // 读取 8 字节的无符号整数
        // JavaScript Number 只能安全表示到 2^53-1，超过的用 BigInt 或字符串
        const high = this._readUint32();
        const low = this._readUint32();
        const value = high * 0x100000000 + low;
        // 如果值在安全范围内，返回 Number，否则返回字符串表示
        if (value <= Number.MAX_SAFE_INTEGER) {
            return value;
        }
        return value.toString();
    }

    _readInt64() {
        // 读取 8 字节的有符号整数
        const view = new DataView(new ArrayBuffer(8));
        for (let i = 0; i < 8; i++) {
            view.setUint8(i, this.bytes[this.offset++]);
        }
        const value = view.getBigInt64(0, false);
        // 如果值在安全范围内，返回 Number，否则返回字符串
        if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) {
            return Number(value);
        }
        return value.toString();
    }

    _readFloat32() {
        const view = new DataView(new ArrayBuffer(4));
        for (let i = 0; i < 4; i++) {
            view.setUint8(i, this.bytes[this.offset++]);
        }
        return view.getFloat32(0, false);
    }

    _readFloat64() {
        const view = new DataView(new ArrayBuffer(8));
        for (let i = 0; i < 8; i++) {
            view.setUint8(i, this.bytes[this.offset++]);
        }
        return view.getFloat64(0, false);
    }

    _decodeString(length) {
        const bytes = this.bytes.slice(this.offset, this.offset + length);
        this.offset += length;
        return this._utf8ToString(bytes);
    }

    _decodeArray(length) {
        const array = [];
        for (let i = 0; i < length; i++) {
            array.push(this._decodeValue());
        }
        return array;
    }

    _decodeMap(length) {
        const map = {};
        for (let i = 0; i < length; i++) {
            const key = this._decodeValue();
            const value = this._decodeValue();
            map[key] = value;
        }
        return map;
    }

    _utf8ToString(bytes) {
        let str = '';
        let i = 0;
        while (i < bytes.length) {
            const byte = bytes[i++];
            if (byte < 0x80) {
                str += String.fromCharCode(byte);
            } else if (byte < 0xe0) {
                str += String.fromCharCode(((byte & 0x1f) << 6) | (bytes[i++] & 0x3f));
            } else if (byte < 0xf0) {
                str += String.fromCharCode(((byte & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
            } else {
                const charcode = ((byte & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) |
                               ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
                const codepoint = charcode - 0x10000;
                str += String.fromCharCode(0xd800 + (codepoint >> 10), 0xdc00 + (codepoint & 0x3ff));
            }
        }
        return str;
    }
}

// 工具函数
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function hexToBytes(hex) {
    hex = hex.replace(/\s/g, '');
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

function base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = [];
    for (let i = 0; i < binaryString.length; i++) {
        bytes.push(binaryString.charCodeAt(i));
    }
    return bytes;
}

function isHex(str) {
    // 检查是否为十六进制格式：只包含 0-9a-fA-F，且长度为偶数
    str = str.replace(/\s/g, '');
    return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
}

function isBase64(str) {
    // 先排除十六进制
    if (isHex(str)) {
        return false;
    }
    // 检查是否为 base64 格式：包含典型的 base64 字符或结构
    // base64 通常包含大写字母、+、/ 或 = 结尾
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str) && (str.includes('+') || str.includes('/') || str.includes('=') || /[A-Z]/.test(str));
}

// JWT 相关函数
function base64UrlDecode(str) {
    // Base64URL 转 Base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // 补齐 padding
    while (str.length % 4) {
        str += '=';
    }
    try {
        return JSON.parse(atob(str));
    } catch (e) {
        return atob(str);
    }
}

function parseJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('无效的 JWT 格式，应该包含三个部分（header.payload.signature）');
    }

    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);
    const signature = parts[2];

    return { header, payload, signature };
}

function formatJWTOutput(jwt) {
    let output = '=== JWT Header ===\n';
    output += JSON.stringify(jwt.header, null, 2);
    output += '\n\n=== JWT Payload ===\n';
    output += JSON.stringify(jwt.payload, null, 2);

    // 检查常见的 JWT 字段
    if (jwt.payload.exp) {
        const expDate = new Date(jwt.payload.exp * 1000);
        const now = new Date();
        const isExpired = expDate < now;
        output += `\n\n=== 过期时间 (exp) ===\n${expDate.toLocaleString()} ${isExpired ? '(已过期)' : '(有效)'}`;
    }

    if (jwt.payload.iat) {
        const iatDate = new Date(jwt.payload.iat * 1000);
        output += `\n\n=== 签发时间 (iat) ===\n${iatDate.toLocaleString()}`;
    }

    if (jwt.payload.nbf) {
        const nbfDate = new Date(jwt.payload.nbf * 1000);
        output += `\n\n=== 生效时间 (nbf) ===\n${nbfDate.toLocaleString()}`;
    }

    output += '\n\n=== Signature ===\n' + jwt.signature;
    output += '\n\n注意：此工具仅解析 JWT，不验证签名。';

    return output;
}

// 主应用逻辑
const inputArea = document.getElementById('inputArea');
const outputArea = document.getElementById('outputArea');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

const jwtInputArea = document.getElementById('jwtInputArea');
const jwtOutputArea = document.getElementById('jwtOutputArea');
const jwtDecodeBtn = document.getElementById('jwtDecodeBtn');
const jwtClearBtn = document.getElementById('jwtClearBtn');
const jwtCopyBtn = document.getElementById('jwtCopyBtn');

const codec = new MessagePackCodec();

// 标签页切换
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // 移除所有活动状态
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // 添加当前活动状态
        this.classList.add('active');
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// JSON 转 MessagePack
encodeBtn.addEventListener('click', function() {
    try {
        const input = inputArea.value.trim();
        if (!input) {
            alert('请输入 JSON 数据');
            return;
        }

        const jsonData = JSON.parse(input);
        const encoded = codec.encode(jsonData);
        const hexString = bytesToHex(encoded);
        const base64String = bytesToBase64(encoded);

        // 同时显示两种格式
        outputArea.value = `=== 十六进制格式 (Hex) ===\n${hexString}\n\n=== Base64 格式 ===\n${base64String}`;
        showSuccess('编码成功！');
    } catch (error) {
        outputArea.value = '错误: ' + error.message;
        showError('编码失败: ' + error.message);
    }
});

// MessagePack 转 JSON
decodeBtn.addEventListener('click', function() {
    try {
        const input = inputArea.value.trim();
        if (!input) {
            alert('请输入 MessagePack 十六进制字符串或 Base64 字符串');
            return;
        }

        // 自动检测输入格式
        let bytes;
        let format;
        if (isHex(input)) {
            bytes = hexToBytes(input);
            format = '十六进制';
        } else if (isBase64(input)) {
            bytes = base64ToBytes(input);
            format = 'Base64';
        } else {
            throw new Error('无法识别输入格式，请输入有效的十六进制或 Base64 字符串');
        }

        const decoded = codec.decode(bytes);
        const jsonString = JSON.stringify(decoded, null, 2);

        outputArea.value = jsonString;
        showSuccess(`解码成功！(检测到 ${format} 格式)`);
    } catch (error) {
        outputArea.value = '错误: ' + error.message;
        showError('解码失败: ' + error.message);
    }
});

// JWT 解析
jwtDecodeBtn.addEventListener('click', function() {
    try {
        const input = jwtInputArea.value.trim();
        if (!input) {
            alert('请输入 JWT Token');
            return;
        }

        const jwt = parseJWT(input);
        const formattedOutput = formatJWTOutput(jwt);

        jwtOutputArea.value = formattedOutput;
        showSuccess('JWT 解析成功！');
    } catch (error) {
        jwtOutputArea.value = '错误: ' + error.message;
        showError('JWT 解析失败: ' + error.message);
    }
});

// 清空 - MessagePack
clearBtn.addEventListener('click', function() {
    inputArea.value = '';
    outputArea.value = '';
});

// 清空 - JWT
jwtClearBtn.addEventListener('click', function() {
    jwtInputArea.value = '';
    jwtOutputArea.value = '';
});

// 复制结果 - MessagePack
copyBtn.addEventListener('click', function() {
    if (!outputArea.value) {
        alert('没有可复制的内容');
        return;
    }

    outputArea.select();
    document.execCommand('copy');
    showSuccess('已复制到剪贴板！');
});

// 复制结果 - JWT
jwtCopyBtn.addEventListener('click', function() {
    if (!jwtOutputArea.value) {
        alert('没有可复制的内容');
        return;
    }

    jwtOutputArea.select();
    document.execCommand('copy');
    showSuccess('已复制到剪贴板！');
});

function showSuccess(message) {
    console.log('✓ ' + message);
}

function showError(message) {
    console.error('✗ ' + message);
}
