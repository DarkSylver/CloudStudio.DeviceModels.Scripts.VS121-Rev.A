function parseUplink(device, payload) {

    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port)
    env.log(decoded);

    // Store People Counter
    if (decoded.people_count_all != null) {
        var sensor1 = device.endpoints.byAddress("1");

        if (sensor1 != null)
            sensor1.updateGenericSensorStatus(decoded.people_count_all);

    };

}

function buildDownlink(device, endpoint, command, payload) 
{ 
	// This function allows you to convert a command from the platform 
	// into a payload to be sent to the device.
	// Learn more at https://wiki.cloud.studio/page/200

	// The parameters in this function are:
	// - device: object representing the device to which the command will
	//   be sent. 
	// - endpoint: endpoint object representing the endpoint to which the 
	//   command will be sent. May be null if the command is to be sent to 
	//   the device, and not to an individual endpoint within the device.
	// - command: object containing the command that needs to be sent. More
	//   information at https://wiki.cloud.studio/page/1195.

	// This example is written assuming a device that contains a single endpoint, 
	// of type appliance, that can be turned on, off, and toggled. 
	// It is assumed that a single byte must be sent in the payload, 
	// which indicates the type of operation.

/*
	 payload.port = 25; 	 	 // This device receives commands on LoRaWAN port 25 
	 payload.buildResult = downlinkBuildResult.ok; 

	 switch (command.type) { 
	 	 case commandType.onOff: 
	 	 	 switch (command.onOff.type) { 
	 	 	 	 case onOffCommandType.turnOn: 
	 	 	 	 	 payload.setAsBytes([30]); 	 	 // Command ID 30 is "turn on" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.turnOff: 
	 	 	 	 	 payload.setAsBytes([31]); 	 	 // Command ID 31 is "turn off" 
	 	 	 	 	 break; 
	 	 	 	 case onOffCommandType.toggle: 
	 	 	 	 	 payload.setAsBytes([32]); 	 	 // Command ID 32 is "toggle" 
	 	 	 	 	 break; 
	 	 	 	 default: 
	 	 	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 	 	 break; 
	 	 	 } 
	 	 	 break; 
	 	 default: 
	 	 	 payload.buildResult = downlinkBuildResult.unsupported; 
	 	 	 break; 
	 }
*/

}

/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2023 Milesight IoT
 *
 * @product VS121
 */
function Decoder(bytes, port) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};

    for (i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // PROTOCOL VESION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.protocol_version = bytes[i];
            i += 1;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x08) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 6));
            i += 6;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x1f) {
            decoded.firmware_version = readVersion(bytes.slice(i, i + 4));
            i += 4;
        }
        // PEOPLE COUNTER
        else if (channel_id === 0x04 && channel_type === 0xc9) {
            decoded.people_count_all = bytes[i];
            decoded.region_count = bytes[i + 1];
            var region = readUInt16BE(bytes.slice(i + 2, i + 4));
            for (var idx = 0; idx < decoded.region_count; idx++) {
                var tmp = "region_" + (idx + 1);
                decoded[tmp] = (region >> idx) & 1;
            }
            i += 4;
        }
        // PEOPLE IN/OUT
        else if (channel_id === 0x05 && channel_type === 0xcc) {
            decoded.people_in = readInt16LE(bytes.slice(i, i + 2));
            decoded.people_out = readInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // PEOPLE MAX
        else if (channel_id === 0x06 && channel_type === 0xcd) {
            decoded.people_count_max = bytes[i];
            i += 1;
        }
        // REGION COUNTER
        else if (channel_id === 0x07 && channel_type === 0xd5) {
            decoded.region_1_count = bytes[i];
            decoded.region_2_count = bytes[i + 1];
            decoded.region_3_count = bytes[i + 2];
            decoded.region_4_count = bytes[i + 3];
            decoded.region_5_count = bytes[i + 4];
            decoded.region_6_count = bytes[i + 5];
            decoded.region_7_count = bytes[i + 6];
            decoded.region_8_count = bytes[i + 7];
            i += 8;
        }
        // REGION COUNTER
        else if (channel_id === 0x08 && channel_type === 0xd5) {
            decoded.region_9_count = bytes[i];
            decoded.region_10_count = bytes[i + 1];
            decoded.region_11_count = bytes[i + 2];
            decoded.region_12_count = bytes[i + 3];
            decoded.region_13_count = bytes[i + 4];
            decoded.region_14_count = bytes[i + 5];
            decoded.region_15_count = bytes[i + 6];
            decoded.region_16_count = bytes[i + 7];
            i += 8;
        }
        // A FLOW
        else if (channel_id === 0x09 && channel_type === 0xda) {
            decoded.a_to_a = readUInt16LE(bytes.slice(i, i + 2));
            decoded.a_to_b = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.a_to_c = readUInt16LE(bytes.slice(i + 4, i + 6));
            decoded.a_to_d = readUInt16LE(bytes.slice(i + 6, i + 8));
            i += 8;
        }
        // B FLOW
        else if (channel_id === 0x0a && channel_type === 0xda) {
            decoded.b_to_a = readUInt16LE(bytes.slice(i, i + 2));
            decoded.b_to_b = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.b_to_c = readUInt16LE(bytes.slice(i + 4, i + 6));
            decoded.b_to_d = readUInt16LE(bytes.slice(i + 6, i + 8));
            i += 8;
        }
        // C FLOW
        else if (channel_id === 0x0b && channel_type === 0xda) {
            decoded.c_to_a = readUInt16LE(bytes.slice(i, i + 2));
            decoded.c_to_b = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.c_to_c = readUInt16LE(bytes.slice(i + 4, i + 6));
            decoded.c_to_d = readUInt16LE(bytes.slice(i + 6, i + 8));
            i += 8;
        }
        // D FLOW
        else if (channel_id === 0x0c && channel_type === 0xda) {
            decoded.d_to_a = readUInt16LE(bytes.slice(i, i + 2));
            decoded.d_to_b = readUInt16LE(bytes.slice(i + 2, i + 4));
            decoded.d_to_c = readUInt16LE(bytes.slice(i + 4, i + 6));
            decoded.d_to_d = readUInt16LE(bytes.slice(i + 6, i + 8));
            i += 8;
        }
        // TOTAL IN/OUT
        else if (channel_id === 0x0d && channel_type === 0xcc) {
            decoded.people_total_in = readUInt16LE(bytes.slice(i, i + 2));
            decoded.people_total_out = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // DWELL TIME
        else if (channel_id === 0x0e && channel_type === 0xe4) {
            var region = bytes[i];
            // decoded.region = region;
            decoded.dwell_time_avg = readUInt16LE(bytes.slice(i + 1, i + 3));
            decoded.dwell_time_max = readUInt16LE(bytes.slice(i + 3, i + 5));
            i += 5;
        }
        // TIMESTAMP
        else if (channel_id === 0x0f && channel_type === 0x85) {
            decoded.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt16BE(bytes) {
    var value = (bytes[0] << 8) + bytes[1];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readVersion(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push((bytes[idx] & 0xff).toString(10));
    }
    return temp.join(".");
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}
