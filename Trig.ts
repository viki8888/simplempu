/**
 * Public domain. Use at your own risk!
 * Trigonometry functions
 */
//% weight=90 color=#00A040
namespace Trig {
    const atan_table: number[] = [
        0, 1144, 2289, 3435, 4583, 5734, 6889, 8047, 9211, 10380, // 0
        11556, 12739, 13931, 15131, 16340, 17561, 18793, 20037, 21294, 22566, // 10
        23854, 25157, 26479, 27819, 29179, 30560, 31965, 33393, 34847, 36328, // 20
        37838, 39379, 40952, 42560, 44205, 45889, 47615, 49385, 51203, 53071, // 30
        54992, 56970, 59009, 61114, 63288, 65536, 67865, 70279, 72786, 75391, // 40
        78103, 80931, 83883, 86970, 90203, 93596, 97162, 100917, 104880, 109071, // 50
        113512, 118231, 123256, 128622, 134369, 140543, 147197, 154394, 162208, 170728, // 60
        180059, 190331, 201700, 214359, 228552, 244584, 262851, 283868, 308323, 337154, // 70
        371674, 413779, 466313, 533748, 623534, 749080, 937209, 1250502, 1876706, 3754555, // 80
        37549324, // 89.9 approx 90
    ];

    /**
     * Returns the inverse tangent of y/x in degrees * 100.
     * @param y Number between -32768 and 32768, eg: 2000
     * @param x Number between -32768 and 32768, eg: -1000
     */
    //% block
    //% weight=100
    export function atan2(y: number, x: number): number {
        // returns degrees * 100
        control.assert(y <= 32768 && y >= -32768, "atan2: y must be between -32768 and 32768: " + y)
        control.assert(x <= 32768 && x >= -32768, "atan2: x must be between -32768 and 32768: " + x)
        if (x == 0) {
            if (y == 0) {
                return 0;
            } else if (y > 0) {
                return 9000;
            } else {
                return -9000;
            }
        }
        let ratio = (y << 16) / x;
        let sign = 1;
        if (ratio < 0) {
            sign = -1;
            ratio = - ratio;
        }
        for (let i = 1; i < atan_table.length; i++) {
            if (ratio < atan_table[i]) {
                let d = atan_table[i] - atan_table[i - 1];
                let d2 = ratio - atan_table[i - 1];
                let d3 = d2 > 21474836 ? d2 * 10 / d * 10 : d2 * 100 / d;
                if (x < 0) {
                    return sign * ((i - 1) * 100 + d3 - 18000);
                } else {
                    return sign * ((i - 1) * 100 + d3);
                }
            }
        }
        return sign * 9000;
    }
    
    /* control.assert(atan2(0, 0) == 0, "bad atan2(0, 0) = " + atan2(0, 0));
    control.assert(atan2(1, 0) == 9000, "bad atan2(1, 0) = " + atan2(1, 0));
    control.assert(atan2(-1, 0) == -9000, "bad atan2(-1, 0) = " + atan2(-1, 0));
    control.assert(atan2(1, 1) == 4500, "bad atan2(1, 1) = " + atan2(1, 1));
    control.assert(atan2(-1, 1) == -4500, "bad atan2(-1, 1) = " + atan2(-1, 1));
    control.assert(atan2(1, -1) == 13500, "bad atan2(1, -1) = " + atan2(1, -1));
    control.assert(atan2(-1, -1) == -13500, "bad atan2(-1, -1) = " + atan2(1, 1));
    control.assert(atan2(1, 2) == 2656, "bad atan2(1, 2) = " + atan2(1, 2));
    control.assert(atan2(-1, 2) == -2656, "bad atan2(-1, 2) = " + atan2(-1, 2));
    control.assert(atan2(1, -2) == 15344, "bad atan2(1, -2) = " + atan2(1, -2));
    control.assert(atan2(-1, -2) == -15344, "bad atan2(-1, -2) = " + atan2(1, -2));
    control.assert(atan2(572, 1) == 8990, "bad atan2(572, 1) = " + atan2(572, 1));
 */
    const sin_table: number[] = [
        0, 572, 1144, 1715, 2286, 2856, 3425, 3993, 4560, 5126, // 0
        5690, 6252, 6813, 7371, 7927, 8481, 9032, 9580, 10126, 10668, // 10
        11207, 11743, 12275, 12803, 13328, 13848, 14365, 14876, 15384, 15886, // 20
        16384, 16877, 17364, 17847, 18324, 18795, 19261, 19720, 20174, 20622, // 30
        21063, 21498, 21926, 22348, 22763, 23170, 23571, 23965, 24351, 24730, // 40
        25102, 25466, 25822, 26170, 26510, 26842, 27166, 27482, 27789, 28088, // 50
        28378, 28660, 28932, 29197, 29452, 29698, 29935, 30163, 30382, 30592, // 60
        30792, 30983, 31164, 31336, 31499, 31651, 31795, 31928, 32052, 32166, // 70
        32270, 32365, 32449, 32524, 32588, 32643, 32688, 32723, 32748, 32763, // 80
        32768,
    ];

