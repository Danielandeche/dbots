import { localize } from '@deriv-com/translations';
import { modifyContextMenu } from '../../../utils';

window.Blockly.Blocks.payout = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: localize('Payout {{ contract_type }}', { contract_type: '%1' }),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PURCHASE_LIST',
                    options: [['', '']],
                },
            ],
            output: 'Number',
            outputShape: window.Blockly.OUTPUT_SHAPE_ROUND,
            colour: window.Blockly.Colours.Base.colour,
            colourSecondary: window.Blockly.Colours.Base.colourSecondary,
            colourTertiary: window.Blockly.Colours.Base.colourTertiary,
            tooltip: localize('This block returns the potential payout for the selected trade type'),
            category: window.Blockly.Categories.Before_Purchase,
        };
    },
    meta() {
        return {
            display_name: localize('Potential payout'),
            description: localize(
                'This block returns the potential payout for the selected trade type. This block can be used only in the "Purchase conditions" root block.'
            ),
        };
    },
    customContextMenu(menu) {
        modifyContextMenu(menu);
    },
    onchange: window.Blockly.Blocks.apollo_purchase.onchange,
    populatePurchaseList: window.Blockly.Blocks.apollo_purchase.populatePurchaseList,
    enforceLimitations: window.Blockly.Blocks.apollo_purchase.enforceLimitations,
};

window.Blockly.JavaScript.javascriptGenerator.forBlock.payout = block => {
    const purchaseList = block.getFieldValue('PURCHASE_LIST');

    const code = `Bot.getPayout('${purchaseList}')`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
};
