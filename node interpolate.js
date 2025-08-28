const fs = require('fs');
function digitToVal(ch) {
    if ('0' <= ch && ch <= '9') return ch.charCodeAt(0) - '0'.charCodeAt(0);
    else if ('a' <= ch && ch <= 'z') return ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    else if ('A' <= ch && ch <= 'Z') return ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    else throw new Error('Invalid digit: ' + ch);
}
function decodeBaseString(str, base) {
    let result = BigInt(0);
    const b = BigInt(base);
    for (let ch of str) {
        const val = BigInt(digitToVal(ch));
        if (val >= b) throw new Error(`Digit ${ch} invalid for base ${base}`);
        result = result * b + val;
    }
    return result;
}
function decodePoints(input) {
    const k = input.keys.k;
    let points = [];
    for (const key in input) {
        if (!isNaN(key)) {
            const x = parseInt(key);
            const base = parseInt(input[key].base);
            const value = input[key].value;
            const yBigInt = decodeBaseString(value, base);
            // Convert to Number safely if within safe JS int range
            let y;
            if (yBigInt <= Number.MAX_SAFE_INTEGER && yBigInt >= Number.MIN_SAFE_INTEGER) {
                y = Number(yBigInt);
            } else {
                throw new Error(`Value too large for safe number conversion: x=${x}, value=${value}, base=${base}`);
            }
            points.push([x, y]);
        }
    }
    return points.slice(0, k);
}
function solveVandermonde(points) {
    const n = points.length;
    const A = [];
    const b = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = n - 1; j >= 0; j--) {
            row.push(Math.pow(points[i][0], j));
        }
        A.push(row);
        b.push(points[i][1]);
    }
    return gaussianElimination(A, b);
}

// Gaussian elimination for solving linear systems
function gaussianElimination(A, b) {
    const n = A.length;
    for (let i = 0; i < n; i++) {
        // Pivot for max element in column i
        let maxEl = Math.abs(A[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];
        for (let k = i + 1; k < n; k++) {
            const c = -A[k][i] / A[i][i];
            for (let j = i; j < n; j++) {
                if (i === j) A[k][j] = 0;
                else A[k][j] += c * A[i][j];
            }
            b[k] += c * b[i];
        }
    }
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = b[i] / A[i][i];
        for (let k = i - 1; k >= 0; k--) {
            b[k] -= A[k][i] * x[i];
        }
    }
    return x;
}
function run(input, name) {
    try {
        const points = decodePoints(input);
        const coeffs = solveVandermonde(points);
        console.log(`For ${name}:`);
        console.log("Coefficients (highest to lowest):");
        console.log(coeffs.map(c => Math.round(c)));
        console.log("Secret (constant term c):", Math.round(coeffs[coeffs.length - 1]));
        console.log("-----");
    } catch (e) {
        console.error(`Error processing ${name}: ${e.message}`);
    }
}

const testcase1 = JSON.parse(fs.readFileSync('testcase1.json', 'utf8'));
const testcase2 = JSON.parse(fs.readFileSync('testcase2.json', 'utf8'));
run(testcase1, "Testcase 1");
run(testcase2, "Testcase 2");

