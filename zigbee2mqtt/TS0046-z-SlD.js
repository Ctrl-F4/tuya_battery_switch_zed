import * as m from 'zigbee-herdsman-converters/lib/modernExtend';
import * as exposes_1 from 'zigbee-herdsman-converters/lib/exposes';
import * as reporting from 'zigbee-herdsman-converters/lib/reporting';
import * as utils_1 from 'zigbee-herdsman-converters/lib/utils';
import * as logger from 'zigbee-herdsman-converters/lib/logger';

const batteryReporting = {min: 3600, max: 14400, change: 0};

const attrSwitchType = 0xf000;
const attrDeviceModelNumber = 0xf002;
const attrSceneId = 0xf000;
const attrGroupId = 0xf001;

function localActionExtend(args = {}) {
    const { localAction = ["hold", "single", "double", "triple", "quadruple", "quintuple", "release"], 
            bind = true,
            reporting = true, 
            reportingConfig = {"min": 10, "max": 0, change: 1},
            endpointNames = undefined } = args;
    let actions = localAction;
    if (endpointNames) {
        actions = localAction.flatMap((c) => endpointNames.map((e) => `${c}_${e}`));
    }
    const exposes = [exposes_1.presets.enum("action", exposes_1.access.STATE, actions)];
    const attribute = "presentValue";

    
    const actionPayloadLookup = {
      0: "hold",
      1: "single",
      2: "double",
      3: "triple",
      4: "quadruple",
      5: "quintuple",
      255: "release",
    };

    const fromZigbee = [
        {
            cluster: "genMultistateInput",
            type: ["attributeReport", "readResponse"],
            convert: (model, msg, publish, options, meta) => {
                if ((0, utils_1.hasAlreadyProcessedMessage)(msg, model))
                    return;
                const value = msg.data[attribute];
                //logger.logger.info('msg.data: ' + value);
                if (value === 300)
                    return {action: "N/A"};
                const payload = { action: (0, utils_1.postfixWithEndpointName)(actionPayloadLookup[value], msg, model, meta) };
                return payload;
            },
        },
    ];
    const result = { exposes, fromZigbee, isModernExtend: true };
    if (reporting)
        result.configure = [m.setupConfigureForBinding("genMultistateInput", "input", endpointNames),
                            m.setupConfigureForReporting("genMultistateInput", attribute, {config: reportingConfig, access: exposes_1.access.GET, endpointNames})];
    else if (bind) result.configure = [m.setupConfigureForBinding("genMultistateInput", "input", endpointNames)];

    return result;

}

const switchTypeLookup = {
    toggle: 0,
    momentary: 1,
    multifunction: 2,
    brightness_level: 3,
    brightness_level_up: 4,
    brightness_level_down: 5,
    move_to_color_temperature: 6,
    move_to_color_temperature_up: 7,
    move_to_color_temperature_down: 8,
    scene: 9,
};

