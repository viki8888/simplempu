

/**
 * Public domain. Use at your own risk!
 * Simplified interface for InvenSense MPU-6500, MPU-9250, MPU-9255
 */
//% weight=90 color=#0040A0
namespace InvMPU {
    export const MPU_6500_ID = 0x70;
    export const MPU_9250_ID = 0x71;
    export const MPU_9255_ID = 0x73;

    const MPU_ADDR = 0x68;
    const WHO_AM_I = 0x75;
    const REG_PWR_MGMT_1 = 0x6b;
    const REG_SIGNAL_PATH_RESET = 0x68;
    const REG_USER_CTRL = 0x6a;
    const REG_ACCEL_XOUT_H = 0x3b;
    const REG_ACCEL_YOUT_H = 0x3d;
    const REG_ACCEL_ZOUT_H = 0x3f;
    const REG_GYRO_XOUT_H = 0x43;
    const REG_GYRO_YOUT_H = 0x45;
    const REG_GYRO_ZOUT_H = 0x47;
    const REG_CONFIG = 0x1a;
    const REG_GYRO_CONFIG = 0x1b;
    const REG_ACCEL_CONFIG = 0x1c;
    const REG_ACCEL_CONFIG2 = 0x1d;
    const XG_OFFSET_H = 0x13;
    const YG_OFFSET_H = 0x15;
    const ZG_OFFSET_H = 0x17;

    function mpu_read(reg: number): number {
        pins.i2cWriteNumber(MPU_ADDR, reg, NumberFormat.UInt8BE, true);
        return pins.i2cReadNumber(MPU_ADDR, NumberFormat.UInt8BE, false);
    }

    function mpu_read_int16(reg: number): number {
        pins.i2cWriteNumber(MPU_ADDR, reg, NumberFormat.UInt8BE, true);
        return pins.i2cReadNumber(MPU_ADDR, NumberFormat.Int16BE, false);
    }

    function mpu_write(reg: number, data: number) {
        pins.i2cWriteNumber(MPU_ADDR, reg << 8 | (data & 0xff), NumberFormat.UInt16BE);
    }

    function mpu_write_int16(reg: number, data: number) {
        mpu_write(reg, (data >> 8) & 0xff);
        mpu_write(reg + 1, data & 0xff);
    }

    /**
     * Contains one of MPU_6500_ID, MPU_9250_ID, MPU_9255_ID or zero.
     */
    //% block
    export let sensor_id = 0;

    /**
     * Look for a MPU-6500, MPU-9250 or MPU-9255.
     * Returns true if the MPU was found.
     * The MPU id is in sensor_id.
     */
    //% block
    //% weight=99
    export function find_mpu(): boolean {
        sensor_id = mpu_read(WHO_AM_I);
        return sensor_id == MPU_9255_ID || sensor_id == MPU_9250_ID || sensor_id == MPU_6500_ID;
    }

    /**
     * Reset the MPU and configure the gyroscope to +- 2000 degrees/second and the accelerometer to +-16g.
     * The low pass filter settings control how sensitive the sensors are to quick changes.
     * In order of increasing sensitivity: 6, 5, 4, 3, 2, 1, 0, 7
     * Info from MPU-9250 register map document.
     * @param gyro_lpf Gyroscope low pass filter setting, eg: 0
     *   7: 8kHz sampling rate, 36001Hz bandwidth, 0.17ms delay.
     *   0: 8kHz sampling rate, 250Hz bandwidth, 0.97ms delay.
     *   1: 1kHz sampling rate, 184Hz bandwidth, 2.9ms delay.
     *   2: 1kHz sampling rate, 92Hz bandwidth, 3.9ms delay.
     *   3: 1kHz sampling rate, 41Hz bandwidth, 5.9ms delay.
     *   4: 1kHz sampling rate, 20Hz bandwidth, 9.9ms delay.
     *   5: 1kHz sampling rate, 10Hz bandwidth, 17.85ms delay.
     *   6: 1kHz sampling rate, 5Hz bandwidth, 33.48ms delay.
     * @param accel_lpf Accelerometer low pass filter setting, eg: 0
     *   7: 1kHz sampling rate, 420Hz 3dB bandwidth, 1.38ms delay.
     *   0: 1kHz sampling rate, 218.1Hz 3dB bandwidth, 1.88ms delay.
     *   1: 1kHz sampling rate, 218.1Hz 3dB bandwidth, 1.88ms delay.
     *   2: 1kHz sampling rate, 99Hz 3dB bandwidth, 2.88ms delay.
     *   3: 1kHz sampling rate, 44.8Hz 3dB bandwidth, 4.88ms delay.
     *   4: 1kHz sampling rate, 21.2Hz 3dB bandwidth, 8.87ms delay.
     *   5: 1kHz sampling rate, 10.2Hz 3dB bandwidth, 16.83ms delay.
     *   6: 1kHz sampling rate, 5.05Hz 3dB bandwidth, 32.48ms delay.
     */
    //% block
    //% weight=98
    export function reset_mpu(gyro_lpf=0, accel_lpf=0) {
        control.assert(gyro_lpf >= 0 || gyro_lpf <= 7, "gyro_lpf must be between 0 and 7");
        control.assert(accel_lpf >= 0 || accel_lpf <= 7, "accel_lpf must be between 0 and 7");
        mpu_write(REG_PWR_MGMT_1, 0x80); // H_RESET, internal 20MHz clock
        mpu_write(REG_SIGNAL_PATH_RESET, 0x7); // GYRO_RST | ACCEL_RST | TEMP_RST
        mpu_write(REG_USER_CTRL, 0x1); // SIG_COND_RST
        mpu_write(REG_CONFIG, gyro_lpf); 
        mpu_write(REG_GYRO_CONFIG, 0x18); // GYRO_FS_SEL = 3, +-2000 dps, DLPF on
        mpu_write(REG_ACCEL_CONFIG, 0x18); // ACCEL_FS_SEL = 3, +-16g
        mpu_write(REG_ACCEL_CONFIG2, accel_lpf); // DLPF on
    }

