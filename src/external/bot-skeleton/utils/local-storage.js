import localForage from 'localforage';
import LZString from 'lz-string';
import { config } from '../constants';
import { save_types } from '../constants/save-type';
import DBotStore from '../scratch/dbot-store';

/**
 * Save workspace to localStorage
 * @param {String} save_type // constants/save_types.js (unsaved, local, googledrive)
 * @param {window.Blockly.Events} event // Blockly event object
 */
export const saveWorkspaceToRecent = async (xml, save_type = save_types.UNSAVED) => {
    const xml_dom = convertStrategyToIsDbot(xml);
    // Ensure strategies don't go through expensive conversion.
    xml.setAttribute('is_dbot', true);
    const {
        load_modal: { updateListStrategies },
        save_modal,
    } = DBotStore.instance;

    const workspace_id = window.Blockly.derivWorkspace.current_strategy_id || window.Blockly.utils.idGenerator.genUid();
    const workspaces = await getSavedWorkspaces();
    const current_xml = Blockly.Xml.domToText(xml_dom);
    const current_timestamp = Date.now();
    const current_workspace_index = workspaces.findIndex(workspace => workspace.id === workspace_id);

    if (current_workspace_index >= 0) {
        const current_workspace = workspaces[current_workspace_index];
        current_workspace.xml = current_xml;
        current_workspace.name = save_modal.bot_name;
        current_workspace.timestamp = current_timestamp;
        current_workspace.save_type = save_type;
    } else {
        workspaces.push({
            id: workspace_id,
            timestamp: current_timestamp,
            name: save_modal.bot_name || config().default_file_name,
            xml: current_xml,
            save_type,
        });
    }

    workspaces
        .sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        })
        .reverse();

    if (workspaces.length > 10) {
        workspaces.pop();
    }
    updateListStrategies(workspaces);
    localForage.setItem('saved_workspaces', LZString.compress(JSON.stringify(workspaces)));
};

export const getSavedWorkspaces = async () => {
    try {
        return JSON.parse(LZString.decompress(await localForage.getItem('saved_workspaces'))) || [];
    } catch (e) {
        return [];
    }
};

// XML Updator
export const updateApolloXML = xml => {
    // Find all block elements
    const blocks = xml.getElementsByTagName('block');

    // Convert blocks to an array if it's not already one
    const blocksArray = Array.isArray(blocks) ? blocks : Object.values(blocks);

    blocksArray.forEach(block => {
        // Access the 'type' attribute node from the NamedNodeMap
        const typeAttr = block.attributes.getNamedItem('type');

        // Check if the 'type' attribute's value is 'purchase' and update it if so
        if (typeAttr && typeAttr.value === 'purchase') {
            typeAttr.value = 'apollo_purchase';
        }
    });

    // Find all variable elements
    const variables = xml.getElementsByTagName('variable');

    // Iterate through each variable element
    Array.from(variables).forEach(variable => {
        // Check and add the 'type' attribute if missing
        if (!variable.hasAttribute('type')) {
            variable.setAttribute('type', '');
        }

        // Check and add the 'islocal' attribute if missing
        if (!variable.hasAttribute('islocal')) {
            variable.setAttribute('islocal', 'false');
        }

        // Check and add the 'iscloud' attribute if missing
        if (!variable.hasAttribute('iscloud')) {
            variable.setAttribute('iscloud', 'false');
        }
    });

    return xml;
};

export const removeExistingWorkspace = async workspace_id => {
    const workspaces = await getSavedWorkspaces();
    const current_workspace_index = workspaces.findIndex(workspace => workspace.id === workspace_id);

    if (current_workspace_index >= 0) {
        workspaces.splice(current_workspace_index, 1);
    }

    await localForage.setItem('saved_workspaces', LZString.compress(JSON.stringify(workspaces)));
};

export const convertStrategyToIsDbot = xml_dom => {
    if (!xml_dom) return;
    if (xml_dom.hasAttribute('collection') && xml_dom.getAttribute('collection') === 'true') {
        xml_dom.setAttribute('collection', 'true');
    }
    xml_dom.setAttribute('is_dbot', 'true');
    return xml_dom;
};