    function sin_deg(d: number): number {
        if (d >= 0 && d <= 90) {
            return sin_table[d];
        } else if (d > 90 && d <= 180) {
            return sin_table[180 - d];
        } else if (d < 0 && d >= -90) {
            return -sin_table[-d];
        } else {
            return -sin_table[180 + d];
        }
    }
    function cos_deg(angle: number): number {
        if (angle >= 0) {
            return sin_deg(90 - angle);
        } else {
            return sin_deg(90 + angle);
        }
    }
    function sin_small(x: number): number {
        return [0, 57, 114, 172, 229, 286, 343, 400, 458, 515][x];
    }
    function cos_small(x: number): number {
        return [32768, 32768, 32768, 32768, 32767, 32767, 32766, 32766, 32765, 32764][x];
    }

    /**
     * Returns 32768 * sin of the angle.
     * @param angle Degrees * 100, between -18000 and 18000, eg: 9000
     */
    //% block
    //% weight=90
    export function sin(angle: number): number {
        control.assert(angle >= -18000 && angle <= 18000, "angle must be netween -18000 and 18000: " + angle);
        if (angle < 0) { // microbit rounds towards 0
            let z = (-angle + 5) / 10;
            let r = z % 10;
            let d = z / 10;
            return -(sin_deg(d) * cos_small(r) + cos_deg(d) * sin_small(r)) >> 15;
        } else {
            let z = (angle + 5) / 10;
            let r = z % 10;
            let d = z / 10;
            return (sin_deg(d) * cos_small(r) + cos_deg(d) * sin_small(r)) >> 15;
        }
    }