export default {
        zigbeeModel: ["TS0046-M008-SlD"],
        model: "TS0046-M008-SlD",
        vendor: "Slacky-DIY",
        description: "Tuya wireless switch with 6 buttons with custom firmware",
        extend: [
            m.deviceAddCustomCluster("genOnOffSwitchCfg", {
                name: "genOnOffSwitchCfg",
                ID: 0x0007,
                attributes: {
                    customSwitchType: {
                        name: "customSwitchType",
                        ID: attrSwitchType,
                        type: 0x30,
                        write: true,
                        max: 0xff,
                    },
                    customDeviceModelNumber: {
                        name: "customDeviceModelNumber",
                        ID: attrDeviceModelNumber,
                        type: 0x30,
                        write: true,
                        max: 0xff,
                    },
                },
                commands: {},
                commandsResponse: {},
            }),
            m.deviceAddCustomCluster("genLevelCtrl", {
                name: "genLevelCtrl",
                ID: 0x0008,
                attributes: {
                    minLevel: {
                        name: "minLevel",
                        ID: 0x0002,
                        type: 0x20,
                        write: true,
                        max: 0xff,
                    },
                    maxLevel: {
                        name: "maxLevel",
                        ID: 0x0003,
                        type: 0x20,
                        write: true,
                        max: 0xff,
                    },
                },
                commands: {},
                commandsResponse: {},
            }),
            m.deviceAddCustomCluster("genScenes", {
                name: "genScenes",
                ID: 0x0005,
                attributes: {
                    customSceneId: {
                        name: "customSceneId",
                        ID: attrSceneId,
                        type: 0x20,
                        write: true,
                        max: 0xff,
                    },
                    customGroupId: {
                        name: "customGroupId",
                        ID: attrGroupId,
                        type: 0x21,
                        write: true,
                        max: 0xffff,
                    },
                },
                commands: {},
                commandsResponse: {},
            }),
            m.deviceEndpoints({
                endpoints: {
                    "1": 1,
                    "2": 2,
                    "3": 3,
                    "4": 4,
                    "5": 5,
                    "6": 6,
                },
            }),
            m.battery({
                percentageReportingConfig: batteryReporting,
            }),
            m.commandsOnOff({endpointNames: ["1", "2", "3", "4", "5", "6"], bind: false}),
            localActionExtend({
                endpointNames: ["1", "2", "3", "4", "5", "6"],
                reporting: false,
            }),
            m.commandsLevelCtrl({endpointNames: ["1", "2", "3", "4", "5", "6"], bind: false}),
            m.commandsColorCtrl({endpointNames: ["1", "2", "3", "4", "5", "6"], bind: false}),
            m.enumLookup({
                name: "switch_actions",
                endpointName: "1",
                lookup: {off: 0, on: 1, toggle: 2},
                cluster: "genOnOffSwitchCfg",
                attribute: "switchActions",
                description: "Actions switch",
            }),
            m.enumLookup({
                name: "switch_actions",
                endpointName: "2",
                lookup: {off: 0, on: 1, toggle: 2},
                cluster: "genOnOffSwitchCfg",
                attribute: "switchActions",
                description: "Actions switch",
            }),
            m.enumLookup({
                name: "switch_actions",
                endpointName: "3",
                lookup: {off: 0, on: 1, toggle: 2},
                cluster: "genOnOffSwitchCfg",
                attribute: "switchActions",
                description: "Actions switch",
            }),
            m.enumLookup({
                name: "switch_actions",
                endpointName: "4",
                lookup: {off: 0, on: 1, toggle: 2},
                cluster: "genOnOffSwitchCfg",
                attribute: "switchActions",
                description: "Actions switch",
            }),
            m.enumLookup({
                name: "switch_actions",
                endpointName: "5",
                lookup: {off: 0, on: 1, toggle: 2},
                cluster: "genOnOffSwitchCfg",
                attribute: "switchActions",
                description: "Actions switch",
            }),
            m.enumLookup({
                name: "switch_actions",
                endpointName: "6",
                lookup: {off: 0, on: 1, toggle: 2},
                cluster: "genOnOffSwitchCfg",
                attribute: "switchActions",
                description: "Actions switch",
            }),
            m.enumLookup({
                name: "switch_type",
                endpointName: "1",
                lookup: switchTypeLookup,
                cluster: "genOnOffSwitchCfg",
                attribute: "customSwitchType",
                description: "Switch type",
            }),
            m.enumLookup({
                name: "switch_type",
                endpointName: "2",
                lookup: switchTypeLookup,
                cluster: "genOnOffSwitchCfg",
                attribute: "customSwitchType",
                description: "Switch type",
            }),
            m.enumLookup({
                name: "switch_type",
                endpointName: "3",
                lookup: switchTypeLookup,
                cluster: "genOnOffSwitchCfg",
                attribute: "customSwitchType",
                description: "Switch type",
            }),
            m.enumLookup({
                name: "switch_type",
                endpointName: "4",
                lookup: switchTypeLookup,
                cluster: "genOnOffSwitchCfg",
                attribute: "customSwitchType",
                description: "Switch type",
            }),
            m.enumLookup({
                name: "switch_type",
                endpointName: "5",
                lookup: switchTypeLookup,
                cluster: "genOnOffSwitchCfg",
                attribute: "customSwitchType",
                description: "Switch type",
            }),
            m.enumLookup({
                name: "switch_type",
                endpointName: "6",
                lookup: switchTypeLookup,
                cluster: "genOnOffSwitchCfg",
                attribute: "customSwitchType",
                description: "Switch type",
            }),
            m.commandsScenes({endpointNames: ["1", "2", "3", "4", "5", "6"], bind: false}),
            m.numeric({
                name: "scene_id",
                endpointNames: ["1", "2", "3", "4", "5", "6"],
                access: "ALL",
                cluster: "genScenes",
                attribute: "customSceneId",
                valueMin: 0,
                valueMax: 255,
                description: "Scene ID",
            }),
            m.numeric({
                name: "group_id",
                endpointNames: ["1", "2", "3", "4", "5", "6"],
                access: "ALL",
                cluster: "genScenes",
                attribute: "customGroupId",
                valueMin: 0,
                valueMax: 65527,
                description: "Group ID for scenes",
            }),
            m.numeric({
                name: "min_level",
                endpointNames: ["1", "2", "3", "4", "5", "6"],
                access: "ALL",
                cluster: "genLevelCtrl",
                attribute: "minLevel",
                valueMin: 1,
                valueMax: 255,
                description: "Minimum level when decreasing",
            }),
            m.numeric({
                name: "max_level",
                endpointNames: ["1", "2", "3", "4", "5", "6"],
                access: "ALL",
                cluster: "genLevelCtrl",
                attribute: "maxLevel",
                valueMin: 1,
                valueMax: 255,
                description: "Maximum level when increasing",
            }),
        ],
        meta: {},
        ota: true,
};