    /**
     * Gyro X axis value after calling read_gyro().
     * Value from -32768 to 32767.
     */
    //% block
    export let gyro_x = 0;

    /**
     * Gyro Y axis value after calling read_gyro().
     * Value from -32768 to 32767.
     */
    //% block
    export let gyro_y = 0;

    /**
     * Gyro Z axis value after calling read_gyro().
     * Value from -32768 to 32767.
     */
    //% block
    export let gyro_z = 0;

    /**
     * Read all three gyroscope axis values and store them in gyro_x, gyro_y and gyro_z.
     */
    //% block
    //% weight=95
    export function read_gyro() {
        gyro_x = mpu_read_int16(REG_GYRO_XOUT_H);
        gyro_y = mpu_read_int16(REG_GYRO_YOUT_H);
        gyro_z = mpu_read_int16(REG_GYRO_ZOUT_H);
    }

    /**
     * Accelerometer X axis value after calling read_accel().
     * Value from -32768 to 32767.
     */
    //% block
    export let accel_x = 0;

    /**
     * Accelerometer Y axis value after calling read_accel().
     * Value from -32768 to 32767.
     */
    //% block
    export let accel_y = 0;

    /**
     * Accelerometer Z axis value after calling read_accel().
     * Value from -32768 to 32767.
     */
    //% block
    export let accel_z = 0;

    /**
     * Read all three accelerometer values and store them in accel_x, accel_y and accel_z.
     */
    //% block
    //% weight=94
    export function read_accel() {
        accel_x = mpu_read_int16(REG_ACCEL_XOUT_H);
        accel_y = mpu_read_int16(REG_ACCEL_YOUT_H);
        accel_z = mpu_read_int16(REG_ACCEL_ZOUT_H);
    }

    export let var_x = 0;
    export let var_y = 0;
    export let var_z = 0;

    /**
     * Gyro X axis bias after calling get_gyro_bias().
     */
    //% block
    export let gyro_x_bias = 0;

    /**
     * Gyro Y axis bias after calling get_gyro_bias().
     */
    //% block
    export let gyro_y_bias = 0;

    /**
     * Gyro Z axis bias after calling get_gyro_bias().
     */
    //% block
    export let gyro_z_bias = 0;

    /**
     * Compute the gyro bias for all three axis. The bias for each axis is the average of 100 samples.
     * Returns true if the sensor is steady enough to calculate the bias.
     * The bias values are store in gyro_x_bias, gyro_y_bias and gyro_z_bias.
     */
    //% block
    //% weight=97
    export function compute_gyro_bias(): boolean {
        mpu_write_int16(XG_OFFSET_H, 0);
        mpu_write_int16(YG_OFFSET_H, 0);
        mpu_write_int16(ZG_OFFSET_H, 0);
        const N = 100;
        const MAX_VAR = 40;
        let sum_x = 0, sum_y = 0, sum_z = 0;
        let xs: number[] = [], ys: number[] = [], zs: number[] = [];
        for (let i = 0; i < N; i++) {
            let x = mpu_read_int16(REG_GYRO_XOUT_H);
            let y = mpu_read_int16(REG_GYRO_YOUT_H);
            let z = mpu_read_int16(REG_GYRO_ZOUT_H);
            
            sum_x += x;
            sum_y += y;
            sum_z += z;
            xs.push(x);
            ys.push(y);
            zs.push(z);
            basic.pause(1);
        }
        let mean_x = sum_x / N;
        let mean_y = sum_y / N;
        let mean_z = sum_z / N;
        var_x = 0;
        var_y = 0;
        var_z = 0;
        for (let i = 0; i < N; i++) {
            let dx = xs[i] - mean_x;
            var_x = var_x + dx * dx;
            let dy = ys[i] - mean_y;
            var_y = var_y + dy * dy;
            let dz = zs[i] - mean_z;
            var_z = var_z + dz * dz;
        }
        var_x = var_x / N;
        var_y = var_y / N;
        var_z = var_z / N;
        serial.writeLine("X:" + var_x+" Y:"+var_y+" Z:"+var_z)
        if (var_x > MAX_VAR || var_y > MAX_VAR || var_z > MAX_VAR) {
            
            return false;
        }
        gyro_x_bias = mean_x;
        gyro_y_bias = mean_y;
        gyro_z_bias = mean_z;
        return true;
    }

    /**
     * Set the gyro bias. The bias can be calculated by calling get_gyro_bias().
     * @param x_bias Bias in the X direction, eg: 0
     * @param y_bias Bias in the Y direction, eg: 0
     * @param z_bias Bias in the Z direction, eg: 0
     */
    //% block
    //% weight=96
    export function set_gyro_bias(x_bias: number, y_bias: number, z_bias: number) {
        mpu_write_int16(XG_OFFSET_H, -2 * x_bias);
        mpu_write_int16(YG_OFFSET_H, -2 * y_bias);
        mpu_write_int16(ZG_OFFSET_H, -2 * z_bias);
    }
    
}