    /* control.assert(sin(0) == 0, "bad sin(0) = " + sin(0));
    control.assert(sin(3000) == 16384, "bad sin(3000) = " + sin(3000));
    control.assert(sin(6000) == 28378, "bad sin(6000) = " + sin(6000));
    control.assert(sin(9000) == 32768, "bad sin(9000) = " + sin(9000));
    control.assert(sin(12000) == 28378, "bad sin(12000) = " + sin(12000));
    control.assert(sin(15000) == 16384, "bad sin(15000) = " + sin(15000));
    control.assert(sin(18000) == 0, "bad sin(18000) = " + sin(18000));
    control.assert(sin(-3000) == -16384, "bad sin(-3000) = " + sin(-3000));
    control.assert(sin(-6000) == -28378, "bad sin(-6000) = " + sin(-6000));
    control.assert(sin(-9000) == -32768, "bad sin(-9000) = " + sin(-9000));
    control.assert(sin(-12000) == -28378, "bad sin(-12000) = " + sin(-12000));
    control.assert(sin(-15000) == -16384, "bad sin(-15000) = " + sin(-15000));
    control.assert(sin(-18000) == 0, "bad sin(-18000) = " + sin(-18000));
    control.assert(sin(10) == 57, "bad sin(10) = " + sin(10));
    control.assert(sin(20) == 114, "bad sin(20) = " + sin(20));
    control.assert(sin(30) == 172, "bad sin(30) = " + sin(30));
    control.assert(sin(40) == 229, "bad sin(40) = " + sin(40));
    control.assert(sin(50) == 286, "bad sin(50) = " + sin(50));
    control.assert(sin(60) == 343, "bad sin(60) = " + sin(60));
    control.assert(sin(70) == 400, "bad sin(70) = " + sin(70));
    control.assert(sin(80) == 458, "bad sin(80) = " + sin(80));
    control.assert(sin(90) == 515, "bad sin(90) = " + sin(90));
    control.assert(sin(-10) == -57, "bad sin(-10) = " + sin(-10));
    control.assert(sin(-20) == -114, "bad sin(-20) = " + sin(-20));
    control.assert(sin(-30) == -172, "bad sin(-30) = " + sin(-30));
    control.assert(sin(-40) == -229, "bad sin(-40) = " + sin(-40));
    control.assert(sin(-50) == -286, "bad sin(-50) = " + sin(-50));
    control.assert(sin(-60) == -343, "bad sin(-60) = " + sin(-60));
    control.assert(sin(-70) == -400, "bad sin(-70) = " + sin(-70));
    control.assert(sin(-80) == -458, "bad sin(-80) = " + sin(-80));
    control.assert(sin(-90) == -515, "bad sin(-90) = " + sin(-90));
    control.assert(sin(3000) == 16384, "bad sin(3000) = " + sin(3000));
    control.assert(sin(3010) == 16433, "bad sin(3010) = " + sin(3010)); // should really be 16434
    control.assert(sin(3020) == 16482, "bad sin(3020) = " + sin(3020)); // should really be 16483
    control.assert(sin(3030) == 16532, "bad sin(3030) = " + sin(3030));
    control.assert(sin(3040) == 16581, "bad sin(3040) = " + sin(3040)); // should really be 16582
    control.assert(sin(3050) == 16631, "bad sin(3050) = " + sin(3050));
    control.assert(sin(3060) == 16680, "bad sin(3060) = " + sin(3060));
    control.assert(sin(3070) == 16729, "bad sin(3070) = " + sin(3070));
    control.assert(sin(3080) == 16779, "bad sin(3080) = " + sin(3080));
    control.assert(sin(3090) == 16828, "bad sin(3090) = " + sin(3090));
    control.assert(sin(-3000) == -16384, "bad sin(-3000) = " + sin(-3000));
    control.assert(sin(-3010) == -16434, "bad sin(-3010) = " + sin(-3010));
    control.assert(sin(-3020) == -16483, "bad sin(-3020) = " + sin(-3020));
    control.assert(sin(-3030) == -16533, "bad sin(-3030) = " + sin(-3030)); // should really be -16532
    control.assert(sin(-3040) == -16582, "bad sin(-3040) = " + sin(-3040));
    control.assert(sin(-3050) == -16632, "bad sin(-3050) = " + sin(-3050)); // should really be -16631
    control.assert(sin(-3060) == -16681, "bad sin(-3060) = " + sin(-3060)); // should really be -16680
    control.assert(sin(-3070) == -16730, "bad sin(-3070) = " + sin(-3070)); // should really be -16729
    control.assert(sin(-3080) == -16780, "bad sin(-3080) = " + sin(-3080)); // should really be -16779
    control.assert(sin(-3090) == -16829, "bad sin(-3090) = " + sin(-3090)); // should really by -16828
 */
    /**
     * Returns 32768 * cos of the angle.
     * @param angle Degrees * 100, between -18000 and 18000, eg: 9000
     */
    //% block
    //% weight=89
    export function cos(angle: number): number {
        if (angle >= 0) {
            return sin(9000 - angle);
        } else {
            return sin(9000 + angle);
        }
    }
    /* control.assert(cos(0) == 32768, "bad cos(0) = " + cos(0));
    control.assert(cos(3000) == 28378, "bad cos(000) = " + cos(3000));
    control.assert(cos(6000) == 16384, "bad cos(6000) = " + cos(6000));
    control.assert(cos(9000) == 0, "bad cos(9000) = " + cos(9000));
    control.assert(cos(12000) == -16384, "bad cos(12000) = " + cos(12000));
    control.assert(cos(15000) == -28378, "bad cos(15000) = " + cos(15000));
    control.assert(cos(18000) == -32768, "bad cos(18000) = " + cos(18000));
    control.assert(cos(-3000) == 28378, "bad cos(-3000) = " + cos(-3000));
    control.assert(cos(-6000) == 16384, "bad cos(-6000) = " + cos(-6000));
    control.assert(cos(-9000) == 0, "bad cos(-9000) = " + cos(-9000));
    control.assert(cos(-12000) == -16384, "bad sin(-12000) = " + sin(-12000));
    control.assert(cos(-15000) == -28378, "bad sin(-15000) = " + sin(-15000));
    control.assert(cos(-18000) == -32768, "bad sin(-18000) = " + sin(-18000)); */

    /**
     * Rotates a vector [x, y] by angle degrees anti-clockwise and updates it in place.
     * @param angle Degrees * 100, between -18000 and 18000, eg: 9000
     * @param v Vector represemted as an array [x, y]
     */
    //% block
    //% weight=80
    export function rotate2d(angle: number, v: number[]) {
        let c = cos(angle);
        let s = sin(angle);
        let v0 = (c * v[0] - s * v[1]) >> 15;
        let v1 = (s * v[0] + c * v[1]) >> 15;
        v[0] = v0;
        v[1] = v1;
    }
    //let t: number[] = [20000, 30000];
    //rotate2d(9000, t);
    // control.assert(t[0] == -30000 && t[1] == 20000, "After rotate 90 wrong: " + t[0] + ", " + t[1]);
    //rotate2d(-9000, t);
    // control.assert(t[0] == 20000 && t[1] == 30000, "After rotate -90 wrong: " + t[0] + ", " + t[1]);
    //rotate2d(4500, t);
    // control.assert(t[0] == -7071 && t[1] == 35354, "After rotate 45 wrong: " + t[0] + ", " + t[1]);
    //rotate2d(-4500, t);
    // control.assert(t[0] == 19998 && t[1] == 29998, "After rotate -45 wrong: " + t[0] + ", " + t[1]);
}