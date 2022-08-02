Hooks.on('changeSidebarTab', (directory) => {
    if (directory.tabName != 'journal')
        return;

    // ensure the custom button doesn't already exist
    let journalImportDataButton = directory.element.find('#import-data');
    if (journalImportDataButton.length > 0)
        return;

    // add custom button
    let actionButtonsHeaderRow = directory.element.find('div.header-actions');
    actionButtonsHeaderRow.append(`<button id="import-data"><i class="fas fa-book"></i> Import Journal Data</button>`);

    directory.element.on('click', '#import-data', (event) => {
        SimpleImporter.importJournalDataConfig.render(true);
    });
});

Hooks.on('init', () => SimpleImporter.initialise());

/**
 * Represents the simple-importer module.
 */
class SimpleImporter {
    /**
     * The id of the module.
     */
    static MODULE_ID = 'simple-importer';

    /**
     * The handlebar templates for the module.
     */
    static TEMPLATES = {
        /**
         * The template for ImportJournalDataConfig.
         */
        JOURNAL_DATA_IMPORT: `modules/${this.MODULE_ID}/templates/journal-data-import.hbs`
    }

    /**
     * Initialises the module.
     */
    static initialise() {
        this.importJournalDataConfig = new ImportJournalDataConfig();
    }
}

/**
 * The form for importing journal data.
 */
class ImportJournalDataConfig extends FormApplication {
    /**
     * Retrieves the default options for the form.
     */
    static get defaultOptions() {
        let overrides = {
            height: 'auto',
            id: 'import-journal-data',
            template: SimpleImporter.TEMPLATES.JOURNAL_DATA_IMPORT,
            title: 'Import Journal Data'
        };

        return foundry.utils.mergeObject(super.defaultOptions, overrides);
    }

    /**
     * Subscribes event handlers for the form.
     * @param {*} html The html of the form.
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', '#import-button', this._handleImportButtonClick);
    }

    /**
     * Invoked when the import button is clicked.
     * @param {*} event The event data.
     */
    async _handleImportButtonClick(event) {
        // ensure data was supplied
        const importData = $(this).siblings('textarea').val();
        if (!importData)
            return;

        // ensure the data is valid json
        let object;
        try {
            object = JSON.parse(importData);
        }
        catch (exception) {
            ui.notifications.error('Failed to parse JSON, error printed in console.')
            console.error(SimpleImporter.MODULE_ID, '|', exception);
            return;
        }

        console.log(object);
    }
}