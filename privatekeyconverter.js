// Array of numbers
const byteArray = [132,200,4,26,82,188,175,98,225,19,143,198,142,141,55,54,215,91,238,241,15,127,71,192,20,204,77,76,44,232,34,57,215,6,86,205,184,160,133,29,99,175,154,187,203,223,204,246,234,210,118,95,112,230,77,97,56,83,195,11,33,165,238,48];

// Convert each byte to a two-digit hexadecimal string and join them
const privateKey = byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

// Output the private key
console.log("Private Key in Hexadecimal:", privateKey);
